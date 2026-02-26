import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'
import { mockTeams } from '../../mock/data/teams'

export default defineEventHandler((event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))

  const team = mockTeams.find(t => t.id === id)
  if (!team || team.status === 'deleted') {
    throw createError({ statusCode: 404, message: '球隊不存在或已刪除' })
  }

  // 軟刪除球隊
  team.status = 'deleted'

  // 連帶軟刪除所有關聯球員
  mockPlayers
    .filter(p => p.team_id === id && p.status === 'active')
    .forEach((p) => { p.status = 'deleted' })

  return { status: 'success' as const, message: '球隊已刪除' }
})
