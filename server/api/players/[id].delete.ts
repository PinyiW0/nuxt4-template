import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'
import { mockTeams } from '../../mock/data/teams'

export default defineEventHandler((event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))

  const player = mockPlayers.find(p => p.id === id)
  if (!player || player.status === 'deleted') {
    throw createError({ statusCode: 404, message: '球員不存在或已刪除' })
  }

  player.status = 'deleted'

  // 更新球隊球員數
  const team = mockTeams.find(t => t.id === player.team_id)
  if (team && team.player_count > 0) {
    team.player_count -= 1
  }

  return { status: 'success' as const, message: '球員已刪除' }
})
