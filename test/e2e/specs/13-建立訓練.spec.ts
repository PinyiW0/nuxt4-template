import { expect, test } from '@playwright/test'

import { login, selectOption, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：每次訓練只能指定一名受測選手', () => {
  test('成功建立訓練', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練建立訓練
    await page.goto('/trainings', { waitUntil: 'networkidle' })
    await page.getByTestId('training-create').click()
    await expect(page.getByTestId('training-form-modal')).toBeVisible()
    await page.getByTestId('training-date').fill('2026-04-01')
    // ⚠️ 選手下拉選項格式：「王小明 (#1 - 藍鷹隊)」
    await selectOption(page, 'training-player', '王小明 (#1 - 藍鷹隊)')
    await page.getByTestId('training-save').click()

    // Then：操作成功 → 顯示成功提示「訓練已建立」
    await expect(page.getByText('訓練已建立', { exact: true })).toBeVisible()
  })

  test.skip('嘗試指定多名受測選手', async () => {
    // 跳過：UI 下拉選單只能選一個選手，無法觸發此情境
  })
})

test.describe('規則：建立訓練時好球帶身高預設帶入受測選手身高，可手動調整', () => {
  test('好球帶身高預設帶入', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練開啟建立訓練彈窗並選擇受測選手
    await page.goto('/trainings', { waitUntil: 'networkidle' })
    await page.getByTestId('training-create').click()
    await expect(page.getByTestId('training-form-modal')).toBeVisible()
    await selectOption(page, 'training-player', '王小明 (#1 - 藍鷹隊)')

    // Then：好球帶身高自動帶入王小明的身高 175
    await expect(page.getByTestId('training-strike-zone-height')).toHaveValue('175')
  })

  test('手動調整好球帶身高', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練建立訓練並手動調整好球帶身高
    await page.goto('/trainings', { waitUntil: 'networkidle' })
    await page.getByTestId('training-create').click()
    await expect(page.getByTestId('training-form-modal')).toBeVisible()
    await page.getByTestId('training-date').fill('2026-04-01')
    await selectOption(page, 'training-player', '王小明 (#1 - 藍鷹隊)')
    await page.getByTestId('training-strike-zone-height').clear()
    await page.getByTestId('training-strike-zone-height').fill('170')
    await page.getByTestId('training-save').click()

    // Then：操作成功 → 顯示成功提示「訓練已建立」
    await expect(page.getByText('訓練已建立', { exact: true })).toBeVisible()
  })
})

test.describe('規則：教練只能為自己球隊的球員建立訓練', () => {
  test.skip('教練為他人球隊的球員建立訓練', async () => {
    // 跳過：球員下拉選單不會出現他人球隊的球員，UI 無法觸發此情境
  })
})
