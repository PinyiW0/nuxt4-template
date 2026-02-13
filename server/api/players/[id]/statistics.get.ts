import type { H3Event } from 'h3'

import { mockPlayerStatistics } from '../../../mock/data/playerAnalysis'

export default defineEventHandler((event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))

  const stats = mockPlayerStatistics[id]
  if (!stats) {
    // 回傳空統計
    return {
      status: 'success',
      data: {
        player_id: id,
        period: '',
        avg_velocity: null,
        avg_spin_rate: null,
        strike_rate: null,
        total_pitches: 0,
        heat_map_data: null,
      },
    }
  }

  return { status: 'success', data: stats }
})
