import type { H3Event } from 'h3'

import { mockTrainings } from '../../../../mock/data/trainings'

export default defineEventHandler((event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))

  const training = mockTrainings.find(t => t.id === id && t.status === 'active')
  if (!training) {
    throw createError({ statusCode: 404, message: '訓練不存在' })
  }

  if (training.ai_status === 'running') {
    throw createError({ statusCode: 409, message: '系統已在運行中' })
  }

  training.ai_status = 'running'

  return { status: 'success' as const, message: 'AI 系統已啟動' }
})
