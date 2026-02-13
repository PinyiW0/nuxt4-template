import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/** 登入操作（對應 _common.flow.md「{role} "{account}" 已登入」） */
export async function login(page: Page, account: string, password: string) {
  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.getByTestId('login-account').fill(account)
  await page.getByTestId('login-password').fill(password)
  await page.getByTestId('login-submit').click()
  await page.waitForURL('**/')
}

/** USelect 操作：click 打開 → 選擇 option */
export async function selectOption(page: Page, testId: string, optionName: string) {
  await page.getByTestId(testId).click()
  await page.getByRole('option', { name: optionName }).click()
}

/** 確認彈窗：等待出現 → 點擊確認（對應 _common.flow.md 確認彈窗 testid） */
export async function confirmDelete(page: Page) {
  await expect(page.getByTestId('modal')).toBeVisible()
  await page.getByTestId('modal-confirm').click()
}
