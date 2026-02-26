import { expect, test } from '@playwright/test'

import { login, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：關閉 AI 系統時立即停止，丟棄未完成的投球數據', () => {
  test('成功關閉 AI 系統', async ({ page }) => {
    // Given：教練 "coach1" 已登入，訓練 id=4 的 AI 正在運行中
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練在訓練詳情頁關閉 AI 系統
    // ⚠️ 校正：training 4 有 SSE（ai_status='running'），用 commit 避免 networkidle 卡住
    // 先設定 SSE 請求監聽（SSE 連線在 onMounted 後建立 = hydration 完成信號）
    const ssePromise = page.waitForRequest(req => req.url().includes('/pitches/stream'))
    await page.goto('/trainings/4', { waitUntil: 'domcontentloaded' })
    await ssePromise
    await expect(page.getByTestId('training-detail-page')).toBeVisible()
    const stopBtn = page.getByTestId('training-ai-stop')
    await expect(stopBtn).toBeVisible()
    await stopBtn.click()

    // Then：操作成功 → 顯示成功提示「AI 系統已關閉」
    await expect(page.getByText('AI 系統已關閉', { exact: true })).toBeVisible({ timeout: 10000 })
    // AI 狀態顯示為「已停止」
    await expect(page.getByTestId('training-ai-status')).toContainText('已停止')
  })

  test.skip('AI 系統正在處理投球數據時關閉', async () => {
    // 跳過：需要控制 AI 正在處理投球數據的內部狀態，UI 無法設定
  })
})

test.describe('規則：重複關閉已停止的 AI 系統視為成功（冪等）', () => {
  test.skip('重複關閉 AI 系統', async () => {
    // 跳過：需要 AI 已關閉的前置狀態，UI 中關閉按鈕會被隱藏
  })
})

test.describe('規則：教練只能關閉自己啟動的 AI 系統', () => {
  test.skip('教練關閉他人啟動的 AI 系統', async () => {
    // 跳過：無法導航到他人的訓練詳情頁，UI 無法觸發此情境
  })
})
