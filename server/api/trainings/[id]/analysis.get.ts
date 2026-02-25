import type { H3Event } from 'h3'

import { mockPitches } from '../../../mock/data/pitches'
import { mockTrainings } from '../../../mock/data/trainings'

export default defineEventHandler((event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))

  const training = mockTrainings.find(t => t.id === id && t.status === 'active')
  if (!training) {
    throw createError({ statusCode: 404, message: '訓練不存在' })
  }

  const pitches = mockPitches.filter(p => p.training_id === id && p.status === 'active')

  if (pitches.length === 0) {
    return {
      status: 'success',
      data: {
        total_pitches: 0,
        strike_count: 0,
        ball_count: 0,
        strike_rate: 0,
        avg_velocity: 0,
        max_velocity: 0,
        min_velocity: 0,
        avg_spin_rate: 0,
        heat_map_data: [],
      },
    }
  }

  const strikeCount = pitches.filter(p => p.is_strike).length
  const ballCount = pitches.length - strikeCount
  const velocities = pitches.map(p => p.velocity)
  const spinRates = pitches.map(p => p.spin_rate)

  // 熱區圖：簡單聚合落點
  const heatMap = pitches.map(p => ({
    location_x: p.location_x,
    location_y: p.location_y,
    count: 1,
  }))

  return {
    status: 'success',
    data: {
      total_pitches: pitches.length,
      strike_count: strikeCount,
      ball_count: ballCount,
      strike_rate: Math.round((strikeCount / pitches.length) * 1000) / 10,
      avg_velocity: Math.round(velocities.reduce((a, b) => a + b, 0) / velocities.length * 100) / 100,
      max_velocity: Math.max(...velocities),
      min_velocity: Math.min(...velocities),
      avg_spin_rate: Math.round(spinRates.reduce((a, b) => a + b, 0) / spinRates.length),
      heat_map_data: heatMap,
    },
  }
})
