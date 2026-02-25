import type { H3Event } from 'h3'

import { mockTrainings } from '../../mock/data/trainings'

// 模擬 AI 全域狀態
const aiState = { status: 'stopped' as 'running' | 'stopped', training_id: null as number | null }

export { aiState }

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)

  if (!body.training_id) {
    throw createError({ statusCode: 400, message: '請先建立訓練' })
  }

  if (aiState.status === 'running') {
    throw createError({ statusCode: 409, message: '系統已在運行中' })
  }

  const training = mockTrainings.find(t => t.id === body.training_id && t.status === 'active')
  if (!training) {
    throw createError({ statusCode: 404, message: '訓練不存在' })
  }

  aiState.status = 'running'
  aiState.training_id = body.training_id
  training.ai_status = 'running'

  return { status: 'success', message: 'AI 系統已啟動' }
})
