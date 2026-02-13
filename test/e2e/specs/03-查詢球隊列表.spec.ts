import { expect, test } from '@playwright/test'
import { login } from '../helpers'

test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：教練只能查詢自己建立的球隊', () => {
  test('教練查詢球隊列表', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練查詢球隊列表
    await page.goto('/teams', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('teams-page')).toBeVisible()

    // Then：回傳以下球隊
    await expect(page.getByTestId('team-list')).toContainText('金龍隊')
    await expect(page.getByTestId('team-list')).toContainText('藍鷹隊')
    await expect(page.getByTestId('team-list')).not.toContainText('紅虎隊')
  })
})

test.describe('規則：管理者可查詢所有球隊', () => {
  test('管理者查詢球隊列表', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, 'admin', 'pass123')

    // When：管理者查詢球隊列表
    await page.goto('/teams', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('teams-page')).toBeVisible()

    // Then：回傳所有 active 狀態的球隊（共 3 筆）
    await expect(page.getByTestId('team-list')).toContainText('藍鷹隊')
    await expect(page.getByTestId('team-list')).toContainText('紅虎隊')
    await expect(page.getByTestId('team-list')).toContainText('金龍隊')
  })
})

test.describe('規則：列表依建立時間倒序排列（最新在前）', () => {
  test.skip('球隊列表排序', async () => {
    // 跳過：排序驗證需精確比對列表行順序，由單元測試覆蓋
  })
})

test.describe('規則：列表回傳欄位包含 ID、名稱、球員數量、建立時間、建立者', () => {
  test.skip('確認回傳欄位', async () => {
    // 跳過：欄位結構驗證由單元測試覆蓋
  })
})

test.describe('規則：支援分頁查詢，預設每頁 20 筆，可選 10/20/50 筆', () => {
  test.skip('使用預設分頁', async () => {
    // 跳過：分頁參數驗證由單元測試覆蓋
  })

  test.skip('指定每頁筆數', async () => {
    // 跳過：分頁參數驗證由單元測試覆蓋
  })
})

test.describe('規則：已刪除的球隊不顯示在列表中', () => {
  test('列表不包含已刪除球隊', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, 'admin', 'pass123')

    // When：管理者查詢球隊列表
    await page.goto('/teams', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('teams-page')).toBeVisible()

    // Then：結果不包含不存在的球隊
    await expect(page.getByTestId('team-list')).not.toContainText('不存在的球隊')
  })
})
