import type { H3Event } from 'h3'

import { mockPitches } from '../../../../mock/data/pitches'

export default defineEventHandler((event: H3Event) => {
  const pitchId = Number(getRouterParam(event, 'pitchId'))

  const pitch = mockPitches.find(p => p.id === pitchId && p.status === 'active')
  if (!pitch) {
    throw createError({ statusCode: 404, message: '投球紀錄不存在' })
  }

  return {
    status: 'success',
    data: {
      id: pitch.id,
      sequence: pitch.sequence,
      time: pitch.time,
      velocity: pitch.velocity,
      spin_rate: pitch.spin_rate,
      is_strike: pitch.is_strike,
      location_x: pitch.location_x,
      location_y: pitch.location_y,
      trajectory_data: pitch.trajectory_data,
    },
  }
})
