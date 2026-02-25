import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'
import { mockTrainings } from '../../mock/data/trainings'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)

  const player = mockPlayers.find(p => p.id === body.player_id && p.status === 'active')
  if (!player) {
    throw createError({ statusCode: 404, message: '球員不存在' })
  }

  const maxId = Math.max(...mockTrainings.map(t => t.id))
  const newTraining = {
    id: maxId + 1,
    date: body.date,
    player_id: body.player_id,
    team_id: player.team_id,
    pitch_count: 0,
    ai_status: 'stopped' as const,
    strike_zone_top: body.strike_zone_top ?? Math.round(player.height * 0.686),
    strike_zone_bottom: body.strike_zone_bottom ?? Math.round(player.height * 0.286),
    created_by: body.created_by || 'coach1',
    created_at: new Date().toISOString(),
    status: 'active' as const,
  }
  mockTrainings.push(newTraining)

  return { status: 'success', data: newTraining }
})
