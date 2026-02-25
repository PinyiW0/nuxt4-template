import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'
import { mockTeams } from '../../mock/data/teams'

export default defineEventHandler((event: H3Event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const perPage = Number(query.per_page) || 20

  // 篩選 active 球隊
  let teams = mockTeams.filter(t => t.status === 'active')

  // 依建立時間倒序
  teams = teams.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // 計算球員數量
  const teamsWithCount = teams.map(t => ({
    ...t,
    player_count: mockPlayers.filter(p => p.team_id === t.id && p.status === 'active').length,
  }))

  // 分頁
  const start = (page - 1) * perPage
  const paged = teamsWithCount.slice(start, start + perPage)

  return {
    status: 'success',
    data: paged,
    meta: { total: teamsWithCount.length, page, per_page: perPage },
  }
})
