import type { H3Event } from 'h3'

import { mockPitches } from '../../../mock/data/pitches'
import { mockPlayerAnalysis } from '../../../mock/data/playerAnalysis'
import { mockPlayers } from '../../../mock/data/players'
import { mockTrainings } from '../../../mock/data/trainings'

export default defineEventHandler((event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))

  const player = mockPlayers.find(p => p.id === id && p.status === 'active')
  if (!player) {
    throw createError({ statusCode: 404, message: '球員不存在' })
  }

  const analysis = mockPlayerAnalysis.find(a => a.player_id === id)
  if (!analysis || analysis.total_pitches === 0) {
    return {
      status: 'success',
      data: {
        avg_velocity: null,
        avg_spin_rate: null,
        strike_rate: null,
        total_pitches: 0,
        heat_map_data: [],
      },
    }
  }

  // 收集該球員所有訓練的投球落點做熱區圖
  const playerTrainingIds = mockTrainings
    .filter(t => t.player_id === id && t.status === 'active')
    .map(t => t.id)
  const heatMap = mockPitches
    .filter(p => playerTrainingIds.includes(p.training_id) && p.status === 'active')
    .map(p => ({ location_x: p.location_x, location_y: p.location_y, count: 1 }))

  return {
    status: 'success',
    data: {
      avg_velocity: analysis.avg_velocity,
      avg_spin_rate: analysis.avg_spin_rate,
      strike_rate: analysis.strike_rate,
      total_pitches: analysis.total_pitches,
      heat_map_data: heatMap,
    },
  }
})
