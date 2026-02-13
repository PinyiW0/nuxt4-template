import type { H3Event } from 'h3'

import { mockTrainings } from '../../mock/data/trainings'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const { training_id } = body

  const training = mockTrainings.find(t => t.id === training_id && t.status === 'active')
  if (!training) {
    throw createError({ statusCode: 404, message: '訓練不存在' })
  }

  if (training.ai_status === 'running') {
    throw createError({ statusCode: 409, message: 'AI 系統已在運行中' })
  }

  training.ai_status = 'running'

  return {
    status: 'success',
    data: {
      ai_status: 'running',
      training_id,
      created_by: training.created_by,
    },
  }
})
