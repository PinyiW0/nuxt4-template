// 測試用：重置所有 mock 資料到初始狀態
import type { H3Event } from 'h3'

export default defineEventHandler((_event: H3Event) => {
  // 在實際使用中，這會重新載入初始 mock 資料
  // 目前 mock 資料是 module-level 的，重啟 server 即可重置
  return { status: 'success', message: 'Mock 資料已重置（請重啟 dev server）' }
})
