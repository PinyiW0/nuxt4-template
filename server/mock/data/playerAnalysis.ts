import type { PlayerAnalysis } from './types'
import { players } from './players'
import { teams } from './teams'

export const playerAnalyses: PlayerAnalysis[] = [
  {
    player_id: 1,
    training_count: 10,
    total_pitches: 500,
    last_training_date: '2026-01-25',
    avg_velocity: 128.5,
    avg_spin_rate: 2250,
    strike_rate: 65.2,
  },
  {
    player_id: 2,
    training_count: 8,
    total_pitches: 400,
    last_training_date: '2026-01-24',
    avg_velocity: 125.3,
    avg_spin_rate: 2180,
    strike_rate: 62.5,
  },
  {
    player_id: 3,
    training_count: 5,
    total_pitches: 250,
    last_training_date: '2026-01-23',
    avg_velocity: 130.2,
    avg_spin_rate: 2320,
    strike_rate: 68.0,
  },
  {
    player_id: 5,
    training_count: 3,
    total_pitches: 150,
    last_training_date: '2026-01-20',
    avg_velocity: 122.8,
    avg_spin_rate: 2100,
    strike_rate: 58.7,
  },
]

export function getPlayerAnalyses(): PlayerAnalysis[] {
  return playerAnalyses.filter((pa) => {
    const player = players.find(p => p.id === pa.player_id)
    return player && player.status === 'active'
  })
}

export function getPlayerAnalysisById(playerId: number): PlayerAnalysis | undefined {
  const analysis = playerAnalyses.find(pa => pa.player_id === playerId)
  if (!analysis)
    return undefined

  const player = players.find(p => p.id === playerId)
  if (!player || player.status !== 'active')
    return undefined

  return analysis
}

export function getPlayerAnalysesByCreator(createdBy: string): PlayerAnalysis[] {
  const userTeams = teams.filter(t => t.created_by === createdBy && t.status === 'active')
  const teamIds = userTeams.map(t => t.id)

  return playerAnalyses.filter((pa) => {
    const player = players.find(p => p.id === pa.player_id)
    return player && player.status === 'active' && teamIds.includes(player.team_id)
  })
}

export function getPlayerAnalysesByTeam(teamId: number): PlayerAnalysis[] {
  return playerAnalyses.filter((pa) => {
    const player = players.find(p => p.id === pa.player_id)
    return player && player.status === 'active' && player.team_id === teamId
  })
}

export function deletePlayerAnalysis(playerId: number): boolean {
  const index = playerAnalyses.findIndex(pa => pa.player_id === playerId)
  if (index !== -1) {
    playerAnalyses.splice(index, 1)
    return true
  }
  return false
}

export function batchDeletePlayerAnalyses(playerIds: number[]): number {
  let deletedCount = 0
  playerIds.forEach((id) => {
    if (deletePlayerAnalysis(id)) {
      deletedCount++
    }
  })
  return deletedCount
}

export function getPlayerStatistics(playerId: number): {
  player_id: number
  training_count: number
  total_pitches: number
  last_training_date: string | null
  avg_velocity: number | null
  avg_spin_rate: number | null
  strike_rate: number | null
  velocity_trend: { date: string, value: number }[]
  pitch_type_distribution: { type: string, count: number, percentage: number }[]
  strike_zone_heatmap: { x: number, y: number, count: number }[]
} | undefined {
  const analysis = getPlayerAnalysisById(playerId)
  if (!analysis)
    return undefined

  // 生成模擬的球速趨勢數據
  const velocityTrend: { date: string, value: number }[] = []
  for (let i = 9; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i * 3)
    velocityTrend.push({
      date: date.toISOString().split('T')[0]!,
      value: (analysis.avg_velocity ?? 125) + (Math.random() - 0.5) * 5,
    })
  }

  // 生成模擬的球種分布
  const pitchTypeDistribution = [
    { type: '直球', count: Math.round(analysis.total_pitches * 0.55), percentage: 55 },
    { type: '滑球', count: Math.round(analysis.total_pitches * 0.2), percentage: 20 },
    { type: '曲球', count: Math.round(analysis.total_pitches * 0.15), percentage: 15 },
    { type: '變速球', count: Math.round(analysis.total_pitches * 0.1), percentage: 10 },
  ]

  // 生成模擬的熱區圖數據 (3x3 九宮格)
  const strikeZoneHeatmap = []
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      strikeZoneHeatmap.push({
        x: col,
        y: row,
        count: Math.round(Math.random() * 50 + 10),
      })
    }
  }

  return {
    player_id: playerId,
    training_count: analysis.training_count,
    total_pitches: analysis.total_pitches,
    last_training_date: analysis.last_training_date,
    avg_velocity: analysis.avg_velocity,
    avg_spin_rate: analysis.avg_spin_rate,
    strike_rate: analysis.strike_rate,
    velocity_trend: velocityTrend,
    pitch_type_distribution: pitchTypeDistribution,
    strike_zone_heatmap: strikeZoneHeatmap,
  }
}
