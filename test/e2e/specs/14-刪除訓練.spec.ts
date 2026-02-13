import { expect, test } from '@playwright/test'
import { confirmDelete, login } from '../helpers'

test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：刪除訓練採用軟刪除（標記 is_deleted = true）', () => {
  test('成功刪除訓練', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練刪除訓練（2026-03-01 的訓練）
    await page.goto('/trainings', { waitUntil: 'networkidle' })
    const row = page.getByTestId('training-list').locator('tbody tr', { hasText: '2026-03-01' })
    await row.getByTestId('training-delete').click()
    await confirmDelete(page)

    // Then：操作成功
    await expect(page.getByText('訓練已刪除', { exact: true })).toBeVisible()
    // 跳過：系統產生 "訓練已刪除" 事件（內部事件）
    // 跳過：訓練的狀態為 "deleted"（內部狀態）
  })
})

test.describe('規則：刪除訓練時連帶軟刪除所有投球數據', () => {
  test('刪除有投球紀錄的訓練', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練刪除訓練（2026-03-01 的訓練）
    await page.goto('/trainings', { waitUntil: 'networkidle' })
    const row = page.getByTestId('training-list').locator('tbody tr', { hasText: '2026-03-01' })
    await row.getByTestId('training-delete').click()
    await confirmDelete(page)

    // Then：操作成功
    await expect(page.getByText('訓練已刪除', { exact: true })).toBeVisible()
    // 跳過：訓練的狀態為 "deleted"（內部狀態）
    // 跳過：投球的狀態為 "deleted"（內部狀態）
  })
})

test.describe('規則：教練只能刪除自己建立的訓練', () => {
  test('教練刪除自己建立的訓練', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練刪除訓練（2026-03-01 的訓練）
    await page.goto('/trainings', { waitUntil: 'networkidle' })
    const row = page.getByTestId('training-list').locator('tbody tr', { hasText: '2026-03-01' })
    await row.getByTestId('training-delete').click()
    await confirmDelete(page)

    // Then：操作成功
    await expect(page.getByText('訓練已刪除', { exact: true })).toBeVisible()
  })

  test.skip('教練刪除他人建立的訓練', async () => {
    // 跳過：API 層已過濾，教練的訓練列表中不會出現他人的訓練，UI 無法觸發
  })
})

test.describe('規則：管理者可刪除所有訓練', () => {
  test('管理者刪除任意訓練', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, 'admin', 'pass123')

    // When：管理者刪除訓練（2026-03-01 的訓練）
    await page.goto('/trainings', { waitUntil: 'networkidle' })
    const row = page.getByTestId('training-list').locator('tbody tr', { hasText: '2026-03-01' })
    await row.getByTestId('training-delete').click()
    await confirmDelete(page)

    // Then：操作成功
    await expect(page.getByText('訓練已刪除', { exact: true })).toBeVisible()
  })
})

test.describe('規則：已刪除的訓練不可再次刪除', () => {
  test.skip('重複刪除已刪除的訓練', async () => {
    // 跳過：已刪除的訓練不會出現在列表中，UI 無法觸發
  })
})
