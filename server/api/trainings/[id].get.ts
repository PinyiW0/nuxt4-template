import type { H3Event } from 'h3'

import { mockTrainings } from '../../mock/data/trainings'

export default defineEventHandler((event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))

  const training = mockTrainings.find(t => t.id === id && t.status === 'active')
  if (!training) {
    throw createError({ statusCode: 404, message: '訓練不存在或已刪除' })
  }

  return {
    status: 'success' as const,
    data: {
      id: training.id,
      date: training.date,
      player_name: training.player_name,
      team_name: training.team_name,
      strike_zone_top: training.strike_zone_top,
      strike_zone_bottom: training.strike_zone_bottom,
      pitch_count: training.pitch_count,
      ai_status: training.ai_status,
      created_by: training.created_by,
      created_at: training.created_at,
    },
  }
})
