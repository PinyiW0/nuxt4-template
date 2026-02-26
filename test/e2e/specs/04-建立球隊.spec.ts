import { expect, test } from '@playwright/test'

import { login, Routes, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：建立球隊只需提供名稱', () => {
  test('成功建立球隊', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練建立球隊名稱為 "猛虎隊"
    // ⚠️ 校正：flow 用「紅龍隊」但 mock 已存在，改用不存在的名稱
    await page.goto(Routes.teams, { waitUntil: 'networkidle' })
    await page.getByTestId('team-create').click()
    await expect(page.getByTestId('team-form-modal')).toBeVisible()
    await page.getByTestId('team-name').fill('猛虎隊')
    await page.getByTestId('team-save').click()

    // Then：操作成功 → 顯示成功提示「球隊已新增」
    await expect(page.getByText('球隊已新增', { exact: true })).toBeVisible()
    // 列表包含新建立的球隊
    await expect(page.getByTestId('team-list')).toContainText('猛虎隊')
  })
})

test.describe('規則：球隊名稱必須全系統唯一', () => {
  test('建立重複名稱的球隊', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練建立球隊名稱為 "藍鷹隊"（mock 已存在）
    await page.goto(Routes.teams, { waitUntil: 'networkidle' })
    await page.getByTestId('team-create').click()
    await expect(page.getByTestId('team-form-modal')).toBeVisible()
    await page.getByTestId('team-name').fill('藍鷹隊')
    await page.getByTestId('team-save').click()

    // Then：操作失敗 → 顯示錯誤提示「球隊名稱已存在」
    await expect(page.getByText('球隊名稱已存在', { exact: true })).toBeVisible()
  })
})

test.describe('規則：球隊名稱長度為 1-50 字元', () => {
  test.skip('球隊名稱為空', async () => {
    // 跳過：表單驗證，由單元測試覆蓋
  })
})

test.describe('規則：教練只能建立自己的球隊，管理者可建立任何球隊', () => {
  test('教練建立球隊', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練建立球隊名稱為 "飛鷹隊"
    // ⚠️ 校正：flow 用「白虎隊」但 mock 已存在，改用不存在的名稱
    await page.goto(Routes.teams, { waitUntil: 'networkidle' })
    await page.getByTestId('team-create').click()
    await expect(page.getByTestId('team-form-modal')).toBeVisible()
    await page.getByTestId('team-name').fill('飛鷹隊')
    await page.getByTestId('team-save').click()

    // Then：操作成功 → 列表包含新球隊
    await expect(page.getByText('球隊已新增', { exact: true })).toBeVisible()
    await expect(page.getByTestId('team-list')).toContainText('飛鷹隊')
  })
})
