import type { TestWorld } from '../../helpers/world'
import { Then } from 'quickpickle'
import { expect } from 'vitest'

Then('操作成功', async (world: TestWorld) => {
  expect(world.operationResult?.success).toBe(true)
})

Then('操作失敗', async (world: TestWorld) => {
  expect(world.operationResult?.success).toBe(false)
})

Then('系統顯示 {string}', async (world: TestWorld, message: string) => {
  expect(world.operationResult?.message).toBe(message)
})

Then('系統產生 {string} 事件', async (world: TestWorld, eventName: string) => {
  const events = world.eventBus.getEvents()
  expect(events).toContain(eventName)
})

Then('無任何狀態變更', async (world: TestWorld) => {
  // No login result should exist (user was not logged in)
  expect(world.loginResult).toBeUndefined()
})
