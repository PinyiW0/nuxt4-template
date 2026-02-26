import type { H3Event } from 'h3'

import { mockTrainings } from '../../../mock/data/trainings'

export default defineEventHandler(async (event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { top, bottom } = body as { top: number, bottom: number }

  const training = mockTrainings.find(t => t.id === id && t.status === 'active')
  if (!training) {
    throw createError({ statusCode: 404, message: '訓練不存在' })
  }

  if (top < 90 || top > 150) {
    throw createError({ statusCode: 400, message: '好球帶上緣必須為 90-150 公分' })
  }

  if (bottom < 30 || bottom > 70) {
    throw createError({ statusCode: 400, message: '好球帶下緣必須為 30-70 公分' })
  }

  if (top <= bottom) {
    throw createError({ statusCode: 400, message: '上緣必須大於下緣' })
  }

  training.strike_zone_top = top
  training.strike_zone_bottom = bottom

  return { status: 'success' as const, message: '好球帶範圍已更新' }
})
