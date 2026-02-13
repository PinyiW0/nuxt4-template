// AI 系統狀態驗證已合併至 aggregate_given/ai.ts
// 因 quickpickle 共用 step registry，Given/Then 同名 step 會衝突

import type { TestWorld } from '../../helpers/world'
import { Then } from 'quickpickle'
import { expect } from 'vitest'

// Feature 16: 未完成的投球數據被丟棄
Then('未完成的投球數據被丟棄', async (world: TestWorld) => {
  expect(world.aiService.isProcessingPitch()).toBe(false)
})

// Feature 16: 不產生新的事件
Then('不產生新的 {string} 事件', async (world: TestWorld, eventName: string) => {
  // 清除事件後再執行操作時，應該沒有新事件
  // 這裡檢查最近一次操作沒有產生該事件
  // 由於冪等操作（關閉已關閉的 AI），stopAi 不會 emit 事件
  const events = world.eventBus.getEvents()
  // 過濾掉操作前已存在的事件（Background 中可能已產生過）
  // 冪等操作情境：AI 狀態已是關閉，stopAi 不應該產生新事件
  // 計算此事件出現的次數，應該為 0（因為 Background 沒有 emit 過此事件，且冪等 stopAi 也不會）
  const count = events.filter((e: string) => e === eventName).length
  expect(count).toBe(0)
})
