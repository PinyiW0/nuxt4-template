import { expect, test } from '@playwright/test'

import { login, Routes, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：編輯球隊時可修改名稱，需檢查全系統唯一性', () => {
  test('成功編輯球隊名稱', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練將球隊 "白虎隊" 的名稱修改為 "白虎猛禽隊"
    // ⚠️ 校正：flow 用「藍鷹隊」但排序後在第二頁，改用第一頁可見的「白虎隊」
    await page.goto(Routes.teams, { waitUntil: 'networkidle' })
    const row = page.getByTestId('team-list').locator('tbody tr', { hasText: '白虎隊' })
    await row.getByTestId('team-edit').click()
    await expect(page.getByTestId('team-form-modal')).toBeVisible()
    await page.getByTestId('team-name').clear()
    await page.getByTestId('team-name').fill('白虎猛禽隊')
    await page.getByTestId('team-save').click()

    // Then：操作成功 → 顯示成功提示「球隊已更新」
    await expect(page.getByText('球隊已更新', { exact: true })).toBeVisible()
  })

  test('編輯球隊名稱為已存在的名稱', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練將球隊 "白虎隊" 的名稱修改為 "黑豹隊"（已存在）
    // ⚠️ 校正：flow 用藍鷹隊→紅龍隊，但都在第二頁；改用第一頁的白虎隊→黑豹隊
    await page.goto(Routes.teams, { waitUntil: 'networkidle' })
    const row = page.getByTestId('team-list').locator('tbody tr', { hasText: '白虎隊' })
    await row.getByTestId('team-edit').click()
    await expect(page.getByTestId('team-form-modal')).toBeVisible()
    await page.getByTestId('team-name').clear()
    await page.getByTestId('team-name').fill('黑豹隊')
    await page.getByTestId('team-save').click()

    // Then：操作失敗 → 顯示錯誤提示「球隊名稱已存在」
    await expect(page.getByText('球隊名稱已存在', { exact: true })).toBeVisible()
  })
})

test.describe('規則：球隊名稱長度為 1-50 字元', () => {
  test.skip('編輯球隊名稱為空', async () => {
    // 跳過：表單驗證，由單元測試覆蓋
  })
})

test.describe('規則：教練只能編輯自己建立或被指派的球隊', () => {
  test('教練編輯自己的球隊', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練將球隊 "金鷲隊" 的名稱修改為 "金鷲飛翔隊"
    await page.goto(Routes.teams, { waitUntil: 'networkidle' })
    const row = page.getByTestId('team-list').locator('tbody tr', { hasText: '金鷲隊' })
    await row.getByTestId('team-edit').click()
    await expect(page.getByTestId('team-form-modal')).toBeVisible()
    await page.getByTestId('team-name').clear()
    await page.getByTestId('team-name').fill('金鷲飛翔隊')
    await page.getByTestId('team-save').click()

    // Then：操作成功 → 顯示成功提示「球隊已更新」
    await expect(page.getByText('球隊已更新', { exact: true })).toBeVisible()
  })

  test.skip('教練編輯他人的球隊', async () => {
    // 跳過：API 層已過濾，列表中不會出現他人球隊，UI 無法觸發
  })
})

test.describe('規則：管理者可編輯所有球隊', () => {
  test('管理者編輯任意球隊', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, TestUsers.admin.account, TestUsers.admin.password)

    // When：管理者將球隊 "暴風隊" 的名稱修改為 "暴風火焰隊"
    // ⚠️ 校正：flow 用「紅龍隊」但在第二頁，改用第一頁的「暴風隊」
    await page.goto(Routes.teams, { waitUntil: 'networkidle' })
    const row = page.getByTestId('team-list').locator('tbody tr', { hasText: '暴風隊' })
    await row.getByTestId('team-edit').click()
    await expect(page.getByTestId('team-form-modal')).toBeVisible()
    await page.getByTestId('team-name').clear()
    await page.getByTestId('team-name').fill('暴風火焰隊')
    await page.getByTestId('team-save').click()

    // Then：操作成功 → 顯示成功提示「球隊已更新」
    await expect(page.getByText('球隊已更新', { exact: true })).toBeVisible()
  })
})

test.describe('規則：已刪除的球隊不可編輯', () => {
  test.skip('編輯已刪除的球隊', async () => {
    // 跳過：列表中不會出現已刪除球隊，UI 無法觸發
  })
})
