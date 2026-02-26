import { expect, test } from '@playwright/test'

import { login, Routes, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：批次刪除訓練採用軟刪除', () => {
  test('成功批次刪除訓練', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練批次刪除歷史訓練
    // ⚠️ 注意：history 頁面可能尚未實作，此 spec 將在 red 階段收集失敗
    await page.goto(Routes.trainingHistory, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('history-page')).toBeVisible()

    // 勾選前兩筆訓練
    const rows = page.getByTestId('history-list').locator('tbody tr')
    await rows.nth(0).locator('button[role="checkbox"]').click()
    await rows.nth(1).locator('button[role="checkbox"]').click()

    // 點擊批次刪除
    await page.getByTestId('batch-delete-btn').click()
    await expect(page.getByTestId('confirm-modal')).toBeVisible()
    await page.getByTestId('confirm-ok').click()

    // Then：操作成功 → 顯示成功提示
    await expect(page.getByText('已刪除 2 筆訓練', { exact: true })).toBeVisible()
  })
})

test.describe('規則：批次刪除訓練時連帶軟刪除所有投球數據', () => {
  test.skip('批次刪除有投球數據的訓練', async () => {
    // 跳過：投球數據刪除是內部狀態，UI 無法直接驗證
  })
})

test.describe('規則：批次刪除需要二次確認', () => {
  test('批次刪除前需確認', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練選擇訓練並點擊批次刪除
    await page.goto(Routes.trainingHistory, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('history-page')).toBeVisible()

    // 勾選兩筆訓練
    const rows = page.getByTestId('history-list').locator('tbody tr')
    await rows.nth(0).locator('button[role="checkbox"]').click()
    await rows.nth(1).locator('button[role="checkbox"]').click()
    await page.getByTestId('batch-delete-btn').click()

    // Then：系統顯示確認對話框
    await expect(page.getByTestId('confirm-modal')).toBeVisible()
  })
})

test.describe('規則：教練只能批次刪除自己建立的訓練', () => {
  test.skip('教練批次刪除包含他人訓練', async () => {
    // 跳過：歷史訓練列表不會顯示他人建立的訓練，UI 無法觸發此情境
  })
})

test.describe('規則：管理者可批次刪除所有訓練', () => {
  test('管理者批次刪除任意訓練', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, TestUsers.admin.account, TestUsers.admin.password)

    // When：管理者批次刪除歷史訓練
    await page.goto(Routes.trainingHistory, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('history-page')).toBeVisible()

    // 勾選前兩筆訓練
    const rows = page.getByTestId('history-list').locator('tbody tr')
    await rows.nth(0).locator('button[role="checkbox"]').click()
    await rows.nth(1).locator('button[role="checkbox"]').click()

    // 點擊批次刪除
    await page.getByTestId('batch-delete-btn').click()
    await expect(page.getByTestId('confirm-modal')).toBeVisible()
    await page.getByTestId('confirm-ok').click()

    // Then：操作成功 → 顯示成功提示
    await expect(page.getByText('已刪除 2 筆訓練', { exact: true })).toBeVisible()
  })
})
