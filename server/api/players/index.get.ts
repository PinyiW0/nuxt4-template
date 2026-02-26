import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'

export default defineEventHandler((event: H3Event) => {
  const query = getQuery(event) as { team_id?: string, page?: string, page_size?: string }
  const teamId = query.team_id ? Number(query.team_id) : null
  const page = Number(query.page) || 1
  const pageSize = Number(query.page_size) || 10

  let players = mockPlayers.filter(p => p.status === 'active')

  if (teamId) {
    players = players.filter(p => p.team_id === teamId)
  }

  players.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const start = (page - 1) * pageSize
  const paged = players.slice(start, start + pageSize)

  return {
    status: 'success' as const,
    data: paged,
    meta: { total: players.length, page, page_size: pageSize },
  }
})
