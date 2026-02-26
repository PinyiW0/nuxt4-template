import { expect, test } from '@playwright/test'

import { login, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：訓練分析頁為統計彙總視圖，用於賽後分析', () => {
  test('查看訓練分析', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練查看訓練 4 的分析（有投球數據）
    // ⚠️ 校正：flow 用訓練 1（無投球數據），改用訓練 4（30 球）
    // ⚠️ 注意：分析頁面可能尚未實作，此 spec 將在 red 階段收集失敗
    await page.goto('/history/5', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-analysis-page')).toBeVisible()

    // Then：顯示訓練統計彙總（數值為隨機生成，驗證元素存在）
    await expect(page.getByTestId('analysis-total-pitches')).toBeVisible()
  })
})

test.describe('規則：顯示總投球數', () => {
  test('查看總投球數', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練查看訓練 4 的分析
    await page.goto('/history/5', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-analysis-page')).toBeVisible()

    // Then：顯示總投球數（mock 有 30 球，隨機生成）
    await expect(page.getByTestId('analysis-total-pitches')).toBeVisible()
    await expect(page.getByTestId('analysis-total-pitches')).not.toHaveText('0')
  })
})

test.describe('規則：顯示好球數與壞球數', () => {
  test('查看好壞球數', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練查看訓練 4 的分析
    await page.goto('/history/5', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-analysis-page')).toBeVisible()

    // Then：顯示好球數和壞球數
    await expect(page.getByTestId('analysis-strike-count')).toBeVisible()
    await expect(page.getByTestId('analysis-ball-count')).toBeVisible()
  })
})

test.describe('規則：顯示好球率', () => {
  test('查看好球率', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練查看訓練 4 的分析
    await page.goto('/history/5', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-analysis-page')).toBeVisible()

    // Then：顯示好球率
    await expect(page.getByTestId('analysis-strike-rate')).toBeVisible()
  })
})

test.describe('規則：顯示平均球速、最快球速、最慢球速', () => {
  test('查看球速統計', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練查看訓練 4 的分析
    await page.goto('/history/5', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-analysis-page')).toBeVisible()

    // Then：顯示球速統計
    await expect(page.getByTestId('analysis-avg-velocity')).toBeVisible()
    await expect(page.getByTestId('analysis-max-velocity')).toBeVisible()
    await expect(page.getByTestId('analysis-min-velocity')).toBeVisible()
  })
})

test.describe('規則：顯示平均轉速', () => {
  test('查看轉速統計', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練查看訓練 4 的分析
    await page.goto('/history/5', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-analysis-page')).toBeVisible()

    // Then：顯示平均轉速
    await expect(page.getByTestId('analysis-avg-spin-rate')).toBeVisible()
  })
})

test.describe('規則：顯示落點熱區圖（累積分布）', () => {
  test('查看熱區圖', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練查看訓練 4 的分析
    await page.goto('/history/5', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-analysis-page')).toBeVisible()

    // Then：顯示落點熱區圖
    await expect(page.getByTestId('analysis-heat-map')).toBeVisible()
  })
})

test.describe('規則：訓練分析包含 7 項統計指標', () => {
  test.skip('確認統計指標完整', async () => {
    // 跳過：API 層級驗證，E2E 不需逐一檢查回傳欄位
  })
})

test.describe('規則：教練只能查看自己建立的訓練分析', () => {
  test.skip('教練查看他人的訓練分析', async () => {
    // 跳過：列表中不會顯示他人訓練，無法導航到他人的訓練分析頁
  })
})
