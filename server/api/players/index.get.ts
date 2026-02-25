import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'
import { mockTeams } from '../../mock/data/teams'

export default defineEventHandler((event: H3Event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const perPage = Number(query.per_page) || 20
  const teamId = query.team_id ? Number(query.team_id) : null

  let players = mockPlayers.filter(p => p.status === 'active')

  // 篩選球隊
  if (teamId) {
    players = players.filter(p => p.team_id === teamId)
  }

  // 依建立時間倒序
  players = players.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // 附加球隊名稱
  const playersWithTeam = players.map((p) => {
    const team = mockTeams.find(t => t.id === p.team_id)
    return { ...p, team_name: team?.name || '未知' }
  })

  // 分頁
  const start = (page - 1) * perPage
  const paged = playersWithTeam.slice(start, start + perPage)

  return {
    status: 'success',
    data: paged,
    meta: { total: playersWithTeam.length, page, per_page: perPage },
  }
})
