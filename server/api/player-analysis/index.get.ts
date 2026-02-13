import type { H3Event } from 'h3'

import { mockPlayerAnalysis } from '../../mock/data/playerAnalysis'

export default defineEventHandler((event: H3Event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const pageSize = Number(query.page_size) || 10
  const teamId = query.team_id ? Number(query.team_id) : null
  const search = (query.search as string) || ''

  let filtered = [...mockPlayerAnalysis]

  if (teamId) {
    filtered = filtered.filter(a => a.team_id === teamId)
  }

  if (search) {
    filtered = filtered.filter(a => a.name.includes(search))
  }

  const start = (page - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  // 移除 team_id（內部欄位，不回傳）
  const data = paged.map(({ team_id: _tid, ...rest }) => rest)

  return {
    status: 'success',
    data,
    total: filtered.length,
    page,
    page_size: pageSize,
  }
})
