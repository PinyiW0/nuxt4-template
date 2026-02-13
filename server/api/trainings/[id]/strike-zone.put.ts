import type { H3Event } from 'h3'

import { mockTrainings } from '../../../mock/data/trainings'

export default defineEventHandler(async (event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { strike_zone_top, strike_zone_bottom } = body

  const training = mockTrainings.find(t => t.id === id && t.status === 'active')
  if (!training) {
    throw createError({ statusCode: 404, message: '訓練不存在' })
  }

  if (strike_zone_top < 90 || strike_zone_top > 150) {
    throw createError({ statusCode: 400, message: '好球帶上緣必須在 90-150 公分之間' })
  }
  if (strike_zone_bottom < 30 || strike_zone_bottom > 70) {
    throw createError({ statusCode: 400, message: '好球帶下緣必須在 30-70 公分之間' })
  }
  if (strike_zone_top <= strike_zone_bottom) {
    throw createError({ statusCode: 400, message: '好球帶上緣必須大於下緣' })
  }

  training.strike_zone_top = strike_zone_top
  training.strike_zone_bottom = strike_zone_bottom

  return { status: 'success', message: '好球帶設定已更新' }
})
