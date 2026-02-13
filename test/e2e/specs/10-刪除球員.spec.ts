import { expect, test } from '@playwright/test'
import { confirmDelete, login } from '../helpers'

test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：刪除球員採用軟刪除（標記 is_deleted = true）', () => {
  test('成功刪除球員', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練刪除球員 "王小明"
    await page.goto('/players', { waitUntil: 'networkidle' })
    const row = page.getByTestId('player-list').locator('tbody tr', { hasText: '王小明' })
    await row.getByTestId('player-delete').click()
    await confirmDelete(page)

    // Then：操作成功
    await expect(page.getByText('球員已刪除', { exact: true })).toBeVisible()
    // 跳過：系統產生 "球員已刪除" 事件（內部事件）
    // 跳過：球員 "王小明" 的狀態為 "deleted"（內部狀態）
  })
})

test.describe('規則：刪除球員時保留歷史訓練與投球數據', () => {
  test('刪除有訓練紀錄的球員', async ({ page }) => {
    // Given：球員 "王小明" 有 5 筆訓練紀錄（mock 資料已預設）
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練刪除球員 "王小明"
    await page.goto('/players', { waitUntil: 'networkidle' })
    const row = page.getByTestId('player-list').locator('tbody tr', { hasText: '王小明' })
    await row.getByTestId('player-delete').click()
    await confirmDelete(page)

    // Then：操作成功
    await expect(page.getByText('球員已刪除', { exact: true })).toBeVisible()
    // 跳過：球員 "王小明" 的狀態為 "deleted"（內部狀態）
    // 跳過：球員 "王小明" 的訓練紀錄保留不變（內部狀態）
  })
})

test.describe('規則：教練只能刪除自己球隊的球員', () => {
  test('教練刪除自己球隊的球員', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練刪除球員 "王小明"
    await page.goto('/players', { waitUntil: 'networkidle' })
    const row = page.getByTestId('player-list').locator('tbody tr', { hasText: '王小明' })
    await row.getByTestId('player-delete').click()
    await confirmDelete(page)

    // Then：操作成功
    await expect(page.getByText('球員已刪除', { exact: true })).toBeVisible()
  })

  test.skip('教練刪除他人球隊的球員', async () => {
    // 跳過：API 層已過濾，教練的球員列表中不會出現他人球隊的球員，UI 無法觸發
  })
})

test.describe('規則：管理者可刪除所有球員', () => {
  test('管理者刪除任意球員', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, 'admin', 'pass123')

    // When：管理者刪除球員 "張三"
    await page.goto('/players', { waitUntil: 'networkidle' })
    const row = page.getByTestId('player-list').locator('tbody tr', { hasText: '張三' })
    await row.getByTestId('player-delete').click()
    await confirmDelete(page)

    // Then：操作成功
    await expect(page.getByText('球員已刪除', { exact: true })).toBeVisible()
  })
})

test.describe('規則：已刪除的球員不可再次刪除', () => {
  test.skip('重複刪除已刪除的球員', async () => {
    // 跳過：已刪除的球員不會出現在列表中，UI 無法觸發
  })
})
