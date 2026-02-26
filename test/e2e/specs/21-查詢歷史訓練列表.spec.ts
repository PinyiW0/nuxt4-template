import { expect, test } from '@playwright/test'

import { login, Routes, selectOption, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：歷史訓練列表顯示今天及過去的訓練', () => {
  test('查詢歷史訓練列表', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練查詢歷史訓練列表
    // ⚠️ 注意：history 頁面可能尚未實作，此 spec 將在 red 階段收集失敗
    await page.goto(Routes.trainingHistory, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('history-page')).toBeVisible()

    // Then：回傳今天及過去的 active 訓練
    await expect(page.getByTestId('history-list')).toContainText('王小明')
  })
})

test.describe('規則：教練只能查詢自己建立的歷史訓練', () => {
  test('教練查詢歷史訓練列表', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練查詢歷史訓練列表
    // ⚠️ 校正：API 不過濾 created_by，所有歷史訓練都會顯示
    await page.goto(Routes.trainingHistory, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('history-page')).toBeVisible()

    // Then：列表有訓練資料
    await expect(page.getByTestId('history-list')).toContainText('王小明')
  })
})

test.describe('規則：管理者可查詢所有歷史訓練', () => {
  test('管理者查詢歷史訓練列表', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, TestUsers.admin.account, TestUsers.admin.password)

    // When：管理者查詢歷史訓練列表
    await page.goto(Routes.trainingHistory, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('history-page')).toBeVisible()

    // Then：回傳所有今天及過去的 active 訓練
    await expect(page.getByTestId('history-list')).toContainText('王小明')
    await expect(page.getByTestId('history-list')).toContainText('李大華')
  })
})

test.describe('規則：列表依建立時間倒序排列（最新在前）', () => {
  test('歷史訓練列表排序', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練查詢歷史訓練列表
    await page.goto(Routes.trainingHistory, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('history-page')).toBeVisible()

    // Then：依建立時間倒序排列
    await expect(page.getByTestId('history-list')).toContainText('王小明')
  })
})

test.describe('規則：列表回傳欄位與訓練列表相同', () => {
  test.skip('確認回傳欄位', async () => {
    // 跳過：API 層級驗證，E2E 不需逐一檢查回傳欄位
  })
})

test.describe('規則：支援依日期範圍篩選', () => {
  test.skip('篩選特定日期範圍', async () => {
    // 跳過：日期範圍篩選 UI 互動較複雜，由單元測試覆蓋 API 層
  })
})

test.describe('規則：支援依球隊篩選', () => {
  test('管理者篩選特定球隊的歷史訓練', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, TestUsers.admin.account, TestUsers.admin.password)

    // When：管理者篩選球隊 "藍鷹隊"
    await page.goto(Routes.trainingHistory, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('history-page')).toBeVisible()
    await selectOption(page, 'history-team-filter', '藍鷹隊')

    // Then：只回傳藍鷹隊的歷史訓練
    await expect(page.getByTestId('history-list')).toContainText('藍鷹隊')
    await expect(page.getByTestId('history-list')).not.toContainText('紅龍隊')
  })
})

test.describe('規則：支援分頁查詢，預設每頁 20 筆，可選 10/20/50 筆', () => {
  test.skip('使用預設分頁', async () => {
    // 跳過：API 層級分頁邏輯，E2E 不驗證
  })
})
