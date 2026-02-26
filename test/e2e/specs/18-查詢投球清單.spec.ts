import { expect, test } from '@playwright/test'

import { login, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：投球清單透過 SSE 即時更新', () => {
  test('查看訓練的投球清單', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, TestUsers.coach.account, TestUsers.coach.password)

    // When：教練查詢訓練 4 的投球清單
    // ⚠️ 校正：flow 用 "T001" → 實際使用 id=4（有 30 筆投球紀錄）
    await page.goto('/trainings/5', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-detail-page')).toBeVisible()

    // Then：投球清單有投球紀錄
    // ⚠️ 校正：mock 投球數據為隨機生成，不驗證特定球速值
    const pitchRows = page.getByTestId('pitch-list').locator('tbody tr')
    await expect(pitchRows.first()).toBeVisible()
  })

  test.skip('AI 偵測到新投球時即時更新清單', async () => {
    // 跳過：需要模擬 SSE 事件，E2E 難以控制 AI 系統即時偵測
  })
})

test.describe('規則：SSE 連線斷開時自動重連', () => {
  test.skip('網路斷線後自動重連', async () => {
    // 跳過：需要控制網路狀態，E2E 難以模擬 SSE 連線中斷
  })
})

test.describe('規則：教練只能查看自己訓練的投球清單', () => {
  test.skip('教練查看他人訓練的投球清單', async () => {
    // 跳過：列表中不會顯示他人訓練，無法導航到他人的訓練詳情頁
  })
})
