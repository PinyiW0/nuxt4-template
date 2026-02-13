import type { H3Event } from 'h3'

import { mockPitches } from '../../mock/data/pitches'
import { mockTrainings } from '../../mock/data/trainings'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const { training_ids } = body

  if (!training_ids || !Array.isArray(training_ids) || training_ids.length === 0) {
    throw createError({ statusCode: 400, message: '請選擇要刪除的訓練' })
  }

  training_ids.forEach((id: number) => {
    const training = mockTrainings.find(t => t.id === id && t.status === 'active')
    if (training) {
      training.status = 'deleted'
      // 連帶軟刪除投球
      mockPitches.forEach((p) => {
        if (p.training_id === id) {
          p.status = 'deleted'
        }
      })
    }
  })

  return { status: 'success', message: '訓練已批次刪除' }
})
