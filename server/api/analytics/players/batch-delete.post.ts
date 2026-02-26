import type { H3Event } from 'h3'

import { mockPitches } from '../../../mock/data/pitches'
import { mockTrainings } from '../../../mock/data/trainings'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const { player_ids } = body as { player_ids: number[] }

  if (!player_ids || player_ids.length === 0) {
    throw createError({ statusCode: 400, message: '請選擇要刪除的選手' })
  }

  // 清除選手的訓練與投球數據（保留選手基本資料）
  for (const playerId of player_ids) {
    const trainings = mockTrainings.filter(t => t.player_id === playerId && t.status === 'active')
    for (const training of trainings) {
      training.status = 'deleted'
      mockPitches
        .filter(p => p.training_id === training.id && p.status === 'active')
        .forEach((p) => { p.status = 'deleted' })
    }
  }

  return { status: 'success' as const, message: `已刪除 ${player_ids.length} 位選手的分析資料` }
})
