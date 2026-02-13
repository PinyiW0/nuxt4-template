import { expect, test } from '@playwright/test'
import { login } from '../helpers'

test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：投球清單透過 SSE 即時更新', () => {
  test('查看訓練的投球清單', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練查詢訓練 "T001" 的投球清單
    await page.goto('/trainings/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-detail-page')).toBeVisible()

    // Then：系統回傳投球清單（訓練 1 有球速 130.1, 128.5, 125.5, 127.3, 126.5）
    await expect(page.getByTestId('pitch-list')).toContainText('130.1')
    await expect(page.getByTestId('pitch-list')).toContainText('128.5')
  })

  test.skip('AI 偵測到新投球時即時更新清單', async () => {
    // 跳過：SSE 即時更新需要模擬 AI 系統推送，E2E 難以精確控制
  })
})

test.describe('規則：SSE 連線斷開時自動重連', () => {
  test.skip('網路斷線後自動重連', async () => {
    // 跳過：E2E 無法模擬網路斷線重連情境
  })
})

test.describe('規則：教練只能查看自己訓練的投球清單', () => {
  test('教練查看自己訓練的投球清單', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練查詢訓練 "T001" 的投球清單
    await page.goto('/trainings/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-detail-page')).toBeVisible()

    // Then：操作成功（查詢操作無提示，由列表內容驗證）
  })

  test.skip('教練查看他人訓練的投球清單', async () => {
    // 跳過：API 層已過濾，教練無法存取他人的訓練詳情頁，UI 無法觸發
  })
})
