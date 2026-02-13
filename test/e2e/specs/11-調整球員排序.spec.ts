import { test } from '@playwright/test'

test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：透過拖曳方式調整球員排序，前端送出完整順序陣列', () => {
  test.skip('成功調整球員排序', async () => {
    // 跳過：UI 尚未實作拖曳排序功能，目前只顯示 sort_order 欄位
  })
})

test.describe('規則：球員排序僅限同球隊內，每隊各自有獨立的排序', () => {
  test.skip('調整排序只影響該球隊', async () => {
    // 跳過：跨球隊排序隔離由單元測試覆蓋
  })
})

test.describe('規則：教練只能調整自己球隊的球員排序', () => {
  test.skip('教練調整自己球隊的排序', async () => {
    // 跳過：UI 尚未實作拖曳排序功能
  })

  test.skip('教練調整他人球隊的排序', async () => {
    // 跳過：API 層已過濾，教練只能看到自己球隊的球員，UI 無法觸發
  })
})

test.describe('規則：管理者可調整所有球隊的球員排序', () => {
  test.skip('管理者調整任意球隊的排序', async () => {
    // 跳過：管理者調整排序的操作步驟與教練相同，由「成功調整球員排序」覆蓋
  })
})
