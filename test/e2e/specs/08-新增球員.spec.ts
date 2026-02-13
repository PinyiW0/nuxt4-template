import { expect, test } from '@playwright/test'
import { login, selectOption } from '../helpers'

test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：新增球員需提供背號、姓名、身高、守備位置', () => {
  test('成功新增球員', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練在 "藍鷹隊" 新增球員
    await page.goto('/players', { waitUntil: 'networkidle' })
    await page.getByTestId('player-create').click()
    await expect(page.getByTestId('player-form-modal')).toBeVisible()
    await selectOption(page, 'player-team', '藍鷹隊')
    await page.getByTestId('player-number').fill('10')
    await page.getByTestId('player-name').fill('陳小強')
    await page.getByTestId('player-height').fill('180')
    await selectOption(page, 'player-position', '捕手')
    await page.getByTestId('player-save').click()

    // Then：操作成功
    await expect(page.getByText('球員已新增', { exact: true })).toBeVisible()
    // 跳過：系統產生 "球員已新增" 事件（內部事件）
  })
})

test.describe('規則：背號必須為 0-999 的整數', () => {
  test.skip('背號超出範圍', async () => {
    // 跳過：表單驗證由單元測試覆蓋
  })

  test.skip('背號為負數', async () => {
    // 跳過：表單驗證由單元測試覆蓋
  })
})

test.describe('規則：同球隊內背號必須唯一', () => {
  test('新增重複背號的球員', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練在 "藍鷹隊" 新增球員背號為 1
    await page.goto('/players', { waitUntil: 'networkidle' })
    await page.getByTestId('player-create').click()
    await expect(page.getByTestId('player-form-modal')).toBeVisible()
    await selectOption(page, 'player-team', '藍鷹隊')
    await page.getByTestId('player-number').fill('1')
    await page.getByTestId('player-name').fill('測試球員')
    await page.getByTestId('player-height').fill('175')
    await selectOption(page, 'player-position', '投手')
    await page.getByTestId('player-save').click()

    // Then：操作失敗
    await expect(page.getByText('該球隊已有此背號', { exact: true })).toBeVisible()
  })

  test.skip('不同球隊可使用相同背號', async () => {
    // 跳過：跨球隊背號邏輯由單元測試覆蓋
  })
})

test.describe('規則：身高必須為 100-250 公分', () => {
  test.skip('身高低於下限', async () => {
    // 跳過：表單驗證由單元測試覆蓋
  })

  test.skip('身高超出上限', async () => {
    // 跳過：表單驗證由單元測試覆蓋
  })
})

test.describe('規則：守備位置必須為固定選項之一', () => {
  test.skip('使用有效的守備位置', async () => {
    // 跳過：下拉選單只提供有效選項，由「成功新增球員」情境覆蓋
  })

  test.skip('使用無效的守備位置', async () => {
    // 跳過：下拉選單限制，UI 無法選取無效值
  })
})

test.describe('規則：球員姓名長度為 1-50 字元', () => {
  test.skip('球員姓名為空', async () => {
    // 跳過：表單驗證由單元測試覆蓋
  })
})

test.describe('規則：教練只能在自己的球隊中新增球員', () => {
  test('教練在自己的球隊新增球員', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練在 "藍鷹隊" 新增球員
    await page.goto('/players', { waitUntil: 'networkidle' })
    await page.getByTestId('player-create').click()
    await expect(page.getByTestId('player-form-modal')).toBeVisible()
    await selectOption(page, 'player-team', '藍鷹隊')
    await page.getByTestId('player-number').fill('10')
    await page.getByTestId('player-name').fill('陳小強')
    await page.getByTestId('player-height').fill('180')
    await selectOption(page, 'player-position', '捕手')
    await page.getByTestId('player-save').click()

    // Then：操作成功
    await expect(page.getByText('球員已新增', { exact: true })).toBeVisible()
  })

  test.skip('教練在他人的球隊新增球員', async () => {
    // 跳過：API 層已過濾，教練只能看到自己的球隊，UI 無法觸發
  })
})
