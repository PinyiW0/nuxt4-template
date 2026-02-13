import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'
import { mockTeams } from '../../mock/data/teams'
import { mockTrainings } from '../../mock/data/trainings'

export default defineEventHandler((event: H3Event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.page_size) || 10

  const user = query.user as string | undefined
  const role = query.role as string | undefined
  const today = new Date().toISOString().slice(0, 10)

  let filtered = mockTrainings.filter(t => t.status === 'active' && t.date >= today)

  // 教練只能查詢自己建立的訓練
  if (role !== '管理者' && user) {
    filtered = filtered.filter(t => t.created_by === user)
  }

  // 按建立時間倒序
  filtered.sort((a, b) => b.created_at.localeCompare(a.created_at))

  const withNames = filtered.map(t => ({
    id: t.id,
    date: t.date,
    player_id: t.player_id,
    player_name: mockPlayers.find(p => p.id === t.player_id)?.name || '',
    team_id: t.team_id,
    team_name: mockTeams.find(tm => tm.id === t.team_id)?.name || '',
    pitch_count: t.pitch_count,
    ai_status: t.ai_status,
    created_by: t.created_by,
    created_at: t.created_at,
    status: t.status,
  }))

  const start = (page - 1) * pageSize
  const paged = withNames.slice(start, start + pageSize)

  return {
    status: 'success',
    data: paged,
    total: withNames.length,
    page,
    page_size: pageSize,
  }
})
