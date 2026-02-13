import { expect, test } from '@playwright/test'
import { login } from '../helpers'

test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：好球帶可調整上緣、下緣（寬度固定為本壘板寬度 43 公分）', () => {
  test('成功調整好球帶高度', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練將訓練 "T001" 的好球帶設定為：上緣 130、下緣 55
    await page.goto('/trainings/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-detail-page')).toBeVisible()
    await page.getByTestId('strike-zone-setting').click()
    await expect(page.getByTestId('strike-zone-modal')).toBeVisible()
    await page.getByTestId('strike-zone-top').clear()
    await page.getByTestId('strike-zone-top').fill('130')
    await page.getByTestId('strike-zone-bottom').clear()
    await page.getByTestId('strike-zone-bottom').fill('55')
    await page.getByTestId('strike-zone-save').click()

    // Then：操作成功
    await expect(page.getByText('好球帶設定已更新', { exact: true })).toBeVisible()
    // 跳過：系統產生 "好球帶範圍已更新" 事件（內部事件）
  })
})

test.describe('規則：好球帶高度上緣範圍為 90-150 公分', () => {
  test.skip('上緣低於下限', async () => {
    // 跳過：表單驗證由單元測試覆蓋
  })

  test.skip('上緣超出上限', async () => {
    // 跳過：表單驗證由單元測試覆蓋
  })
})

test.describe('規則：好球帶高度下緣範圍為 30-70 公分', () => {
  test.skip('下緣低於下限', async () => {
    // 跳過：表單驗證由單元測試覆蓋
  })

  test.skip('下緣超出上限', async () => {
    // 跳過：表單驗證由單元測試覆蓋
  })
})

test.describe('規則：好球帶上緣必須大於下緣', () => {
  test.skip('上緣小於等於下緣', async () => {
    // 跳過：表單驗證由單元測試覆蓋
  })
})

test.describe('規則：教練只能設定自己訓練的好球帶', () => {
  test('教練設定自己訓練的好球帶', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練設定訓練 "T001" 的好球帶範圍
    await page.goto('/trainings/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-detail-page')).toBeVisible()
    await page.getByTestId('strike-zone-setting').click()
    await expect(page.getByTestId('strike-zone-modal')).toBeVisible()
    await page.getByTestId('strike-zone-top').clear()
    await page.getByTestId('strike-zone-top').fill('130')
    await page.getByTestId('strike-zone-bottom').clear()
    await page.getByTestId('strike-zone-bottom').fill('55')
    await page.getByTestId('strike-zone-save').click()

    // Then：操作成功
    await expect(page.getByText('好球帶設定已更新', { exact: true })).toBeVisible()
  })

  test.skip('教練設定他人訓練的好球帶', async () => {
    // 跳過：API 層已過濾，教練無法存取他人的訓練詳情頁，UI 無法觸發
  })
})
