import type { TestWorld } from '../../helpers/world'
import { Given } from 'quickpickle'

Given('Access Token 已過期', async (world: TestWorld) => {
  if (world.loginResult) {
    world.loginResult.accessTokenExpiresAt = new Date(Date.now() - 1000)
  }
})

Given('Refresh Token 仍有效', async (_world: TestWorld) => {
  // Refresh token is valid by default after login - no action needed
})

Given('Refresh Token 已過期', async (world: TestWorld) => {
  if (world.loginResult) {
    const expiredDate = new Date(Date.now() - 1000)
    world.loginResult.refreshTokenExpiresAt = expiredDate
    world.authService._registerTokens(world.loginResult.refreshToken, expiredDate)
  }
})
