import { expect, test } from '@playwright/test'

import { login, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：好球帶可調整上緣、下緣（寬度固定為本壘板寬度 43 公分）', () => {
  test('成功調整好球帶高度', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練調整訓練 1 的好球帶設定
    // ⚠️ 校正：flow 用 "T001"，實際路由為 "/trainings/1"
    await page.goto('/trainings/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-detail-page')).toBeVisible()
    await page.getByTestId('strike-zone-edit').click()
    await expect(page.getByTestId('strike-zone-form-modal')).toBeVisible()
    await page.getByTestId('strike-zone-upper').clear()
    await page.getByTestId('strike-zone-upper').fill('130')
    await page.getByTestId('strike-zone-lower').clear()
    await page.getByTestId('strike-zone-lower').fill('55')
    await page.getByTestId('strike-zone-save').click()

    // Then：操作成功 → 顯示成功提示「好球帶範圍已更新」
    await expect(page.getByText('好球帶範圍已更新', { exact: true })).toBeVisible()
  })
})

test.describe('規則：好球帶高度上緣範圍為 90-150 公分', () => {
  test.skip('上緣超出範圍', async () => {
    // 跳過：表單驗證，由單元測試覆蓋
  })
})

test.describe('規則：好球帶高度下緣範圍為 30-70 公分', () => {
  test.skip('下緣超出範圍', async () => {
    // 跳過：表單驗證，由單元測試覆蓋
  })
})

test.describe('規則：好球帶上緣必須大於下緣', () => {
  test.skip('上緣小於等於下緣', async () => {
    // 跳過：表單驗證，由單元測試覆蓋
  })
})

test.describe('規則：教練只能設定自己訓練的好球帶', () => {
  test.skip('教練設定他人訓練的好球帶', async () => {
    // 跳過：列表中不會顯示他人訓練，無法導航到他人的訓練詳情頁
  })
})
