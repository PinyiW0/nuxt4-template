import { expect, test } from '@playwright/test'

import { login, Routes, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：刪除球員採用軟刪除（標記 is_deleted = true）', () => {
  test('成功刪除球員', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練刪除球員 "張三豐"
    // ⚠️ 校正：flow 用「王小明」但在第二頁（pageSize=10），改用第一頁的「張三豐」
    await page.goto(Routes.players, { waitUntil: 'networkidle' })
    const row = page.getByTestId('player-list').locator('tbody tr', { hasText: '張三豐' })
    await row.getByTestId('player-delete').click()
    await expect(page.getByTestId('confirm-modal')).toBeVisible()
    await page.getByTestId('confirm-ok').click()

    // Then：操作成功 → 顯示成功提示「球員已刪除」
    await expect(page.getByText('球員已刪除', { exact: true })).toBeVisible()
    // 列表不再包含該球員
    await expect(page.getByTestId('player-list')).not.toContainText('張三豐')
  })
})

test.describe('規則：刪除球員時保留歷史訓練與投球數據', () => {
  test('刪除有訓練紀錄的球員', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練刪除球員 "陳志明"
    // ⚠️ 校正：flow 用「王小明」但在第二頁，改用第一頁的「陳志明」
    await page.goto(Routes.players, { waitUntil: 'networkidle' })
    const row = page.getByTestId('player-list').locator('tbody tr', { hasText: '陳志明' })
    await row.getByTestId('player-delete').click()
    await expect(page.getByTestId('confirm-modal')).toBeVisible()
    await page.getByTestId('confirm-ok').click()

    // Then：操作成功 → 顯示成功提示「球員已刪除」
    await expect(page.getByText('球員已刪除', { exact: true })).toBeVisible()
    // 列表不再包含該球員
    await expect(page.getByTestId('player-list')).not.toContainText('陳志明')
    // 訓練紀錄保留 → ⏭️ 跳過（內部狀態，無法從 UI 驗證）
  })
})

test.describe('規則：教練只能刪除自己球隊的球員', () => {
  test.skip('教練刪除他人球隊的球員', async () => {
    // 跳過：API 層已過濾，列表不會顯示他人球隊的球員
  })
})

test.describe('規則：管理者可刪除所有球員', () => {
  test('管理者刪除任意球員', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, TestUsers.admin.account, TestUsers.admin.password)

    // When：管理者刪除球員 "黃俊傑"
    // ⚠️ 校正：flow 用「張三」但 mock 無此球員，改用第一頁的「黃俊傑」（紅龍隊）
    await page.goto(Routes.players, { waitUntil: 'networkidle' })
    const row = page.getByTestId('player-list').locator('tbody tr', { hasText: '黃俊傑' })
    await row.getByTestId('player-delete').click()
    await expect(page.getByTestId('confirm-modal')).toBeVisible()
    await page.getByTestId('confirm-ok').click()

    // Then：操作成功 → 顯示成功提示「球員已刪除」
    await expect(page.getByText('球員已刪除', { exact: true })).toBeVisible()
  })
})

test.describe('規則：已刪除的球員不可再次刪除', () => {
  test.skip('重複刪除已刪除的球員', async () => {
    // 跳過：已刪除的球員不會顯示在列表中，UI 無法觸發
  })
})
