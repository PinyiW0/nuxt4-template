import type { H3Event } from 'h3'

import { mockPitches } from '../../mock/data/pitches'
import { mockPlayers } from '../../mock/data/players'
import { mockTeams } from '../../mock/data/teams'
import { mockTrainings } from '../../mock/data/trainings'

export default defineEventHandler((event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))

  const training = mockTrainings.find(t => t.id === id && t.status === 'active')
  if (!training) {
    throw createError({ statusCode: 404, message: '訓練不存在' })
  }

  const player = mockPlayers.find(p => p.id === training.player_id)
  const team = mockTeams.find(t => t.id === training.team_id)
  const pitchCount = mockPitches.filter(p => p.training_id === id && p.status === 'active').length

  return {
    status: 'success',
    data: {
      id: training.id,
      date: training.date,
      player_id: training.player_id,
      player_name: player?.name || '未知',
      team_id: training.team_id,
      team_name: team?.name || '未知',
      strike_zone_top: training.strike_zone_top,
      strike_zone_bottom: training.strike_zone_bottom,
      pitch_count: pitchCount || training.pitch_count,
      ai_status: training.ai_status,
      created_by: training.created_by,
      created_at: training.created_at,
    },
  }
})
