import type { H3Event } from 'h3'

import { mockPitches } from '../../mock/data/pitches'
import { mockTrainings } from '../../mock/data/trainings'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)

  if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
    throw createError({ statusCode: 400, message: '請選擇要刪除的訓練' })
  }

  for (const id of body.ids) {
    const training = mockTrainings.find(t => t.id === id && t.status === 'active')
    if (training) {
      training.status = 'deleted'
      // 級聯刪除投球
      mockPitches
        .filter(p => p.training_id === id && p.status === 'active')
        .forEach((p) => { p.status = 'deleted' })
    }
  }

  return { status: 'success', message: `已刪除 ${body.ids.length} 筆訓練紀錄` }
})
