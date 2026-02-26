import type { H3Event } from 'h3'

import { mockPitches } from '../../../mock/data/pitches'
import { mockPlayers } from '../../../mock/data/players'
import { mockTrainings } from '../../../mock/data/trainings'

export default defineEventHandler((event: H3Event) => {
  const query = getQuery(event) as { team_id?: string, keyword?: string, page?: string, page_size?: string }
  const page = Number(query.page) || 1
  const pageSize = Number(query.page_size) || 10

  let players = mockPlayers.filter(p => p.status === 'active')

  if (query.team_id) {
    players = players.filter(p => p.team_id === Number(query.team_id))
  }

  if (query.keyword) {
    const keyword = query.keyword.toLowerCase()
    players = players.filter(p => p.name.toLowerCase().includes(keyword))
  }

  // 計算每位球員的分析數據
  const analyticsData = players.map((player) => {
    const trainings = mockTrainings.filter(t => t.player_id === player.id && t.status === 'active')
    const pitches = mockPitches.filter(p =>
      trainings.some(t => t.id === p.training_id) && p.status === 'active',
    )
    const totalPitches = pitches.length
    const avgVelocity = totalPitches > 0
      ? Math.round((pitches.reduce((a, p) => a + p.velocity, 0) / totalPitches) * 10) / 10
      : 0
    const lastTraining = trainings.sort((a, b) => b.date.localeCompare(a.date))[0]

    return {
      id: player.id,
      name: player.name,
      number: player.number,
      team_name: player.team_name,
      training_count: trainings.length,
      total_pitches: totalPitches,
      last_training_date: lastTraining?.date ?? '',
      avg_velocity: avgVelocity,
    }
  })

  analyticsData.sort((a, b) => b.last_training_date.localeCompare(a.last_training_date))

  const start = (page - 1) * pageSize
  const paged = analyticsData.slice(start, start + pageSize)

  return {
    status: 'success' as const,
    data: paged,
    meta: { total: analyticsData.length, page, page_size: pageSize },
  }
})
