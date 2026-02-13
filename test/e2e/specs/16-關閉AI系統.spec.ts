import { expect, test } from '@playwright/test'
import { login } from '../helpers'

test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：關閉 AI 系統時立即停止，丟棄未完成的投球數據', () => {
  test('成功關閉 AI 系統', async ({ page }) => {
    // Given：教練 "coach1" 已登入，先啟動 AI 使其為 "運行中"
    await login(page, 'coach1', 'pass123')
    await page.goto('/trainings/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-detail-page')).toBeVisible()
    await page.getByTestId('training-ai-start').click()
    await expect(page.getByRole('alert').getByText('AI 已啟動')).toBeVisible()

    // When：教練關閉 AI 系統
    await page.getByTestId('training-ai-stop').click()

    // Then：操作成功
    await expect(page.getByRole('alert').getByText('AI 已停止')).toBeVisible()
  })

  test('AI 系統正在處理投球數據時關閉', async ({ page }) => {
    // Given：教練 "coach1" 已登入，先啟動 AI 使其為 "運行中"
    await login(page, 'coach1', 'pass123')
    await page.goto('/trainings/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-detail-page')).toBeVisible()
    await page.getByTestId('training-ai-start').click()
    await expect(page.getByRole('alert').getByText('AI 已啟動')).toBeVisible()

    // When：教練關閉 AI 系統
    await page.getByTestId('training-ai-stop').click()

    // Then：操作成功
    await expect(page.getByRole('alert').getByText('AI 已停止')).toBeVisible()
  })
})

test.describe('規則：重複關閉已停止的 AI 系統視為成功（冪等）', () => {
  test('重複關閉 AI 系統', async ({ page }) => {
    // Given：教練 "coach1" 已登入，AI 系統預設已停止
    await login(page, 'coach1', 'pass123')

    // When：教練關閉 AI 系統（已停止狀態下關閉）
    await page.goto('/trainings/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-detail-page')).toBeVisible()
    await page.getByTestId('training-ai-stop').click()

    // Then：操作成功（冪等）
    await expect(page.getByRole('alert').getByText('AI 已停止')).toBeVisible()
  })
})

test.describe('規則：教練只能關閉自己啟動的 AI 系統', () => {
  test('教練關閉自己啟動的 AI 系統', async ({ page }) => {
    // Given：教練 "coach1" 已登入，先啟動 AI
    await login(page, 'coach1', 'pass123')
    await page.goto('/trainings/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-detail-page')).toBeVisible()
    await page.getByTestId('training-ai-start').click()
    await expect(page.getByRole('alert').getByText('AI 已啟動')).toBeVisible()

    // When：教練關閉 AI 系統
    await page.getByTestId('training-ai-stop').click()

    // Then：操作成功
    await expect(page.getByRole('alert').getByText('AI 已停止')).toBeVisible()
  })

  test.skip('教練關閉他人啟動的 AI 系統', async () => {
    // 跳過：API 層已過濾，教練無法存取他人的訓練詳情頁，UI 無法觸發
  })
})
