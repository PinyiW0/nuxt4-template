import type { H3Event } from 'h3'

import { mockPitches } from '../../mock/data/pitches'
import { mockTrainings } from '../../mock/data/trainings'

export default defineEventHandler((event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))

  const training = mockTrainings.find(t => t.id === id)
  if (!training || training.status === 'deleted') {
    throw createError({ statusCode: 404, message: '訓練不存在或已刪除' })
  }

  training.status = 'deleted'

  // 連帶軟刪除投球數據
  mockPitches
    .filter(p => p.training_id === id && p.status === 'active')
    .forEach((p) => { p.status = 'deleted' })

  return { status: 'success' as const, message: '訓練已刪除' }
})
