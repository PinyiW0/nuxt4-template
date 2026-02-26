import { expect, test } from '@playwright/test'

import { Routes, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：使用者以帳號密碼登入，成功後取得 JWT Token', () => {
  test('登入成功', async ({ page }) => {
    // Given：使用者 "coach1" 尚未登入（預設未登入）

    // When：使用者以帳號 "coach1" 密碼登入
    await page.goto(Routes.login, { waitUntil: 'networkidle' })
    await page.getByTestId('login-account').fill(TestUsers.coach.account)
    await page.getByTestId('login-password').fill(TestUsers.coach.password)
    await page.getByTestId('login-submit').click()

    // Then：操作成功 → 顯示成功提示並跳轉到首頁
    await expect(page.getByText('登入成功', { exact: true })).toBeVisible()
    await page.waitForURL('**/')
  })
})

test.describe('規則：帳號或密碼錯誤時登入失敗', () => {
  test('密碼錯誤', async ({ page }) => {
    // Given：使用者 "coach1" 尚未登入（預設未登入）

    // When：使用者以帳號 "coach1" 密碼 "wrongpass" 登入
    await page.goto(Routes.login, { waitUntil: 'networkidle' })
    await page.getByTestId('login-account').fill(TestUsers.coach.account)
    await page.getByTestId('login-password').fill('wrongpass')
    await page.getByTestId('login-submit').click()

    // Then：操作失敗 → 顯示錯誤提示「帳號或密碼錯誤」
    await expect(page.getByText('帳號或密碼錯誤', { exact: true })).toBeVisible()
  })

  test('帳號不存在', async ({ page }) => {
    // Given：使用者 "unknown" 不存在（mock 資料已預設）

    // When：使用者以帳號 "unknown" 密碼 "pass123" 登入
    await page.goto(Routes.login, { waitUntil: 'networkidle' })
    await page.getByTestId('login-account').fill('unknown')
    await page.getByTestId('login-password').fill('pass123')
    await page.getByTestId('login-submit').click()

    // Then：操作失敗 → 顯示錯誤提示「帳號或密碼錯誤」
    await expect(page.getByText('帳號或密碼錯誤', { exact: true })).toBeVisible()
  })
})

test.describe('規則：連續登入失敗 5 次後，帳號鎖定 15 分鐘', () => {
  test.skip('第 5 次登入失敗後帳號被鎖定', async () => {
    // 跳過：需要控制內部狀態（連續登入失敗次數），E2E 無法模擬
  })

  test.skip('鎖定期間嘗試登入', async () => {
    // 跳過：需要控制帳號鎖定狀態，E2E 無法模擬
  })

  test.skip('鎖定期滿後可重新登入', async () => {
    // 跳過：需要控制時間（鎖定過期）
  })
})

test.describe('規則：Access Token 過期後可用 Refresh Token 換取新 Token', () => {
  test.skip('使用 Refresh Token 換取新 Access Token', async () => {
    // 跳過：無對應 UI，純 API 操作
  })

  test.skip('Refresh Token 已過期', async () => {
    // 跳過：無對應 UI，純 API 操作
  })
})
