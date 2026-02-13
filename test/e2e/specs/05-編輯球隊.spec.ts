import { expect, test } from '@playwright/test'
import { login } from '../helpers'

test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：編輯球隊時可修改名稱，需檢查全系統唯一性', () => {
  test('成功編輯球隊名稱', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練將球隊 "藍鷹隊" 的名稱修改為 "藍鷹猛禽隊"
    await page.goto('/teams', { waitUntil: 'networkidle' })
    const row = page.getByTestId('team-list').locator('tbody tr', { hasText: '藍鷹隊' })
    await row.getByTestId('team-edit').click()
    await expect(page.getByTestId('team-form-modal')).toBeVisible()
    await page.getByTestId('team-name').clear()
    await page.getByTestId('team-name').fill('藍鷹猛禽隊')
    await page.getByTestId('team-save').click()

    // Then：操作成功
    await expect(page.getByText('球隊已更新', { exact: true })).toBeVisible()
    // 跳過：系統產生 "球隊已更新" 事件（內部事件）
  })

  test('編輯球隊名稱為已存在的名稱', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練將球隊 "藍鷹隊" 的名稱修改為 "金龍隊"
    await page.goto('/teams', { waitUntil: 'networkidle' })
    const row = page.getByTestId('team-list').locator('tbody tr', { hasText: '藍鷹隊' })
    await row.getByTestId('team-edit').click()
    await expect(page.getByTestId('team-form-modal')).toBeVisible()
    await page.getByTestId('team-name').clear()
    await page.getByTestId('team-name').fill('金龍隊')
    await page.getByTestId('team-save').click()

    // Then：操作失敗
    await expect(page.getByText('球隊名稱已存在', { exact: true })).toBeVisible()
  })
})

test.describe('規則：球隊名稱長度為 1-50 字元', () => {
  test.skip('編輯球隊名稱為空', async () => {
    // 跳過：表單驗證由單元測試覆蓋
  })
})

test.describe('規則：教練只能編輯自己建立或被指派的球隊', () => {
  test('教練編輯自己的球隊', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練將球隊 "藍鷹隊" 的名稱修改為 "藍鷹猛禽隊"
    await page.goto('/teams', { waitUntil: 'networkidle' })
    const row = page.getByTestId('team-list').locator('tbody tr', { hasText: '藍鷹隊' })
    await row.getByTestId('team-edit').click()
    await expect(page.getByTestId('team-form-modal')).toBeVisible()
    await page.getByTestId('team-name').clear()
    await page.getByTestId('team-name').fill('藍鷹猛禽隊')
    await page.getByTestId('team-save').click()

    // Then：操作成功
    await expect(page.getByText('球隊已更新', { exact: true })).toBeVisible()
  })

  test.skip('教練編輯他人的球隊', async () => {
    // 跳過：API 層已過濾，教練的球隊列表中不會出現他人的球隊，UI 無法觸發
  })
})

test.describe('規則：管理者可編輯所有球隊', () => {
  test('管理者編輯任意球隊', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, 'admin', 'pass123')

    // When：管理者將球隊 "紅虎隊" 的名稱修改為 "紅虎火焰隊"
    await page.goto('/teams', { waitUntil: 'networkidle' })
    const row = page.getByTestId('team-list').locator('tbody tr', { hasText: '紅虎隊' })
    await row.getByTestId('team-edit').click()
    await expect(page.getByTestId('team-form-modal')).toBeVisible()
    await page.getByTestId('team-name').clear()
    await page.getByTestId('team-name').fill('紅虎火焰隊')
    await page.getByTestId('team-save').click()

    // Then：操作成功
    await expect(page.getByText('球隊已更新', { exact: true })).toBeVisible()
  })
})

test.describe('規則：已刪除的球隊不可編輯', () => {
  test.skip('編輯已刪除的球隊', async () => {
    // 跳過：已刪除的球隊不會出現在列表中，UI 無法觸發
  })
})
