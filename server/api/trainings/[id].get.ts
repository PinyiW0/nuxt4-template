import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'
import { mockTeams } from '../../mock/data/teams'
import { mockTrainings } from '../../mock/data/trainings'

export default defineEventHandler((event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))

  const training = mockTrainings.find(t => t.id === id && t.status === 'active')
  if (!training) {
    throw createError({ statusCode: 404, message: '訓練不存在' })
  }

  return {
    status: 'success',
    data: {
      id: training.id,
      date: training.date,
      player_id: training.player_id,
      player_name: mockPlayers.find(p => p.id === training.player_id)?.name || '',
      team_id: training.team_id,
      team_name: mockTeams.find(t => t.id === training.team_id)?.name || '',
      strike_zone_top: training.strike_zone_top,
      strike_zone_bottom: training.strike_zone_bottom,
      pitch_count: training.pitch_count,
      ai_status: training.ai_status,
      created_by: training.created_by,
      created_at: training.created_at,
    },
  }
})
