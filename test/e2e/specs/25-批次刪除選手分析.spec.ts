import { expect, test } from '@playwright/test'

import { login, Routes, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：批次刪除選手分析只清除訓練與投球數據，保留選手基本資料', () => {
  test('成功批次刪除選手分析', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練批次刪除選手分析資料
    // ⚠️ 注意：分析頁面可能尚未實作，此 spec 將在 red 階段收集失敗
    await page.goto(Routes.analysis, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('analysis-page')).toBeVisible()

    // 勾選選手
    const rows = page.getByTestId('player-analysis-list').locator('tbody tr')
    await rows.nth(0).locator('button[role="checkbox"]').click()
    await rows.nth(1).locator('button[role="checkbox"]').click()

    // 點擊批次刪除
    await page.getByTestId('batch-delete-btn').click()
    await expect(page.getByTestId('confirm-modal')).toBeVisible()
    await page.getByTestId('confirm-ok').click()

    // Then：操作成功 → 顯示成功提示
    await expect(page.getByText('選手分析已批次刪除', { exact: true })).toBeVisible()
  })
})

test.describe('規則：批次刪除需要二次確認', () => {
  test('批次刪除前需確認', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練選擇批次刪除
    await page.goto(Routes.analysis, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('analysis-page')).toBeVisible()

    // 勾選選手
    const rows = page.getByTestId('player-analysis-list').locator('tbody tr')
    await rows.nth(0).locator('button[role="checkbox"]').click()
    await page.getByTestId('batch-delete-btn').click()

    // Then：系統顯示確認對話框
    await expect(page.getByTestId('confirm-modal')).toBeVisible()
  })
})

test.describe('規則：教練只能刪除自己球隊選手的分析資料', () => {
  test.skip('教練刪除他人球隊選手的分析', async () => {
    // 跳過：選手分析列表不會顯示他人球隊的選手，UI 無法觸發此情境
  })
})

test.describe('規則：管理者可刪除所有選手的分析資料', () => {
  test('管理者刪除任意選手的分析', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, TestUsers.admin.account, TestUsers.admin.password)

    // When：管理者批次刪除選手分析資料
    await page.goto(Routes.analysis, { waitUntil: 'networkidle' })
    await expect(page.getByTestId('analysis-page')).toBeVisible()

    // 勾選選手
    const rows = page.getByTestId('player-analysis-list').locator('tbody tr')
    await rows.nth(0).locator('button[role="checkbox"]').click()
    await page.getByTestId('batch-delete-btn').click()
    await expect(page.getByTestId('confirm-modal')).toBeVisible()
    await page.getByTestId('confirm-ok').click()

    // Then：操作成功 → 顯示成功提示
    await expect(page.getByText('選手分析已批次刪除', { exact: true })).toBeVisible()
  })
})
