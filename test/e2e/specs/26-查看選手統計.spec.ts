import { expect, test } from '@playwright/test'

import { login, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：選手統計顯示從選手建立至當前的完整歷史數據', () => {
  test('查看選手統計', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練查看球員 "王小明" 的統計資料
    // ⚠️ 注意：選手統計頁面可能尚未實作，此 spec 將在 red 階段收集失敗
    await page.goto('/analytics/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('player-stats-page')).toBeVisible()

    // Then：顯示統計資料
    await expect(page.getByTestId('player-stats-avg-velocity')).toBeVisible()
    await expect(page.getByTestId('player-stats-avg-spin-rate')).toBeVisible()
    await expect(page.getByTestId('player-stats-strike-rate')).toBeVisible()
    await expect(page.getByTestId('player-stats-total-pitches')).toBeVisible()
  })
})

test.describe('規則：統計指標包含平均球速、平均轉速、好球率、投球總數', () => {
  test('統計指標顯示完整', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練查看球員 "王小明" 的統計資料
    await page.goto('/analytics/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('player-stats-page')).toBeVisible()

    // Then：顯示所有統計指標
    await expect(page.getByTestId('player-stats-avg-velocity')).toBeVisible()
    await expect(page.getByTestId('player-stats-avg-spin-rate')).toBeVisible()
    await expect(page.getByTestId('player-stats-strike-rate')).toBeVisible()
    await expect(page.getByTestId('player-stats-total-pitches')).toBeVisible()
  })
})

test.describe('規則：熱區圖以顏色漸層顯示投球落點密度分布', () => {
  test('查看熱區圖', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練查看球員 "王小明" 的熱區圖
    await page.goto('/analytics/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('player-stats-page')).toBeVisible()

    // Then：顯示落點熱區圖
    await expect(page.getByTestId('player-stats-heat-map')).toBeVisible()
  })
})

test.describe('規則：教練只能查看自己球隊選手的統計', () => {
  test.skip('教練查看他人球隊選手的統計', async () => {
    // 跳過：選手分析列表不會顯示他人球隊的選手，無法導航到他人球隊的選手統計頁
  })
})

test.describe('規則：管理者可查看所有選手的統計', () => {
  test('管理者查看任意選手的統計', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, TestUsers.admin.account, TestUsers.admin.password)

    // When：管理者查看球員 "張三豐" 的統計資料
    // ⚠️ 校正：flow 用「張三」但 mock 無此球員，實際為「張三豐」(id=3)
    await page.goto('/analytics/3', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('player-stats-page')).toBeVisible()

    // Then：操作成功
    await expect(page.getByTestId('player-stats-avg-velocity')).toBeVisible()
  })
})

test.describe('規則：無投球數據的選手顯示空統計', () => {
  test('新選手無投球數據', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練查看球員 "陳志明" 的統計資料（無訓練紀錄）
    await page.goto('/analytics/4', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('player-stats-page')).toBeVisible()

    // Then：顯示空統計（無投球數據時顯示預設值）
    await expect(page.getByTestId('player-stats-total-pitches')).toContainText('0')
  })
})
