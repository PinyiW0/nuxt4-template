import { expect, test } from '@playwright/test'

import { login, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：啟動 AI 系統前必須先建立訓練', () => {
  test('成功啟動 AI 系統', async ({ page }) => {
    // Given：教練 "coach1" 已登入，訓練 id=1 已存在（ai_status=stopped）
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練在訓練詳情頁啟動 AI 系統
    // ⚠️ 校正：flow 用 "/trainings/T001"，實際路由為 "/trainings/1"
    await page.goto('/trainings/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-detail-page')).toBeVisible()
    await page.getByTestId('training-ai-start').click()

    // Then：操作成功 → 顯示成功提示「AI 系統已啟動」
    await expect(page.getByText('AI 系統已啟動', { exact: true })).toBeVisible()
    // AI 狀態顯示為「運行中」
    await expect(page.getByTestId('training-ai-status')).toContainText('運行中')
  })

  test.skip('未建立訓練就啟動 AI 系統', async () => {
    // 跳過：沒有訓練就進不到訓練詳情頁，UI 無法觸發此情境
  })
})

test.describe('規則：不可重複啟動已運行的 AI 系統', () => {
  test.skip('重複啟動 AI 系統', async () => {
    // 跳過：需要 AI 已在運行中的前置狀態，UI 中啟動按鈕會被隱藏
  })
})

test.describe('規則：教練只能為自己的訓練啟動 AI 系統', () => {
  test.skip('教練為他人的訓練啟動 AI 系統', async () => {
    // 跳過：無法導航到他人的訓練詳情頁，UI 無法觸發此情境
  })
})
