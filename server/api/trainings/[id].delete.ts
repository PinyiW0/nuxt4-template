import type { H3Event } from 'h3'

import { mockPitches } from '../../mock/data/pitches'
import { mockTrainings } from '../../mock/data/trainings'

export default defineEventHandler((event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))

  const training = mockTrainings.find(t => t.id === id && t.status === 'active')
  if (!training) {
    throw createError({ statusCode: 404, message: '訓練不存在' })
  }

  training.status = 'deleted'

  // 連帶軟刪除所有投球
  mockPitches.forEach((p) => {
    if (p.training_id === id) {
      p.status = 'deleted'
    }
  })

  return { status: 'success', message: '訓練已刪除' }
})
