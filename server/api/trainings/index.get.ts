import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'
import { mockTeams } from '../../mock/data/teams'
import { mockTrainings } from '../../mock/data/trainings'

export default defineEventHandler((event: H3Event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const perPage = Number(query.per_page) || 20
  const dateFrom = query.date_from as string | undefined
  const dateTo = query.date_to as string | undefined

  const today = new Date().toISOString().split('T')[0]!

  // 今天及未來的訓練
  let trainings = mockTrainings.filter(t => t.status === 'active' && t.date >= today)

  // 日期篩選
  if (dateFrom) {
    trainings = trainings.filter(t => t.date >= dateFrom)
  }
  if (dateTo) {
    trainings = trainings.filter(t => t.date <= dateTo)
  }

  // 依建立時間倒序
  trainings = trainings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // 附加球員、球隊名稱
  const enriched = trainings.map((t) => {
    const player = mockPlayers.find(p => p.id === t.player_id)
    const team = mockTeams.find(tm => tm.id === t.team_id)
    return {
      ...t,
      player_name: player?.name || '未知',
      team_name: team?.name || '未知',
    }
  })

  // 分頁
  const start = (page - 1) * perPage
  const paged = enriched.slice(start, start + perPage)

  return {
    status: 'success',
    data: paged,
    meta: { total: enriched.length, page, per_page: perPage },
  }
})
