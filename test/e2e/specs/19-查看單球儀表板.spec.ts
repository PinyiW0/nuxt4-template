import { expect, test } from '@playwright/test'

import { login, TestUsers } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：單球儀表板預設顯示九宮格視圖', () => {
  test('開啟單球儀表板', async ({ page }) => {
    // Given：教練 "coach1" 已登入，正在查看訓練 4 的紀錄
    await login(page, TestUsers.coach.account, TestUsers.coach.password)
    await page.goto('/trainings/5', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('training-detail-page')).toBeVisible()

    // When：教練點擊投球清單中的第一筆投球
    // ⚠️ 校正：單球儀表板是 Modal 而非獨立頁面，點擊行即開啟 Modal
    const firstPitchRow = page.getByTestId('pitch-list').locator('tbody tr').first()
    await firstPitchRow.click()

    // Then：開啟單球儀表板 Modal，預設顯示九宮格視圖
    await expect(page.getByTestId('pitch-dashboard-page')).toBeVisible()
    await expect(page.getByTestId('pitch-grid-view')).toBeVisible()
  })
})

test.describe('規則：九宮格視圖顯示好球帶框線、落點標記、好壞球顏色區分、球速標註', () => {
  test('九宮格視圖內容', async ({ page }) => {
    // Given：教練 "coach1" 已登入，正在查看訓練 4 的紀錄
    await login(page, TestUsers.coach.account, TestUsers.coach.password)
    await page.goto('/trainings/5', { waitUntil: 'networkidle' })

    // When：教練點擊第一筆投球查看儀表板
    const firstPitchRow = page.getByTestId('pitch-list').locator('tbody tr').first()
    await firstPitchRow.click()
    await expect(page.getByTestId('pitch-dashboard-page')).toBeVisible()

    // Then：九宮格視圖包含好球帶框線和球速標籤
    await expect(page.getByTestId('pitch-strike-zone')).toBeVisible()
    await expect(page.getByTestId('pitch-velocity-label')).toBeVisible()
    await expect(page.getByTestId('pitch-location-marker')).toBeVisible()
  })
})

test.describe('規則：可透過 Tab 切換至 3D 軌跡視圖', () => {
  test('切換至 3D 軌跡視圖', async ({ page }) => {
    // Given：教練 "coach1" 已登入，已開啟單球儀表板
    await login(page, TestUsers.coach.account, TestUsers.coach.password)
    await page.goto('/trainings/5', { waitUntil: 'networkidle' })
    const firstPitchRow = page.getByTestId('pitch-list').locator('tbody tr').first()
    await firstPitchRow.click()
    await expect(page.getByTestId('pitch-dashboard-page')).toBeVisible()

    // When：教練點擊「3D 軌跡」Tab
    await page.getByTestId('pitch-3d-tab').click()

    // Then：顯示 3D 軌跡視圖，隱藏九宮格視圖
    await expect(page.getByTestId('pitch-3d-view')).toBeVisible()
    await expect(page.getByTestId('pitch-grid-view')).not.toBeVisible()
  })

  test('從 3D 軌跡切回九宮格', async ({ page }) => {
    // Given：教練 "coach1" 已登入，已開啟單球儀表板
    await login(page, TestUsers.coach.account, TestUsers.coach.password)
    await page.goto('/trainings/5', { waitUntil: 'networkidle' })
    const firstPitchRow = page.getByTestId('pitch-list').locator('tbody tr').first()
    await firstPitchRow.click()
    await expect(page.getByTestId('pitch-dashboard-page')).toBeVisible()

    // When：先切到 3D，再切回九宮格
    await page.getByTestId('pitch-3d-tab').click()
    await page.getByTestId('pitch-grid-tab').click()

    // Then：顯示九宮格視圖，隱藏 3D 軌跡視圖
    await expect(page.getByTestId('pitch-grid-view')).toBeVisible()
    await expect(page.getByTestId('pitch-3d-view')).not.toBeVisible()
  })
})

test.describe('規則：同時只顯示一種視圖', () => {
  test('切換視圖時隱藏另一視圖', async ({ page }) => {
    // Given：教練 "coach1" 已登入，已開啟單球儀表板
    await login(page, TestUsers.coach.account, TestUsers.coach.password)
    await page.goto('/trainings/5', { waitUntil: 'networkidle' })
    const firstPitchRow = page.getByTestId('pitch-list').locator('tbody tr').first()
    await firstPitchRow.click()
    await expect(page.getByTestId('pitch-dashboard-page')).toBeVisible()

    // Then：預設九宮格可見，3D 隱藏
    await expect(page.getByTestId('pitch-grid-view')).toBeVisible()
    await expect(page.getByTestId('pitch-3d-view')).not.toBeVisible()
  })
})
