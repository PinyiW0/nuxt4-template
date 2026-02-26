import type { H3Event } from 'h3'

import { mockTeams } from '../../mock/data/teams'

export default defineEventHandler((event: H3Event) => {
  const query = getQuery(event) as { page?: string, page_size?: string }
  const page = Number(query.page) || 1
  const pageSize = Number(query.page_size) || 10

  const activeTeams = mockTeams
    .filter(t => t.status === 'active')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const start = (page - 1) * pageSize
  const paged = activeTeams.slice(start, start + pageSize)

  return {
    status: 'success' as const,
    data: paged,
    meta: { total: activeTeams.length, page, page_size: pageSize },
  }
})
