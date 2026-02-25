import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'
import { mockTeams } from '../../mock/data/teams'

export default defineEventHandler((event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))

  const team = mockTeams.find(t => t.id === id && t.status === 'active')
  if (!team) {
    throw createError({ statusCode: 404, message: '球隊不存在' })
  }

  // 軟刪除球隊
  team.status = 'deleted'

  // 級聯軟刪除球員
  mockPlayers
    .filter(p => p.team_id === id && p.status === 'active')
    .forEach((p) => { p.status = 'deleted' })

  return { status: 'success', message: '球隊已刪除' }
})
