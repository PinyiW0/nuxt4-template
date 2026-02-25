import type { H3Event } from 'h3'

import { mockPlayerAnalysis } from '../../mock/data/playerAnalysis'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)

  if (!body.player_ids || !Array.isArray(body.player_ids) || body.player_ids.length === 0) {
    throw createError({ statusCode: 400, message: '請選擇要刪除分析的選手' })
  }

  // 清除分析資料（保留球員基本資料）
  for (const playerId of body.player_ids) {
    const index = mockPlayerAnalysis.findIndex(a => a.player_id === playerId)
    if (index !== -1) {
      const analysis = mockPlayerAnalysis[index]!
      analysis.training_count = 0
      analysis.total_pitches = 0
      analysis.avg_velocity = 0
      analysis.avg_spin_rate = 0
      analysis.strike_rate = 0
    }
  }

  return { status: 'success', message: `已刪除 ${body.player_ids.length} 位選手的分析資料` }
})
