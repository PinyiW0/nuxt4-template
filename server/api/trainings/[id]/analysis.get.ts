import type { H3Event } from 'h3'

import { mockPitches } from '../../../mock/data/pitches'

export default defineEventHandler((event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))

  const pitches = mockPitches.filter(p => p.training_id === id && p.status === 'active')

  if (pitches.length === 0) {
    return {
      status: 'success',
      data: {
        training_id: id,
        total_pitches: 0,
        strike_count: 0,
        ball_count: 0,
        strike_rate: 0,
        avg_velocity: 0,
        max_velocity: 0,
        min_velocity: 0,
        avg_spin_rate: 0,
        heat_map_data: {},
      },
    }
  }

  const strikes = pitches.filter(p => p.is_strike)
  const balls = pitches.filter(p => !p.is_strike)
  const velocities = pitches.map(p => p.velocity)
  const spinRates = pitches.map(p => p.spin_rate)

  const avgVelocity = Number((velocities.reduce((a, b) => a + b, 0) / velocities.length).toFixed(2))
  const avgSpinRate = Math.round(spinRates.reduce((a, b) => a + b, 0) / spinRates.length)

  return {
    status: 'success',
    data: {
      training_id: id,
      total_pitches: pitches.length,
      strike_count: strikes.length,
      ball_count: balls.length,
      strike_rate: Math.round((strikes.length / pitches.length) * 100),
      avg_velocity: avgVelocity,
      max_velocity: Math.max(...velocities),
      min_velocity: Math.min(...velocities),
      avg_spin_rate: avgSpinRate,
      heat_map_data: {},
    },
  }
})
