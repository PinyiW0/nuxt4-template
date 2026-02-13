import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'
import { mockTeams } from '../../mock/data/teams'

export default defineEventHandler((event: H3Event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.page_size) || 10
  const teamId = query.team_id ? Number(query.team_id) : null
  const search = (query.search as string) || ''
  const user = query.user as string | undefined
  const role = query.role as string | undefined

  let filtered = mockPlayers.filter(p => p.status === 'active')

  // 教練只能查詢自己球隊的球員
  if (role !== '管理者' && user) {
    const userTeamIds = mockTeams
      .filter(t => t.created_by === user && t.status === 'active')
      .map(t => t.id)
    filtered = filtered.filter(p => userTeamIds.includes(p.team_id))
  }

  if (teamId) {
    filtered = filtered.filter(p => p.team_id === teamId)
  }

  if (search) {
    filtered = filtered.filter(p => p.name.includes(search))
  }

  // 依 sort_order 排序
  filtered.sort((a, b) => a.sort_order - b.sort_order)

  // 加入 team_name
  const withTeamName = filtered.map(p => ({
    id: p.id,
    number: p.number,
    name: p.name,
    height: p.height,
    position: p.position,
    team_id: p.team_id,
    team_name: mockTeams.find(t => t.id === p.team_id)?.name || '',
    sort_order: p.sort_order,
    created_at: p.created_at,
    status: p.status,
  }))

  const start = (page - 1) * pageSize
  const paged = withTeamName.slice(start, start + pageSize)

  return {
    status: 'success',
    data: paged,
    total: withTeamName.length,
    page,
    page_size: pageSize,
  }
})
