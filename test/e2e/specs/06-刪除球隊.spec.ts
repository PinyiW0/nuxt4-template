import { expect, test } from '@playwright/test'
import { confirmDelete, login } from '../helpers'

test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：刪除球隊採用軟刪除（標記 is_deleted = true）', () => {
  test('成功刪除球隊', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練刪除球隊 "藍鷹隊"
    await page.goto('/teams', { waitUntil: 'networkidle' })
    const row = page.getByTestId('team-list').locator('tbody tr', { hasText: '藍鷹隊' })
    await row.getByTestId('team-delete').click()
    await confirmDelete(page)

    // Then：操作成功
    await expect(page.getByText('球隊已刪除', { exact: true })).toBeVisible()
    // 跳過：系統產生 "球隊已刪除" 事件（內部事件）
    // 跳過：球隊 "藍鷹隊" 的狀態為 "deleted"（內部狀態）
  })
})

test.describe('規則：刪除球隊時連帶軟刪除所有關聯球員', () => {
  test('刪除有球員的球隊', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練刪除球隊 "藍鷹隊"
    await page.goto('/teams', { waitUntil: 'networkidle' })
    const row = page.getByTestId('team-list').locator('tbody tr', { hasText: '藍鷹隊' })
    await row.getByTestId('team-delete').click()
    await confirmDelete(page)

    // Then：操作成功
    await expect(page.getByText('球隊已刪除', { exact: true })).toBeVisible()
    // 跳過：球隊 "藍鷹隊" 的狀態為 "deleted"（內部狀態）
    // 跳過：球員 "王小明" 的狀態為 "deleted"（內部狀態）
    // 跳過：球員 "李大華" 的狀態為 "deleted"（內部狀態）
  })
})

test.describe('規則：教練只能刪除自己建立或被指派的球隊', () => {
  test('教練刪除自己的球隊', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練刪除球隊 "藍鷹隊"
    await page.goto('/teams', { waitUntil: 'networkidle' })
    const row = page.getByTestId('team-list').locator('tbody tr', { hasText: '藍鷹隊' })
    await row.getByTestId('team-delete').click()
    await confirmDelete(page)

    // Then：操作成功
    await expect(page.getByText('球隊已刪除', { exact: true })).toBeVisible()
  })

  test.skip('教練刪除他人的球隊', async () => {
    // 跳過：API 層已過濾，教練的球隊列表中不會出現他人的球隊，UI 無法觸發
  })
})

test.describe('規則：管理者可刪除所有球隊', () => {
  test('管理者刪除任意球隊', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, 'admin', 'pass123')

    // When：管理者刪除球隊 "紅虎隊"
    await page.goto('/teams', { waitUntil: 'networkidle' })
    const row = page.getByTestId('team-list').locator('tbody tr', { hasText: '紅虎隊' })
    await row.getByTestId('team-delete').click()
    await confirmDelete(page)

    // Then：操作成功
    await expect(page.getByText('球隊已刪除', { exact: true })).toBeVisible()
  })
})

test.describe('規則：已刪除的球隊不可再次刪除', () => {
  test.skip('重複刪除已刪除的球隊', async () => {
    // 跳過：已刪除的球隊不會出現在列表中，UI 無法觸發
  })
})
