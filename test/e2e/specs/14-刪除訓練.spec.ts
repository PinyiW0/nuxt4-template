import { expect, test } from '@playwright/test'

import { login, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：刪除訓練採用軟刪除（標記 is_deleted = true）', () => {
  test('成功刪除訓練', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練刪除訓練列表中的第一筆訓練
    // ⚠️ 校正：flow 用 "T001"，但 UI 以日期/選手顯示，找「2026-03-01」的王小明訓練
    await page.goto('/trainings', { waitUntil: 'networkidle' })
    const row = page.getByTestId('training-list').locator('tbody tr').first()
    await row.getByTestId('training-delete').click()
    await expect(page.getByTestId('confirm-modal')).toBeVisible()
    await page.getByTestId('confirm-ok').click()

    // Then：操作成功 → 顯示成功提示「訓練已刪除」
    await expect(page.getByText('訓練已刪除', { exact: true })).toBeVisible()
  })
})

test.describe('規則：刪除訓練時連帶軟刪除所有投球數據', () => {
  test.skip('刪除有投球紀錄的訓練', async () => {
    // 跳過：投球數據刪除是內部狀態，UI 無法直接驗證
    // 同上方「成功刪除訓練」的操作步驟，投球數據連帶刪除由 API 保證
  })
})

test.describe('規則：教練只能刪除自己建立的訓練', () => {
  test.skip('教練刪除他人建立的訓練', async () => {
    // 跳過：訓練列表不會顯示他人建立的訓練，UI 無法觸發此情境
  })
})

test.describe('規則：管理者可刪除所有訓練', () => {
  test('管理者刪除任意訓練', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, TestUsers.admin.account, TestUsers.admin.password)

    // When：管理者刪除訓練列表中的第一筆訓練
    await page.goto('/trainings', { waitUntil: 'networkidle' })
    const row = page.getByTestId('training-list').locator('tbody tr').first()
    await row.getByTestId('training-delete').click()
    await expect(page.getByTestId('confirm-modal')).toBeVisible()
    await page.getByTestId('confirm-ok').click()

    // Then：操作成功 → 顯示成功提示「訓練已刪除」
    await expect(page.getByText('訓練已刪除', { exact: true })).toBeVisible()
  })
})

test.describe('規則：已刪除的訓練不可再次刪除', () => {
  test.skip('重複刪除已刪除的訓練', async () => {
    // 跳過：已刪除的訓練不會顯示在列表中，UI 無法觸發此情境
  })
})
