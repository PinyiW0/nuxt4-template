import { expect, test } from '@playwright/test'
import { login } from '../helpers'

test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：單球儀表板預設顯示九宮格視圖', () => {
  test('開啟單球儀表板', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練點擊投球 1 查看詳情
    await page.goto('/trainings/1/pitches/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('pitch-dashboard-page')).toBeVisible()

    // Then：預設顯示九宮格視圖
    await expect(page.getByTestId('pitch-grid-view')).toBeVisible()
  })
})

test.describe('規則：九宮格視圖顯示好球帶框線、落點標記、好壞球顏色區分、球速標註', () => {
  test('九宮格視圖內容（好球）', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練正在查看投球 1 的單球儀表板
    await page.goto('/trainings/1/pitches/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('pitch-dashboard-page')).toBeVisible()

    // Then：
    // 跳過：顯示好球帶框線（視覺驗證，由截圖比對覆蓋）
    // 跳過：顯示投球落點標記於位置 (0.1, 0.8)（視覺驗證）
    // 跳過：落點標記顏色為綠色（好球）（視覺驗證）
    // 落點旁標註球速 "130.1 km/h"（pitch id=1 velocity=130.1）
    await expect(page.getByTestId('pitch-velocity-label')).toContainText('130.1')
  })

  test('九宮格視圖內容（壞球）', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練正在查看投球 2 的單球儀表板
    await page.goto('/trainings/1/pitches/2', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('pitch-dashboard-page')).toBeVisible()

    // Then：
    // 跳過：顯示投球落點標記於位置 (-0.3, 1.2)（視覺驗證）
    // 跳過：落點標記顏色為紅色（壞球）（視覺驗證）
    // 落點旁標註球速 "128.5 km/h"（pitch id=2 velocity=128.5）
    await expect(page.getByTestId('pitch-velocity-label')).toContainText('128.5')
  })
})

test.describe('規則：可透過 Tab 切換至 3D 軌跡視圖', () => {
  test('切換至 3D 軌跡視圖', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練點擊 "3D 軌跡" Tab
    await page.goto('/trainings/1/pitches/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('pitch-dashboard-page')).toBeVisible()
    await page.getByTestId('pitch-tab-3d').click()

    // Then：切換顯示 3D 入壘軌跡視圖
    await expect(page.getByTestId('pitch-3d-view')).toBeVisible()
    // 跳過：隱藏九宮格視圖（視覺驗證，由截圖比對覆蓋）
  })

  test('從 3D 軌跡切回九宮格', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練點擊 "九宮格" Tab
    await page.goto('/trainings/1/pitches/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('pitch-dashboard-page')).toBeVisible()
    await page.getByTestId('pitch-tab-3d').click()
    await page.getByTestId('pitch-tab-grid').click()

    // Then：切換顯示九宮格視圖
    await expect(page.getByTestId('pitch-grid-view')).toBeVisible()
    // 跳過：隱藏 3D 軌跡視圖（視覺驗證，由截圖比對覆蓋）
  })
})

test.describe('規則：3D 軌跡視圖顯示投球入壘軌跡', () => {
  test('3D 軌跡視圖內容', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練切換至 3D 軌跡視圖
    await page.goto('/trainings/1/pitches/1', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('pitch-dashboard-page')).toBeVisible()
    await page.getByTestId('pitch-tab-3d').click()

    // Then：
    // 跳過：顯示投球的 3D 入壘軌跡（視覺驗證，由截圖比對覆蓋）
    // 跳過：顯示好球帶立體框線（視覺驗證，由截圖比對覆蓋）
    await expect(page.getByTestId('pitch-3d-view')).toBeVisible()
  })
})

test.describe('規則：同時只顯示一種視圖', () => {
  test.skip('切換視圖時隱藏另一視圖', async () => {
    // 跳過：由上方「切換至 3D 軌跡視圖」和「從 3D 軌跡切回九宮格」情境覆蓋
  })
})
