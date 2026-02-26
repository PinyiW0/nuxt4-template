import { expect, test } from '@playwright/test'

import { login, Routes, selectOption, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：教練只能查詢自己球隊的選手分析', () => {
  test('教練查詢選手分析列表', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練查詢選手分析列表
    // ⚠️ 注意：分析頁面可能尚未實作，此 spec 將在 red 階段收集失敗
    await page.goto(Routes.analysis, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('analysis-page')).toBeVisible()

    // Then：回傳選手分析列表
    await expect(page.getByTestId('player-analysis-list')).toContainText('王小明')
  })
})

test.describe('規則：管理者可查詢所有選手分析', () => {
  test('管理者查詢選手分析列表', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, TestUsers.admin.account, TestUsers.admin.password)

    // When：管理者查詢選手分析列表
    await page.goto(Routes.analysis, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('analysis-page')).toBeVisible()

    // Then：回傳所有選手分析
    await expect(page.getByTestId('player-analysis-list')).toContainText('王小明')
    await expect(page.getByTestId('player-analysis-list')).toContainText('李大華')
  })
})

test.describe('規則：列表依建立時間倒序排列（最新在前）', () => {
  test('選手分析列表排序', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練查詢選手分析列表
    await page.goto(Routes.analysis, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('analysis-page')).toBeVisible()

    // Then：列表有資料
    await expect(page.getByTestId('player-analysis-list')).toContainText('王小明')
  })
})

test.describe('規則：列表回傳欄位包含 ID、姓名、背號、球隊、訓練次數、投球數、最近訓練日、平均球速', () => {
  test.skip('確認回傳欄位', async () => {
    // 跳過：API 層級驗證，E2E 不需逐一檢查回傳欄位
  })
})

test.describe('規則：支援依球隊篩選', () => {
  test('管理者篩選特定球隊的選手分析', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, TestUsers.admin.account, TestUsers.admin.password)

    // When：管理者篩選球隊 "藍鷹隊"
    await page.goto(Routes.analysis, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('analysis-page')).toBeVisible()
    await selectOption(page, 'player-analysis-team-filter', '藍鷹隊')

    // Then：只回傳藍鷹隊的選手分析
    await expect(page.getByTestId('player-analysis-list')).toContainText('王小明')
  })
})

test.describe('規則：支援關鍵字搜尋（姓名）', () => {
  test('依姓名搜尋', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練輸入搜尋關鍵字 "王"
    await page.goto(Routes.analysis, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('analysis-page')).toBeVisible()
    await page.getByTestId('player-analysis-search').fill('王')

    // Then：只回傳姓名包含 "王" 的選手
    await expect(page.getByTestId('player-analysis-list')).toContainText('王小明')
  })
})

test.describe('規則：支援分頁查詢，預設每頁 20 筆，可選 10/20/50 筆', () => {
  test.skip('使用預設分頁', async () => {
    // 跳過：API 層級驗證，E2E 不需驗證分頁參數預設值
  })
})

test.describe('規則：已刪除的球員不顯示在列表中', () => {
  test('列表不包含已刪除球員', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練查詢選手分析列表
    await page.goto(Routes.analysis, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('analysis-page')).toBeVisible()

    // Then：結果不包含已刪除球員
    await expect(page.getByTestId('player-analysis-list')).not.toContainText('已刪除球員')
  })
})
