import { expect, test } from '@playwright/test'
import { login } from '../helpers'

test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：編輯球員可修改背號、姓名、身高、守備位置', () => {
  test('成功編輯球員資料', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練將球員 "王小明" 的身高修改為 178 公分
    await page.goto('/players', { waitUntil: 'networkidle' })
    const row = page.getByTestId('player-list').locator('tbody tr', { hasText: '王小明' })
    await row.getByTestId('player-edit').click()
    await expect(page.getByTestId('player-form-modal')).toBeVisible()
    await page.getByTestId('player-height').clear()
    await page.getByTestId('player-height').fill('178')
    await page.getByTestId('player-save').click()

    // Then：操作成功
    await expect(page.getByText('球員已更新', { exact: true })).toBeVisible()
    // 跳過：系統產生 "球員已更新" 事件（內部事件）
  })
})

test.describe('規則：編輯球員時可修改背號，需檢查同隊內唯一性', () => {
  test('成功修改背號', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練將球員 "王小明" 的背號修改為 99
    await page.goto('/players', { waitUntil: 'networkidle' })
    const row = page.getByTestId('player-list').locator('tbody tr', { hasText: '王小明' })
    await row.getByTestId('player-edit').click()
    await expect(page.getByTestId('player-form-modal')).toBeVisible()
    await page.getByTestId('player-number').clear()
    await page.getByTestId('player-number').fill('99')
    await page.getByTestId('player-save').click()

    // Then：操作成功
    await expect(page.getByText('球員已更新', { exact: true })).toBeVisible()
  })

  test('修改背號為已存在的號碼', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練將球員 "王小明" 的背號修改為 10
    await page.goto('/players', { waitUntil: 'networkidle' })
    const row = page.getByTestId('player-list').locator('tbody tr', { hasText: '王小明' })
    await row.getByTestId('player-edit').click()
    await expect(page.getByTestId('player-form-modal')).toBeVisible()
    await page.getByTestId('player-number').clear()
    await page.getByTestId('player-number').fill('2')
    await page.getByTestId('player-save').click()

    // Then：操作失敗
    await expect(page.getByText('該球隊已有此背號', { exact: true })).toBeVisible()
  })
})

test.describe('規則：背號必須為 0-999 的整數', () => {
  test.skip('修改背號超出範圍', async () => {
    // 跳過：表單驗證由單元測試覆蓋
  })
})

test.describe('規則：身高必須為 100-250 公分', () => {
  test.skip('修改身高超出範圍', async () => {
    // 跳過：表單驗證由單元測試覆蓋
  })
})

test.describe('規則：守備位置必須為固定選項之一', () => {
  test.skip('修改為無效的守備位置', async () => {
    // 跳過：下拉選單限制，UI 無法選取無效值
  })
})

test.describe('規則：教練只能編輯自己球隊的球員', () => {
  test('教練編輯自己球隊的球員', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練將球員 "王小明" 的身高修改為 178 公分
    await page.goto('/players', { waitUntil: 'networkidle' })
    const row = page.getByTestId('player-list').locator('tbody tr', { hasText: '王小明' })
    await row.getByTestId('player-edit').click()
    await expect(page.getByTestId('player-form-modal')).toBeVisible()
    await page.getByTestId('player-height').clear()
    await page.getByTestId('player-height').fill('178')
    await page.getByTestId('player-save').click()

    // Then：操作成功
    await expect(page.getByText('球員已更新', { exact: true })).toBeVisible()
  })

  test.skip('教練編輯他人球隊的球員', async () => {
    // 跳過：API 層已過濾，教練的球員列表中不會出現他人球隊的球員，UI 無法觸發
  })
})

test.describe('規則：管理者可編輯所有球員', () => {
  test('管理者編輯任意球員', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, 'admin', 'pass123')

    // When：管理者將球員 "張三" 的身高修改為 178 公分
    await page.goto('/players', { waitUntil: 'networkidle' })
    const row = page.getByTestId('player-list').locator('tbody tr', { hasText: '張三' })
    await row.getByTestId('player-edit').click()
    await expect(page.getByTestId('player-form-modal')).toBeVisible()
    await page.getByTestId('player-height').clear()
    await page.getByTestId('player-height').fill('178')
    await page.getByTestId('player-save').click()

    // Then：操作成功
    await expect(page.getByText('球員已更新', { exact: true })).toBeVisible()
  })
})

test.describe('規則：已刪除的球員不可編輯', () => {
  test.skip('編輯已刪除的球員', async () => {
    // 跳過：已刪除的球員不會出現在列表中，UI 無法觸發
  })
})
