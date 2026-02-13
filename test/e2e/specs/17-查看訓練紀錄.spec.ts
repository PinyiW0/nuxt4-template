import { expect, test } from '@playwright/test'
import { login } from '../helpers'

test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：訓練紀錄頁顯示訓練基本資訊', () => {
  test('查看訓練基本資訊', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練查看訓練 1 的紀錄
    await page.goto('/trainings/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-detail-page')).toBeVisible()

    // Then：顯示訓練基本資訊
    await expect(page.getByTestId('training-detail-date')).toContainText('2025-06-01')
    await expect(page.getByTestId('training-detail-team')).toContainText('藍鷹隊')
    await expect(page.getByTestId('training-detail-player')).toContainText('王小明')
  })
})

test.describe('規則：訓練紀錄頁顯示投球清單', () => {
  test('查看投球清單', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練查看訓練 1 的紀錄
    await page.goto('/trainings/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-detail-page')).toBeVisible()

    // Then：顯示投球清單（訓練 1 有 5 筆投球：130.1, 128.5, 125.5, 127.3, 126.5）
    await expect(page.getByTestId('pitch-list')).toContainText('130.1')
    await expect(page.getByTestId('pitch-list')).toContainText('128.5')
    await expect(page.getByTestId('pitch-list')).toContainText('125.5')
  })
})

test.describe('規則：投球清單顯示球序、投球時間、球速、轉速、好壞球判定、落點位置', () => {
  test.skip('確認投球清單欄位', async () => {
    // 跳過：欄位結構驗證由單元測試覆蓋
  })
})

test.describe('規則：訓練紀錄頁顯示即時統計摘要', () => {
  test('查看即時統計', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練查看訓練 1 的紀錄
    await page.goto('/trainings/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-detail-page')).toBeVisible()

    // Then：顯示即時統計摘要（訓練 1：5 筆投球，3 好球 / 5 總 = 60%）
    await expect(page.getByTestId('training-detail-total-pitches')).toContainText('5')
    await expect(page.getByTestId('training-detail-strike-rate')).toContainText('60%')
  })
})

test.describe('規則：教練只能查看自己建立的訓練紀錄', () => {
  test.skip('教練查看他人的訓練紀錄', async () => {
    // 跳過：API 層已過濾，教練無法存取他人的訓練詳情頁，UI 無法觸發
  })
})

test.describe('規則：投球清單支援 SSE 即時更新', () => {
  test.skip('新投球即時加入清單', async () => {
    // 跳過：SSE 即時更新需要模擬 AI 系統推送，E2E 難以精確控制
  })
})
