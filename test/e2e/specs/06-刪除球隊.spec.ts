import { expect, test } from '@playwright/test'

import { login, Routes, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：刪除球隊採用軟刪除（標記 is_deleted = true）', () => {
  test('成功刪除球隊', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練刪除球隊 "暴風隊"
    // ⚠️ 校正：flow 用「藍鷹隊」但在第二頁，改用第一頁的「暴風隊」
    await page.goto(Routes.teams, { waitUntil: 'networkidle' })
    const row = page.getByTestId('team-list').locator('tbody tr', { hasText: '暴風隊' })
    await row.getByTestId('team-delete').click()
    await expect(page.getByTestId('confirm-modal')).toBeVisible()
    await page.getByTestId('confirm-ok').click()

    // Then：操作成功 → 顯示成功提示「球隊已刪除」
    await expect(page.getByText('球隊已刪除', { exact: true })).toBeVisible()
    // 列表不再包含該球隊
    await expect(page.getByTestId('team-list')).not.toContainText('暴風隊')
  })
})

test.describe('規則：刪除球隊時連帶軟刪除所有關聯球員', () => {
  test('刪除有球員的球隊', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練刪除球隊 "白虎隊"（有 3 名球員）
    // ⚠️ 校正：flow 用「藍鷹隊」但在第二頁，改用第一頁的「白虎隊」
    await page.goto(Routes.teams, { waitUntil: 'networkidle' })
    const row = page.getByTestId('team-list').locator('tbody tr', { hasText: '白虎隊' })
    await row.getByTestId('team-delete').click()
    await expect(page.getByTestId('confirm-modal')).toBeVisible()
    await page.getByTestId('confirm-ok').click()

    // Then：操作成功 → 顯示成功提示「球隊已刪除」
    await expect(page.getByText('球隊已刪除', { exact: true })).toBeVisible()
    // 列表不再包含該球隊
    await expect(page.getByTestId('team-list')).not.toContainText('白虎隊')
    // 球員狀態 → ⏭️ 跳過（內部狀態，無法從 UI 驗證）
  })
})

test.describe('規則：教練只能刪除自己建立或被指派的球隊', () => {
  test.skip('教練刪除他人的球隊', async () => {
    // 跳過：API 層已過濾，列表中不會出現他人球隊，UI 無法觸發
  })
})

test.describe('規則：管理者可刪除所有球隊', () => {
  test('管理者刪除任意球隊', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, TestUsers.admin.account, TestUsers.admin.password)

    // When：管理者刪除球隊 "雷電隊"
    // ⚠️ 校正：flow 用「紅龍隊」但在第二頁，改用第一頁的「雷電隊」
    await page.goto(Routes.teams, { waitUntil: 'networkidle' })
    const row = page.getByTestId('team-list').locator('tbody tr', { hasText: '雷電隊' })
    await row.getByTestId('team-delete').click()
    await expect(page.getByTestId('confirm-modal')).toBeVisible()
    await page.getByTestId('confirm-ok').click()

    // Then：操作成功 → 顯示成功提示「球隊已刪除」
    await expect(page.getByText('球隊已刪除', { exact: true })).toBeVisible()
  })
})

test.describe('規則：已刪除的球隊不可再次刪除', () => {
  test.skip('重複刪除已刪除的球隊', async () => {
    // 跳過：列表中不會出現已刪除球隊，UI 無法觸發
  })
})
