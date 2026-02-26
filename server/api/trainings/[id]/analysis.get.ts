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

  const totalPitches = pitches.length
  const strikeCount = pitches.filter(p => p.is_strike).length
  const ballCount = totalPitches - strikeCount
  const strikeRate = totalPitches > 0 ? Math.round((strikeCount / totalPitches) * 1000) / 10 : 0
  const velocities = pitches.map(p => p.velocity)
  const avgVelocity = totalPitches > 0 ? Math.round((velocities.reduce((a, b) => a + b, 0) / totalPitches) * 100) / 100 : 0
  const maxVelocity = totalPitches > 0 ? Math.max(...velocities) : 0
  const minVelocity = totalPitches > 0 ? Math.min(...velocities) : 0
  const avgSpinRate = totalPitches > 0 ? Math.round(pitches.reduce((a, p) => a + p.spin_rate, 0) / totalPitches) : 0

  // 簡化的熱區圖資料
  const heatMap = pitches.map(p => ({
    x: p.location_x,
    y: p.location_y,
    density: 1,
  }))

  return {
    status: 'success' as const,
    data: {
      total_pitches: totalPitches,
      strike_count: strikeCount,
      ball_count: ballCount,
      strike_rate: strikeRate,
      avg_velocity: avgVelocity,
      max_velocity: maxVelocity,
      min_velocity: minVelocity,
      avg_spin_rate: avgSpinRate,
      heat_map: heatMap,
    },
  }
})
