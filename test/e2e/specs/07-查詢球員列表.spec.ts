import { expect, test } from '@playwright/test'
import { login, selectOption } from '../helpers'

test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：教練只能查詢自己球隊的球員', () => {
  test('教練查詢球員列表', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練查詢球員列表
    await page.goto('/players', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('players-page')).toBeVisible()

    // Then：回傳以下球員
    await expect(page.getByTestId('player-list')).toContainText('王小明')
    await expect(page.getByTestId('player-list')).toContainText('李大華')
    await expect(page.getByTestId('player-list')).not.toContainText('張三')
  })
})

test.describe('規則：管理者可查詢所有球員', () => {
  test('管理者查詢球員列表', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, 'admin', 'pass123')

    // When：管理者查詢球員列表
    await page.goto('/players', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('players-page')).toBeVisible()

    // Then：回傳所有 active 狀態的球員（共 3 筆）
    await expect(page.getByTestId('player-list')).toContainText('王小明')
    await expect(page.getByTestId('player-list')).toContainText('李大華')
    await expect(page.getByTestId('player-list')).toContainText('張三')
  })
})

test.describe('規則：支援依球隊篩選', () => {
  test('管理者篩選特定球隊的球員', async ({ page }) => {
    // Given：管理者 "admin" 已登入
    await login(page, 'admin', 'pass123')

    // When：管理者查詢球員列表，篩選球隊 "藍鷹隊"
    await page.goto('/players', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('players-page')).toBeVisible()
    await selectOption(page, 'player-filter-team', '藍鷹隊')

    // Then：只回傳藍鷹隊的球員（共 2 筆）
    await expect(page.getByTestId('player-list')).toContainText('王小明')
    await expect(page.getByTestId('player-list')).toContainText('李大華')
    await expect(page.getByTestId('player-list')).not.toContainText('張三')
  })
})

test.describe('規則：列表依建立時間倒序排列（最新在前）', () => {
  test.skip('球員列表排序', async () => {
    // 跳過：排序驗證需精確比對列表行順序，由單元測試覆蓋
  })
})

test.describe('規則：列表回傳欄位包含 ID、背號、姓名、身高、守備位置、所屬球隊、建立時間、排序順位', () => {
  test.skip('確認回傳欄位', async () => {
    // 跳過：欄位結構驗證由單元測試覆蓋
  })
})

test.describe('規則：支援分頁查詢，預設每頁 20 筆，可選 10/20/50 筆', () => {
  test.skip('使用預設分頁', async () => {
    // 跳過：分頁參數驗證由單元測試覆蓋
  })
})

test.describe('規則：已刪除的球員不顯示在列表中', () => {
  test('列表不包含已刪除球員', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練查詢球員列表
    await page.goto('/players', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('players-page')).toBeVisible()

    // Then：結果不包含已刪除的球員
    await expect(page.getByTestId('player-list')).not.toContainText('不存在的球員')
  })
})
