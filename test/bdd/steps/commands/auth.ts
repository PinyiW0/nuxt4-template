import type { TestWorld } from '../../helpers/world'
import { Given, When } from 'quickpickle'

When('使用者以帳號 {string} 密碼 {string} 登入', async (world: TestWorld, account: string, password: string) => {
  try {
    const result = world.authService.login(account, password)
    world.loginResult = result
    world.operationResult = { success: true }
    world.currentUser = account
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

Given('使用者 {string} 已登入', async (world: TestWorld, account: string) => {
  world.currentUser = account
  const user = world.userRepository.findByAccount(account)
  if (user) {
    world.loginResult = world.authService.login(account, user.password)
  }
})

Given('教練 {string} 已登入', async (world: TestWorld, account: string) => {
  world.currentUser = account
  world.currentUserRole = '教練'
  const user = world.userRepository.findByAccount(account)
  if (user) {
    world.loginResult = world.authService.login(account, user.password)
  }
})

Given('管理者 {string} 已登入', async (world: TestWorld, account: string) => {
  world.currentUser = account
  world.currentUserRole = '管理者'
  const user = world.userRepository.findByAccount(account)
  if (user) {
    world.loginResult = world.authService.login(account, user.password)
  }
})

When('使用者執行登出', async (world: TestWorld) => {
  try {
    world.authService.logout()
    world.loginResult = undefined
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('使用者在裝置 A 執行登出', async (world: TestWorld) => {
  try {
    world.authService.logoutDevice('A')
    if (world.deviceTokens) {
      world.deviceTokens.A = null
    }
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('使用者以 Refresh Token 請求新 Token', async (world: TestWorld) => {
  try {
    const refreshToken = world.loginResult?.refreshToken
    if (!refreshToken) {
      throw new Error('請重新登入')
    }
    const result = world.authService.refreshToken(refreshToken)
    world.operationResult = { success: true }
    world.loginResult = {
      ...world.loginResult!,
      accessToken: result.accessToken,
    }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})
