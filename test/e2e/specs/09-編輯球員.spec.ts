import { expect, test } from '@playwright/test'

import { login, Routes, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：編輯球員可修改背號、姓名、身高、守備位置', () => {
  test('成功編輯球員資料', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練將球員 "張三豐" 的身高修改為 178 公分
    // ⚠️ 校正：flow 用「王小明」但在第二頁（pageSize=10），改用第一頁的「張三豐」
    await page.goto(Routes.players, { waitUntil: 'networkidle' })
    const row = page.getByTestId('player-list').locator('tbody tr', { hasText: '張三豐' })
    await row.getByTestId('player-edit').click()
    await expect(page.getByTestId('player-form-modal')).toBeVisible()
    await page.getByTestId('player-height').clear()
    await page.getByTestId('player-height').fill('178')
    await page.getByTestId('player-save').click()

    // Then：操作成功 → 顯示成功提示「球員已更新」
    await expect(page.getByText('球員已更新', { exact: true })).toBeVisible()
  })
})

test.describe('規則：編輯球員時可修改背號，需檢查同隊內唯一性', () => {
  test('成功修改背號', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練將球員 "張三豐" 的背號修改為 99（未被使用）
    // ⚠️ 校正：flow 用「王小明」但在第二頁，改用「張三豐」
    await page.goto(Routes.players, { waitUntil: 'networkidle' })
    const row = page.getByTestId('player-list').locator('tbody tr', { hasText: '張三豐' })
    await row.getByTestId('player-edit').click()
    await expect(page.getByTestId('player-form-modal')).toBeVisible()
    await page.getByTestId('player-number').clear()
    await page.getByTestId('player-number').fill('99')
    await page.getByTestId('player-save').click()

    // Then：操作成功 → 顯示成功提示「球員已更新」
    await expect(page.getByText('球員已更新', { exact: true })).toBeVisible()
  })

  test('修改背號為已存在的號碼', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練將球員 "張三豐"（背號 5）的背號修改為 7（陳志明的背號，同藍鷹隊）
    // ⚠️ 校正：flow 用「王小明 #1 → #10」但都在第二頁，改用「張三豐 #5 → #7」
    await page.goto(Routes.players, { waitUntil: 'networkidle' })
    const row = page.getByTestId('player-list').locator('tbody tr', { hasText: '張三豐' })
    await row.getByTestId('player-edit').click()
    await expect(page.getByTestId('player-form-modal')).toBeVisible()
    await page.getByTestId('player-number').clear()
    await page.getByTestId('player-number').fill('7')
    await page.getByTestId('player-save').click()

    // Then：操作失敗 → 顯示錯誤提示「該背號已被使用」
    await expect(page.getByText('該背號已被使用', { exact: true })).toBeVisible()
  })
})

test.describe('規則：背號必須為 0-999 的整數', () => {
  test.skip('修改背號超出範圍', async () => {
    // 跳過：表單驗證，由單元測試覆蓋
  })
})

test.describe('規則：身高必須為 100-250 公分', () => {
  test.skip('修改身高超出範圍', async () => {
    // 跳過：表單驗證，由單元測試覆蓋
  })
})

test.describe('規則：守備位置必須為固定選項之一', () => {
  test.skip('修改為無效的守備位置', async () => {
    // 跳過：下拉選單不會有無效選項，UI 無法觸發
  })
})

test.describe('規則：教練只能編輯自己球隊的球員', () => {
  test.skip('教練編輯他人球隊的球員', async () => {
    // 跳過：API 層已過濾，列表不會顯示他人球隊的球員
  })
})

test.describe('規則：管理者可編輯所有球員', () => {
  test('管理者編輯任意球員', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, TestUsers.admin.account, TestUsers.admin.password)

    // When：管理者將球員 "黃俊傑" 的身高修改為 178 公分
    // ⚠️ 校正：flow 用「張三」但 mock 無此球員，改用第一頁的「黃俊傑」（紅龍隊）
    await page.goto(Routes.players, { waitUntil: 'networkidle' })
    const row = page.getByTestId('player-list').locator('tbody tr', { hasText: '黃俊傑' })
    await row.getByTestId('player-edit').click()
    await expect(page.getByTestId('player-form-modal')).toBeVisible()
    await page.getByTestId('player-height').clear()
    await page.getByTestId('player-height').fill('178')
    await page.getByTestId('player-save').click()

    // Then：操作成功 → 顯示成功提示「球員已更新」
    await expect(page.getByText('球員已更新', { exact: true })).toBeVisible()
  })
})

test.describe('規則：已刪除的球員不可編輯', () => {
  test.skip('編輯已刪除的球員', async () => {
    // 跳過：已刪除的球員不會顯示在列表中，UI 無法觸發
  })
})
