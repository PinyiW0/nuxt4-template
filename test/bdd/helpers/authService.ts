import type { EventBus } from './eventBus'
import type { UserRepository } from './userRepository'

const MAX_FAILED_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000 // 15 minutes
const ACCESS_TOKEN_DURATION_MS = 2 * 60 * 60 * 1000 // 2 hours
const REFRESH_TOKEN_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export interface LoginResult {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: Date
  refreshTokenExpiresAt: Date
}

export interface AuthServiceDeps {
  userRepository: UserRepository
  eventBus: EventBus
  timeProvider: () => Date
}

export function createAuthService({ userRepository, eventBus, timeProvider }: AuthServiceDeps) {
  // Store issued tokens for refresh validation
  const issuedTokens = new Map<string, { accessToken: string, refreshToken: string, refreshTokenExpiresAt: Date }>()
  // Store device sessions
  const deviceSessions = new Map<string, { accessToken: string, refreshToken: string }>()

  function generateToken(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).substring(2)}_${Date.now()}`
  }

  return {
    login(account: string, password: string): LoginResult {
      const now = timeProvider()
      const user = userRepository.findByAccount(account)

      if (!user) {
        throw new Error('帳號或密碼錯誤')
      }

      // Check if account is locked
      if (user.lockedUntil) {
        const lockedUntil = user.lockedUntil instanceof Date ? user.lockedUntil : new Date(user.lockedUntil)
        if (lockedUntil > now) {
          throw new Error('帳號已鎖定，請稍後再試')
        }
        // Lock expired, reset
        userRepository.update(account, {
          failedAttempts: 0,
          lockedUntil: null,
        })
      }

      // Check password
      if (user.password !== password) {
        const newFailedAttempts = (user.failedAttempts || 0) + 1

        if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
          const lockedUntil = new Date(now.getTime() + LOCK_DURATION_MS)
          userRepository.update(account, {
            failedAttempts: newFailedAttempts,
            lockedUntil,
          })
          throw new Error('帳號已鎖定，請 15 分鐘後再試')
        }

        userRepository.update(account, {
          failedAttempts: newFailedAttempts,
        })
        throw new Error('帳號或密碼錯誤')
      }

      // Login success - reset failed attempts
      userRepository.update(account, {
        failedAttempts: 0,
        lockedUntil: null,
      })

      const accessToken = generateToken('at')
      const refreshToken = generateToken('rt')
      const accessTokenExpiresAt = new Date(now.getTime() + ACCESS_TOKEN_DURATION_MS)
      const refreshTokenExpiresAt = new Date(now.getTime() + REFRESH_TOKEN_DURATION_MS)

      // Store token info for refresh
      issuedTokens.set(refreshToken, {
        accessToken,
        refreshToken,
        refreshTokenExpiresAt,
      })

      eventBus.emit('使用者已登入')

      return {
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
      }
    },

    refreshToken(refreshToken: string): { accessToken: string } {
      const tokenInfo = issuedTokens.get(refreshToken)

      if (!tokenInfo) {
        throw new Error('請重新登入')
      }

      const now = timeProvider()
      if (tokenInfo.refreshTokenExpiresAt <= now) {
        issuedTokens.delete(refreshToken)
        throw new Error('請重新登入')
      }

      const newAccessToken = generateToken('at')
      tokenInfo.accessToken = newAccessToken

      return { accessToken: newAccessToken }
    },

    logout(): void {
      eventBus.emit('使用者已登出')
    },

    logoutDevice(deviceId: string): void {
      deviceSessions.delete(deviceId)
      eventBus.emit('使用者已登出')
    },

    loginDevice(account: string, password: string, deviceId: string): LoginResult {
      const result = this.login(account, password)
      deviceSessions.set(deviceId, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      })
      return result
    },

    getDeviceSession(deviceId: string): { accessToken: string, refreshToken: string } | null {
      return deviceSessions.get(deviceId) ?? null
    },

    // For testing: manually register a token pair
    _registerTokens(refreshToken: string, refreshTokenExpiresAt: Date): void {
      issuedTokens.set(refreshToken, {
        accessToken: generateToken('at'),
        refreshToken,
        refreshTokenExpiresAt,
      })
    },
  }
}

export type AuthService = ReturnType<typeof createAuthService>
