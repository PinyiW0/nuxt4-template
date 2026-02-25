import type { H3Event } from 'h3'

import { mockPlayerAnalysis } from '../../mock/data/playerAnalysis'
import { mockPlayers } from '../../mock/data/players'
import { mockTeams } from '../../mock/data/teams'

export default defineEventHandler((event: H3Event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const perPage = Number(query.per_page) || 20
  const teamId = query.team_id ? Number(query.team_id) : null
  const keyword = (query.keyword as string) || ''

  // 組合球員資訊 + 分析資料
  let results = mockPlayerAnalysis
    .map((a) => {
      const player = mockPlayers.find(p => p.id === a.player_id)
      if (!player || player.status !== 'active')
        return null
      const team = mockTeams.find(t => t.id === player.team_id)
      return {
        id: player.id,
        name: player.name,
        number: player.number,
        team_id: player.team_id,
        team_name: team?.name || '未知',
        training_count: a.training_count,
        total_pitches: a.total_pitches,
        last_training_date: a.last_training_date,
        avg_velocity: a.avg_velocity,
      }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)

  // 篩選球隊
  if (teamId) {
    results = results.filter(r => r.team_id === teamId)
  }

  // 關鍵字搜尋
  if (keyword) {
    results = results.filter(r => r.name.includes(keyword))
  }

  // 依建立時間倒序（用 player id 模擬）
  results = results.sort((a, b) => b.id - a.id)

  // 分頁
  const start = (page - 1) * perPage
  const paged = results.slice(start, start + perPage)

  return {
    status: 'success',
    data: paged,
    meta: { total: results.length, page, per_page: perPage },
  }
})
