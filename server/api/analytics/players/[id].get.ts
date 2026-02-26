import type { H3Event } from 'h3'

import { mockPitches } from '../../../mock/data/pitches'
import { mockPlayers } from '../../../mock/data/players'
import { mockTrainings } from '../../../mock/data/trainings'

export default defineEventHandler((event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))

  const player = mockPlayers.find(p => p.id === id && p.status === 'active')
  if (!player) {
    throw createError({ statusCode: 404, message: '球員不存在' })
  }

  const trainings = mockTrainings.filter(t => t.player_id === id && t.status === 'active')
  const pitches = mockPitches.filter(p =>
    trainings.some(t => t.id === p.training_id) && p.status === 'active',
  )

  const totalPitches = pitches.length
  const strikeCount = pitches.filter(p => p.is_strike).length
  const strikeRate = totalPitches > 0 ? Math.round((strikeCount / totalPitches) * 1000) / 10 : 0
  const avgVelocity = totalPitches > 0
    ? Math.round((pitches.reduce((a, p) => a + p.velocity, 0) / totalPitches) * 100) / 100
    : 0
  const avgSpinRate = totalPitches > 0
    ? Math.round(pitches.reduce((a, p) => a + p.spin_rate, 0) / totalPitches)
    : 0

  const heatMap = pitches.map(p => ({
    x: p.location_x,
    y: p.location_y,
    density: 1,
  }))

  return {
    status: 'success' as const,
    data: {
      avg_velocity: avgVelocity,
      avg_spin_rate: avgSpinRate,
      strike_rate: strikeRate,
      total_pitches: totalPitches,
      heat_map: heatMap,
      period_start: player.created_at.split('T')[0],
      period_end: new Date().toISOString().split('T')[0],
    },
  }
})
