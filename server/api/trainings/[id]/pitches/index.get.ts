import type { H3Event } from 'h3'

import { mockPitches } from '../../../../mock/data/pitches'

export default defineEventHandler((event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))

  const pitches = mockPitches
    .filter(p => p.training_id === id && p.status === 'active')
    .sort((a, b) => a.sequence - b.sequence)
    .map(p => ({
      id: p.id,
      sequence: p.sequence,
      time: p.time,
      velocity: p.velocity,
      spin_rate: p.spin_rate,
      is_strike: p.is_strike,
      location_x: p.location_x,
      location_y: p.location_y,
    }))

  return { status: 'success' as const, data: pitches }
})
