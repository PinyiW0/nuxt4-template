import type { H3Event } from 'h3'

import { mockTrainings } from '../../mock/data/trainings'

export default defineEventHandler((event: H3Event) => {
  const query = getQuery(event) as { date_from?: string, date_to?: string, page?: string, page_size?: string }
  const page = Number(query.page) || 1
  const pageSize = Number(query.page_size) || 10
  const today = new Date().toISOString().split('T')[0]!

  // 訓練列表：今天及未來的訓練
  let trainings = mockTrainings.filter(t => t.status === 'active' && t.date >= today)

  if (query.date_from) {
    trainings = trainings.filter(t => t.date >= query.date_from!)
  }
  if (query.date_to) {
    trainings = trainings.filter(t => t.date <= query.date_to!)
  }

  trainings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const start = (page - 1) * pageSize
  const paged = trainings.slice(start, start + pageSize)

  return {
    status: 'success' as const,
    data: paged.map(t => ({
      id: t.id,
      date: t.date,
      player_name: t.player_name,
      team_name: t.team_name,
      pitch_count: t.pitch_count,
      ai_status: t.ai_status,
      created_by: t.created_by,
      created_at: t.created_at,
    })),
    meta: { total: trainings.length, page, page_size: pageSize },
  }
})
