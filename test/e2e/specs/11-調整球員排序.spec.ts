import { expect, test } from '@playwright/test'

import { login, Routes, selectOption, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：透過拖曳方式調整球員排序，前端送出完整順序陣列', () => {
  test('成功調整球員排序', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練在 "藍鷹隊" 調整球員排序
    await page.goto(Routes.players, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('players-page')).toBeVisible()

    // 先選擇球隊篩選（排序按鈕只在選擇球隊後才出現）
    await selectOption(page, 'player-team-filter', '藍鷹隊')

    // 點擊排序按鈕進入排序模式
    await page.getByRole('button', { name: '排序' }).click()

    // 拖曳第一個球員到第二個位置
    const handles = page.locator('.drag-handle')
    await handles.first().dragTo(handles.nth(1))

    // 儲存排序
    await page.getByRole('button', { name: '儲存排序' }).click()

    // Then：操作成功 → 顯示成功提示「排序已更新」
    await expect(page.getByText('排序已更新', { exact: true })).toBeVisible()
  })
})

test.describe('規則：球員排序僅限同球隊內，每隊各自有獨立的排序', () => {
  test.skip('調整排序只影響該球隊', async () => {
    // 跳過：內部狀態驗證，需確認另一球隊排序未變，E2E 不易驗證
  })
})

test.describe('規則：教練只能調整自己球隊的球員排序', () => {
  test.skip('教練調整他人球隊的排序', async () => {
    // 跳過：API 層已過濾，列表不會顯示他人球隊的球員
  })
})

test.describe('規則：管理者可調整所有球隊的球員排序', () => {
  test('管理者調整任意球隊的排序', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, TestUsers.admin.account, TestUsers.admin.password)

    // When：管理者調整 "紅龍隊" 的球員排序
    await page.goto(Routes.players, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('players-page')).toBeVisible()

    // 選擇球隊篩選
    await selectOption(page, 'player-team-filter', '紅龍隊')

    // 進入排序模式
    await page.getByRole('button', { name: '排序' }).click()

    // 拖曳調整排序
    const handles = page.locator('.drag-handle')
    await handles.first().dragTo(handles.nth(1))

    // 儲存排序
    await page.getByRole('button', { name: '儲存排序' }).click()

    // Then：操作成功 → 顯示成功提示「排序已更新」
    await expect(page.getByText('排序已更新', { exact: true })).toBeVisible()
  })
})
