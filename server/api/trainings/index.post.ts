import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'
import { mockTrainings } from '../../mock/data/trainings'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const { date, player_id, strike_zone_top, strike_zone_bottom } = body

  if (!date || !player_id) {
    throw createError({ statusCode: 400, message: '訓練日期和球員為必填' })
  }

  const player = mockPlayers.find(p => p.id === player_id && p.status === 'active')
  if (!player) {
    throw createError({ statusCode: 404, message: '球員不存在' })
  }

  // 好球帶預設用球員身高推算
  const top = strike_zone_top ?? Math.round(player.height * 0.65)
  const bottom = strike_zone_bottom ?? Math.round(player.height * 0.3)

  if (top <= bottom) {
    throw createError({ statusCode: 400, message: '好球帶上緣必須大於下緣' })
  }

  const newTraining = {
    id: mockTrainings.length + 1,
    date,
    player_id,
    team_id: player.team_id,
    strike_zone_top: top,
    strike_zone_bottom: bottom,
    pitch_count: 0,
    ai_status: 'stopped' as const,
    created_by: 'coach1',
    created_at: new Date().toISOString(),
    status: 'active' as const,
  }

  mockTrainings.push(newTraining)

  return { status: 'success', data: newTraining }
})
