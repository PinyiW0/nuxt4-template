import { expect, test } from '@playwright/test'
import { login, selectOption } from '../helpers'

test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：每次訓練只能指定一名受測選手', () => {
  test('成功建立訓練', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練建立訓練
    await page.goto('/trainings', { waitUntil: 'networkidle' })
    await page.getByTestId('training-create').click()
    await expect(page.getByTestId('training-form-modal')).toBeVisible()
    await page.getByTestId('training-date').fill('2026-01-26')
    await selectOption(page, 'training-team', '藍鷹隊')
    await selectOption(page, 'training-player', '1 - 王小明')
    await page.getByTestId('training-save').click()

    // Then：操作成功
    await expect(page.getByText('訓練已新增', { exact: true })).toBeVisible()
    // 跳過：系統產生 "訓練已建立" 事件（內部事件）
  })

  test.skip('嘗試指定多名受測選手', async () => {
    // 跳過：UI 為單選下拉選單，無法選取多名受測選手
  })
})

test.describe('規則：建立訓練時好球帶身高預設帶入受測選手身高，可手動調整', () => {
  test.skip('好球帶身高預設帶入', async () => {
    // 跳過：好球帶預設值為內部邏輯，由單元測試覆蓋
  })

  test.skip('手動調整好球帶身高', async () => {
    // 跳過：好球帶調整在訓練詳情頁（Feature 20），此處僅建立訓練
  })
})

test.describe('規則：教練只能為自己球隊的球員建立訓練', () => {
  test('教練為自己球隊的球員建立訓練', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練為球員 "王小明" 建立訓練
    await page.goto('/trainings', { waitUntil: 'networkidle' })
    await page.getByTestId('training-create').click()
    await expect(page.getByTestId('training-form-modal')).toBeVisible()
    await page.getByTestId('training-date').fill('2026-01-26')
    await selectOption(page, 'training-team', '藍鷹隊')
    await selectOption(page, 'training-player', '1 - 王小明')
    await page.getByTestId('training-save').click()

    // Then：操作成功
    await expect(page.getByText('訓練已新增', { exact: true })).toBeVisible()
  })

  test.skip('教練為他人球隊的球員建立訓練', async () => {
    // 跳過：API 層已過濾，受測選手下拉選單只顯示自己球隊的球員，UI 無法觸發
  })
})
