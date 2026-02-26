import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'
import { getNextTrainingId, mockTrainings } from '../../mock/data/trainings'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const { date, player_id, strike_zone_top, strike_zone_bottom } = body as {
    date: string
    player_id: number
    strike_zone_top?: number
    strike_zone_bottom?: number
  }

  const player = mockPlayers.find(p => p.id === player_id && p.status === 'active')
  if (!player) {
    throw createError({ statusCode: 404, message: '球員不存在' })
  }

  const newTraining = {
    id: getNextTrainingId(),
    date,
    player_id,
    player_name: player.name,
    team_id: player.team_id,
    team_name: player.team_name,
    pitch_count: 0,
    ai_status: 'stopped' as const,
    strike_zone_top: strike_zone_top ?? player.height,
    strike_zone_bottom: strike_zone_bottom ?? 50,
    created_by: 'coach1',
    created_at: new Date().toISOString(),
    status: 'active' as const,
  }
  mockTrainings.push(newTraining)

  return {
    status: 'success' as const,
    data: {
      id: newTraining.id,
      date: newTraining.date,
      player_name: newTraining.player_name,
      team_name: newTraining.team_name,
      pitch_count: newTraining.pitch_count,
      ai_status: newTraining.ai_status,
      created_by: newTraining.created_by,
      created_at: newTraining.created_at,
    },
  }
})
