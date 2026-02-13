import type { TestWorld } from '../../helpers/world'
import { Then } from 'quickpickle'
import { expect } from 'vitest'

const ONE_HOUR_MS = 60 * 60 * 1000
const TWO_HOURS_MS = 2 * 60 * 60 * 1000
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
const FIFTEEN_MIN_MS = 15 * 60 * 1000
const TOLERANCE_MS = 1000

Then('系統回傳 Access Token（有效期 1-2 小時）', async (world: TestWorld) => {
  expect(world.loginResult?.accessToken).toBeDefined()
  expect(world.loginResult!.accessToken.length).toBeGreaterThan(0)

  const diffMs = world.loginResult!.accessTokenExpiresAt.getTime() - Date.now()
  expect(diffMs).toBeGreaterThanOrEqual(ONE_HOUR_MS - TOLERANCE_MS)
  expect(diffMs).toBeLessThanOrEqual(TWO_HOURS_MS + TOLERANCE_MS)
})

Then('系統回傳 Refresh Token（有效期 7 天）', async (world: TestWorld) => {
  expect(world.loginResult?.refreshToken).toBeDefined()
  expect(world.loginResult!.refreshToken.length).toBeGreaterThan(0)

  const diffMs = world.loginResult!.refreshTokenExpiresAt.getTime() - Date.now()
  expect(diffMs).toBeGreaterThanOrEqual(SEVEN_DAYS_MS - TOLERANCE_MS)
  expect(diffMs).toBeLessThanOrEqual(SEVEN_DAYS_MS + TOLERANCE_MS)
})

Then('帳號 {string} 被鎖定 15 分鐘', async (world: TestWorld, account: string) => {
  const user = world.userRepository.findByAccount(account)
  expect(user).toBeDefined()
  expect(user!.lockedUntil).not.toBeNull()

  const lockedUntil = user!.lockedUntil instanceof Date ? user!.lockedUntil : new Date(user!.lockedUntil)
  const diffMs = lockedUntil.getTime() - Date.now()
  expect(diffMs).toBeGreaterThan(0)
  expect(diffMs).toBeLessThanOrEqual(FIFTEEN_MIN_MS + TOLERANCE_MS)
})

Then('登入失敗次數重置為 0', async (world: TestWorld) => {
  const user = world.userRepository.findByAccount(world.currentUser!)
  expect(user).toBeDefined()
  expect(user!.failedAttempts).toBe(0)
})

Then('系統回傳新的 Access Token', async (world: TestWorld) => {
  expect(world.loginResult?.accessToken).toBeDefined()
  expect(world.loginResult!.accessToken.length).toBeGreaterThan(0)
})

Then('前端清除 Access Token', async (world: TestWorld) => {
  expect(world.loginResult?.accessToken).toBeUndefined()
})

Then('前端清除 Refresh Token', async (world: TestWorld) => {
  expect(world.loginResult?.refreshToken).toBeUndefined()
})

Then('裝置 A 的 Token 已清除', async (world: TestWorld) => {
  const session = world.authService.getDeviceSession('A')
  expect(session).toBeNull()
})

Then('裝置 B 的 Token 仍有效', async (world: TestWorld) => {
  const session = world.authService.getDeviceSession('B')
  expect(session).not.toBeNull()
  expect(session!.accessToken).toBeDefined()
})
