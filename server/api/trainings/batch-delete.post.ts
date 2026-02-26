import type { H3Event } from 'h3'

import { mockPitches } from '../../mock/data/pitches'
import { mockTrainings } from '../../mock/data/trainings'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const { ids } = body as { ids: number[] }

  if (!ids || ids.length === 0) {
    throw createError({ statusCode: 400, message: '請選擇要刪除的訓練' })
  }

  for (const id of ids) {
    const training = mockTrainings.find(t => t.id === id)
    if (training && training.status === 'active') {
      training.status = 'deleted'
      // 連帶軟刪除投球數據
      mockPitches
        .filter(p => p.training_id === id && p.status === 'active')
        .forEach((p) => { p.status = 'deleted' })
    }
  }

  return { status: 'success' as const, message: `已刪除 ${ids.length} 筆訓練紀錄` }
})
