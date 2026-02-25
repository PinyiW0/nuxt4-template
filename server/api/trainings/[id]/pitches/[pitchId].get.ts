import type { H3Event } from 'h3'

import { mockPitches } from '../../../../mock/data/pitches'

export default defineEventHandler((event: H3Event) => {
  const pitchId = Number(getRouterParam(event, 'pitchId'))

  const pitch = mockPitches.find(p => p.id === pitchId && p.status === 'active')
  if (!pitch) {
    throw createError({ statusCode: 404, message: '投球資料不存在' })
  }

  const { training_id: _tid, status: _s, ...data } = pitch
  return { status: 'success', data }
})
