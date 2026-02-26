import { expect, test } from '@playwright/test'

import { login, Routes, selectOption, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：新增球員需提供背號、姓名、身高、守備位置', () => {
  test('成功新增球員', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練在 "藍鷹隊" 新增球員
    // ⚠️ 校正：flow 用「李大華 #10」但已存在於藍鷹隊，改用不存在的「周大砲 #20」
    await page.goto(Routes.players, { waitUntil: 'networkidle' })
    // 先選擇球隊篩選，讓建立表單預填球隊
    await selectOption(page, 'player-team-filter', '藍鷹隊')
    await page.getByTestId('player-create').click()
    await expect(page.getByTestId('player-form-modal')).toBeVisible()
    await page.getByTestId('player-number').clear()
    await page.getByTestId('player-number').fill('20')
    await page.getByTestId('player-name').fill('周大砲')
    await page.getByTestId('player-height').clear()
    await page.getByTestId('player-height').fill('180')
    await selectOption(page, 'player-position', '捕手')
    await page.getByTestId('player-save').click()

    // Then：操作成功 → 顯示成功提示「球員已新增」
    await expect(page.getByText('球員已新增', { exact: true })).toBeVisible()
  })
})

test.describe('規則：背號必須為 0-999 的整數', () => {
  test.skip('背號超出範圍', async () => {
    // 跳過：表單驗證，由單元測試覆蓋
  })
})

test.describe('規則：同球隊內背號必須唯一', () => {
  test('新增重複背號的球員', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練在 "藍鷹隊" 新增球員背號為 1（王小明已使用）
    await page.goto(Routes.players, { waitUntil: 'networkidle' })
    await selectOption(page, 'player-team-filter', '藍鷹隊')
    await page.getByTestId('player-create').click()
    await expect(page.getByTestId('player-form-modal')).toBeVisible()
    await page.getByTestId('player-number').clear()
    await page.getByTestId('player-number').fill('1')
    await page.getByTestId('player-name').fill('測試球員')
    await page.getByTestId('player-height').clear()
    await page.getByTestId('player-height').fill('175')
    await selectOption(page, 'player-position', '投手')
    await page.getByTestId('player-save').click()

    // Then：操作失敗 → 顯示錯誤提示「該背號已被使用」
    await expect(page.getByText('該背號已被使用', { exact: true })).toBeVisible()
  })

  test.skip('不同球隊可使用相同背號', async () => {
    // 跳過：涉及切換球隊操作，複雜度高，由 API 層級驗證
  })
})

test.describe('規則：身高必須為 100-250 公分', () => {
  test.skip('身高超出範圍', async () => {
    // 跳過：表單驗證，由單元測試覆蓋
  })
})

test.describe('規則：守備位置必須為固定選項之一', () => {
  test.skip('使用無效的守備位置', async () => {
    // 跳過：下拉選單不會有無效選項，UI 無法觸發
  })
})

test.describe('規則：球員姓名長度為 1-50 字元', () => {
  test.skip('球員姓名為空', async () => {
    // 跳過：表單驗證，由單元測試覆蓋
  })
})

test.describe('規則：教練只能在自己的球隊中新增球員', () => {
  test.skip('教練在他人的球隊新增球員', async () => {
    // 跳過：API 層已過濾，UI 不會顯示他人球隊
  })
})
