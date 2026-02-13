import type { H3Event } from 'h3'

import { mockPlayerAnalysis } from '../../mock/data/playerAnalysis'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const { player_ids } = body

  if (!player_ids || !Array.isArray(player_ids) || player_ids.length === 0) {
    throw createError({ statusCode: 400, message: '請選擇要刪除的選手分析' })
  }

  // 從 mock 資料中移除（模擬清除分析數據）
  player_ids.forEach((pid: number) => {
    const index = mockPlayerAnalysis.findIndex(a => a.player_id === pid)
    if (index !== -1) {
      const item = mockPlayerAnalysis[index]!
      item.training_count = 0
      item.total_pitches = 0
      item.avg_velocity = null
    }
  })

  return { status: 'success', message: '選手分析已批次刪除' }
})
