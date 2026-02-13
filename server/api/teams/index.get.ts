import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'
import { mockTeams } from '../../mock/data/teams'

export default defineEventHandler((event: H3Event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.page_size) || 10

  const user = query.user as string | undefined
  const role = query.role as string | undefined

  let activeTeams = mockTeams.filter(t => t.status === 'active')

  // 教練只能查詢自己建立的球隊
  if (role !== '管理者' && user) {
    activeTeams = activeTeams.filter(t => t.created_by === user)
  }

  // 計算 player_count
  const teamsWithCount = activeTeams.map(t => ({
    id: t.id,
    name: t.name,
    player_count: mockPlayers.filter(p => p.team_id === t.id && p.status === 'active').length,
    created_by: t.created_by,
    created_at: t.created_at,
    status: t.status,
  }))

  // 按建立時間倒序
  teamsWithCount.sort((a, b) => b.created_at.localeCompare(a.created_at))

  const start = (page - 1) * pageSize
  const paged = teamsWithCount.slice(start, start + pageSize)

  return {
    status: 'success',
    data: paged,
    total: teamsWithCount.length,
    page,
    page_size: pageSize,
  }
})
