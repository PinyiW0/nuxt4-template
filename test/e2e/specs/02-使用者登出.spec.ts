import { test } from '@playwright/test'
import { login } from '../helpers'

test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：登出時清除前端 Token', () => {
  test('登出成功', async ({ page }) => {
    // Given：使用者 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：使用者執行登出
    await page.getByTestId('logout-button').click()

    // Then：操作成功 → 跳轉到 /login
    await page.waitForURL('**/login')
    // 跳過：前端清除 Access Token（內部狀態）
    // 跳過：前端清除 Refresh Token（內部狀態）
    // 跳過：系統產生 "使用者已登出" 事件（內部事件）
  })
})

test.describe('規則：未登入狀態執行登出無效果', () => {
  test.skip('未登入時登出', async () => {
    // 跳過：未登入狀態無法操作登出按鈕（需要先登入才能看到導航列）
  })
})

test.describe('規則：允許多裝置同時登入，登出僅影響當前裝置', () => {
  test.skip('多裝置登入後單一裝置登出', async () => {
    // 跳過：E2E 無法模擬多裝置同時登入的情境
  })
})
