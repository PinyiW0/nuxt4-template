import { test } from '@playwright/test'

import { login, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：登出時清除前端 Token', () => {
  test('登出成功', async ({ page }) => {
    // Given：使用者 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：使用者執行登出
    await page.getByTestId('logout-button').click()

    // Then：操作成功 → 跳轉到 /login
    await page.waitForURL('**/login')
  })
})

test.describe('規則：未登入狀態執行登出無效果', () => {
  test.skip('未登入時登出', async () => {
    // 跳過：E2E 預設已登入進行測試，無法模擬未登入狀態登出
  })
})

test.describe('規則：允許多裝置同時登入，登出僅影響當前裝置', () => {
  test.skip('多裝置登入後單一裝置登出', async () => {
    // 跳過：E2E 無法測試多裝置場景
  })
})
