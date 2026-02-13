import { expect, test } from '@playwright/test'
import { login } from '../helpers'

test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：建立球隊只需提供名稱', () => {
  test('成功建立球隊', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練建立球隊名稱為 "紅龍隊"
    await page.goto('/teams', { waitUntil: 'networkidle' })
    await page.getByTestId('team-create').click()
    await expect(page.getByTestId('team-form-modal')).toBeVisible()
    await page.getByTestId('team-name').fill('紅龍隊')
    await page.getByTestId('team-save').click()

    // Then：操作成功
    await expect(page.getByText('球隊已新增', { exact: true })).toBeVisible()
    // 跳過：系統產生 "球隊已建立" 事件（內部事件）
    // 球隊 "紅龍隊" 的建立者為 "coach1"
    const row = page.getByTestId('team-list').locator('tbody tr', { hasText: '紅龍隊' })
    await expect(row).toContainText('coach1')
  })
})

test.describe('規則：球隊名稱必須全系統唯一', () => {
  test('建立重複名稱的球隊', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練建立球隊名稱為 "藍鷹隊"
    await page.goto('/teams', { waitUntil: 'networkidle' })
    await page.getByTestId('team-create').click()
    await expect(page.getByTestId('team-form-modal')).toBeVisible()
    await page.getByTestId('team-name').fill('藍鷹隊')
    await page.getByTestId('team-save').click()

    // Then：操作失敗
    await expect(page.getByText('球隊名稱已存在', { exact: true })).toBeVisible()
  })
})

test.describe('規則：球隊名稱長度為 1-50 字元', () => {
  test.skip('球隊名稱為空', async () => {
    // 跳過：表單驗證由單元測試覆蓋
  })
})

test.describe('規則：教練只能建立自己的球隊，管理者可建立任何球隊', () => {
  test('教練建立球隊', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練建立球隊名稱為 "白虎隊"
    await page.goto('/teams', { waitUntil: 'networkidle' })
    await page.getByTestId('team-create').click()
    await expect(page.getByTestId('team-form-modal')).toBeVisible()
    await page.getByTestId('team-name').fill('白虎隊')
    await page.getByTestId('team-save').click()

    // Then：操作成功
    await expect(page.getByText('球隊已新增', { exact: true })).toBeVisible()
    // 球隊 "白虎隊" 的建立者為 "coach1"
    const row = page.getByTestId('team-list').locator('tbody tr', { hasText: '白虎隊' })
    await expect(row).toContainText('coach1')
  })
})
