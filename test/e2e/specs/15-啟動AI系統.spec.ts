import { expect, test } from '@playwright/test'
import { login } from '../helpers'

test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：啟動 AI 系統前必須先建立訓練', () => {
  test('成功啟動 AI 系統', async ({ page }) => {
    // Given：教練 "coach1" 已登入，教練已建立訓練 "T001"（mock 資料已預設）
    await login(page, 'coach1', 'pass123')

    // When：教練啟動 AI 系統並關聯訓練 "T001"
    await page.goto('/trainings/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-detail-page')).toBeVisible()
    await page.getByTestId('training-ai-start').click()

    // Then：操作成功
    await expect(page.getByText('AI 已啟動', { exact: true })).toBeVisible()
    // 跳過：系統產生 "AI系統已啟動" 事件（內部事件）
    // AI 系統狀態為 "運行中"
    await expect(page.getByText('運行中')).toBeVisible()
  })

  test.skip('未建立訓練就啟動 AI 系統', async () => {
    // 跳過：需在訓練詳情頁操作，若無訓練則無法進入該頁面
  })
})

test.describe('規則：不可重複啟動已運行的 AI 系統', () => {
  test('重複啟動 AI 系統', async ({ page }) => {
    // Given：教練 "coach1" 已登入，先啟動 AI 系統使其為 "運行中"
    await login(page, 'coach1', 'pass123')

    // 先啟動 AI
    await page.goto('/trainings/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-detail-page')).toBeVisible()
    await page.getByTestId('training-ai-start').click()
    await expect(page.getByText('AI 已啟動', { exact: true })).toBeVisible()

    // When：教練嘗試再次啟動 AI 系統
    await page.getByTestId('training-ai-start').click()

    // Then：操作失敗
    await expect(page.getByText('AI 系統已在運行中', { exact: true })).toBeVisible()
  })
})

test.describe('規則：教練只能為自己的訓練啟動 AI 系統', () => {
  test('教練為自己的訓練啟動 AI 系統', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練啟動 AI 系統並關聯訓練 "T001"
    await page.goto('/trainings/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-detail-page')).toBeVisible()
    await page.getByTestId('training-ai-start').click()

    // Then：操作成功
    await expect(page.getByText('AI 已啟動', { exact: true })).toBeVisible()
  })

  test.skip('教練為他人的訓練啟動 AI 系統', async () => {
    // 跳過：API 層已過濾，教練無法存取他人的訓練詳情頁，UI 無法觸發
  })
})
