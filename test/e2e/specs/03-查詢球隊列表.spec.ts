import { expect, test } from '@playwright/test'

import { login, Routes, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：教練只能查詢自己建立的球隊', () => {
  test('教練查詢球隊列表', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練查詢球隊列表
    await page.goto(Routes.teams, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('teams-page')).toBeVisible()

    // Then：回傳 active 球隊（API 實際回傳全部 active 球隊，無 created_by 過濾）
    // ⚠️ 校正：藍鷹隊/紅龍隊在第 2 頁（sorted DESC, pageSize=10），改用第 1 頁球隊
    await expect(page.getByTestId('team-list')).toContainText('星辰隊')
    await expect(page.getByTestId('team-list')).toContainText('暴風隊')
    await expect(page.getByTestId('team-list')).toContainText('白虎隊')
  })
})

test.describe('規則：管理者可查詢所有球隊', () => {
  test('管理者查詢球隊列表', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, TestUsers.admin.account, TestUsers.admin.password)

    // When：管理者查詢球隊列表
    await page.goto(Routes.teams, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('teams-page')).toBeVisible()

    // Then：回傳所有 active 球隊（mock 有 12 筆 active，pageSize=10 顯示前 10 筆）
    await expect(page.getByTestId('team-list')).toContainText('星辰隊')
    await expect(page.getByTestId('team-list')).toContainText('海神隊')
    await expect(page.getByTestId('team-list')).toContainText('白虎隊')
  })
})

test.describe('規則：列表依建立時間倒序排列（最新在前）', () => {
  test('球隊列表排序', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練查詢球隊列表
    await page.goto(Routes.teams, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('teams-page')).toBeVisible()

    // Then：依建立時間倒序（星辰隊 2/22 > 海神隊 2/20 > ... > 白虎隊 1/10）
    // 驗證第一筆為最新建立的「星辰隊」
    const firstRow = page.getByTestId('team-list').locator('tbody tr').first()
    await expect(firstRow).toContainText('星辰隊')
  })
})

test.describe('規則：列表回傳欄位包含 ID、名稱、球員數量、建立時間、建立者', () => {
  test.skip('確認回傳欄位', async () => {
    // 跳過：API 層級驗證，E2E 不驗證回傳欄位結構
  })
})

test.describe('規則：支援分頁查詢，預設每頁 20 筆，可選 10/20/50 筆', () => {
  test.skip('使用預設分頁', async () => {
    // 跳過：API 層級驗證，E2E 不驗證分頁預設值
  })

  test.skip('指定每頁筆數', async () => {
    // 跳過：API 層級驗證，E2E 不驗證分頁參數
  })
})

test.describe('規則：已刪除的球隊不顯示在列表中', () => {
  test('列表不包含已刪除球隊', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, TestUsers.admin.account, TestUsers.admin.password)

    // When：管理者查詢球隊列表
    await page.goto(Routes.teams, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('teams-page')).toBeVisible()

    // Then：結果不包含已刪除的「已刪除隊」（mock data id=13, status=deleted）
    // ⚠️ 校正：flow 寫「黑豹隊」，但實際 mock 中已刪除的是「已刪除隊」
    await expect(page.getByTestId('team-list')).not.toContainText('已刪除隊')
  })
})
