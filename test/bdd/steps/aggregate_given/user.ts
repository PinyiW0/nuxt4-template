import type { DataTable } from 'quickpickle'
import type { TestWorld } from '../../helpers/world'
import { Given } from 'quickpickle'
import { createAuthService } from '../../helpers/authService'
import { createEventBus } from '../../helpers/eventBus'
import { createUserRepository } from '../../helpers/userRepository'

Given('系統中有以下使用者：', async (world: TestWorld, dataTable: DataTable) => {
  const users = dataTable.hashes()

  world.userRepository = createUserRepository()
  world.eventBus = createEventBus()
  world.events = []
  world.timeProvider = () => new Date()

  world.authService = createAuthService({
    userRepository: world.userRepository,
    eventBus: world.eventBus,
    timeProvider: world.timeProvider,
  })

  users.forEach((row) => {
    world.userRepository.save({
      account: row.account || row['帳號'] || '',
      password: row.password || row['密碼'] || 'default_password',
      role: row.role || row['角色'] || '',
      status: row.status || row['狀態'] || 'active',
      failedAttempts: Number.parseInt(row.failed_attempts) || 0,
      lockedUntil: row.locked_until ? new Date(row.locked_until) : null,
    })
  })
})

Given('使用者 {string} 尚未登入', async (world: TestWorld, account: string) => {
  world.currentUser = account
})

Given('使用者 {string} 不存在', async (world: TestWorld, account: string) => {
  world.currentUser = account
})

Given('使用者 {string} 已連續登入失敗 {int} 次', async (world: TestWorld, account: string, times: number) => {
  world.currentUser = account
  world.userRepository.update(account, { failedAttempts: times })
})

Given('使用者 {string} 帳號已被鎖定', async (world: TestWorld, account: string) => {
  world.currentUser = account
  const futureDate = new Date(Date.now() + 15 * 60 * 1000)
  world.userRepository.update(account, {
    lockedUntil: futureDate,
    failedAttempts: 5,
  })
})

Given('使用者 {string} 已在裝置 A 登入', async (world: TestWorld, account: string) => {
  world.currentUser = account
  const user = world.userRepository.findByAccount(account)
  if (user) {
    const result = world.authService.loginDevice(account, user.password, 'A')
    if (!world.deviceTokens)
      world.deviceTokens = {}
    world.deviceTokens.A = { accessToken: result.accessToken, refreshToken: result.refreshToken }
  }
})

Given('使用者 {string} 已在裝置 B 登入', async (world: TestWorld, account: string) => {
  world.currentUser = account
  const user = world.userRepository.findByAccount(account)
  if (user) {
    const result = world.authService.loginDevice(account, user.password, 'B')
    if (!world.deviceTokens)
      world.deviceTokens = {}
    world.deviceTokens.B = { accessToken: result.accessToken, refreshToken: result.refreshToken }
  }
})

Given('使用者 {string} 帳號鎖定已過期', async (world: TestWorld, account: string) => {
  world.currentUser = account
  const pastDate = new Date(Date.now() - 1000)
  world.userRepository.update(account, {
    lockedUntil: pastDate,
    failedAttempts: 5,
  })
})
