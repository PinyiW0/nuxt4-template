export default defineEventHandler(async () => {
  // 模擬從資料庫或外部服務獲取資料
  await new Promise(resolve => setTimeout(resolve, 500))

  return {
    status: 'success',
    message: 'API 呼叫成功',
    data: [
      { id: 1, name: 'Item 1', description: 'Nuxt 4 測試項目' },
      { id: 2, name: 'Item 2', description: 'TypeScript 整合' },
      { id: 3, name: 'Item 3', description: 'Server API 範例' },
    ],
  }
})
