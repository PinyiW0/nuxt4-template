import type { H3Event } from 'h3'

import { mockTrainings } from '../../../../mock/data/trainings'

export default defineEventHandler((event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))

  const training = mockTrainings.find(t => t.id === id && t.status === 'active')
  if (!training) {
    throw createError({ statusCode: 404, message: '訓練不存在' })
  }

  // 冪等操作：已停止時不報錯
  training.ai_status = 'stopped'

  return { status: 'success' as const, message: 'AI 系統已關閉' }
})
