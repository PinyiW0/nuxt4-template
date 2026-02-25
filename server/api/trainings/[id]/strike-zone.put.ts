import type { H3Event } from 'h3'

import { mockTrainings } from '../../../mock/data/trainings'

export default defineEventHandler(async (event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const training = mockTrainings.find(t => t.id === id && t.status === 'active')
  if (!training) {
    throw createError({ statusCode: 404, message: '訓練不存在' })
  }

  // 驗證
  if (body.top < 90 || body.top > 150) {
    throw createError({ statusCode: 400, message: '好球帶上緣必須為 90-150 公分' })
  }
  if (body.bottom < 30 || body.bottom > 70) {
    throw createError({ statusCode: 400, message: '好球帶下緣必須為 30-70 公分' })
  }
  if (body.top <= body.bottom) {
    throw createError({ statusCode: 400, message: '上緣必須大於下緣' })
  }

  training.strike_zone_top = body.top
  training.strike_zone_bottom = body.bottom

  return { status: 'success', message: '好球帶設定已更新' }
})
