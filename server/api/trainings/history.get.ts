import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'
import { mockTeams } from '../../mock/data/teams'
import { mockTrainings } from '../../mock/data/trainings'

export default defineEventHandler((event: H3Event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.page_size) || 10
  const teamId = query.team_id ? Number(query.team_id) : null
  const dateFrom = (query.date_from as string) || null
  const dateTo = (query.date_to as string) || null

  const today = new Date().toISOString().slice(0, 10)

  let filtered = mockTrainings.filter(t => t.status === 'active' && t.date <= today)

  if (teamId) {
    filtered = filtered.filter(t => t.team_id === teamId)
  }
  if (dateFrom) {
    filtered = filtered.filter(t => t.date >= dateFrom)
  }
  if (dateTo) {
    filtered = filtered.filter(t => t.date <= dateTo)
  }

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
