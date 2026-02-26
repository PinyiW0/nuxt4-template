// 分析相關型別

export interface TrainingAnalysis {
  total_pitches: number
  strike_count: number
  ball_count: number
  strike_rate: number
  avg_velocity: number
  max_velocity: number
  min_velocity: number
  avg_spin_rate: number
  heat_map: HeatMapPoint[]
}

export interface HeatMapPoint {
  x: number
  y: number
  density: number
}

export interface PlayerAnalyticsItem {
  id: number
  name: string
  number: number
  team_name: string
  training_count: number
  total_pitches: number
  last_training_date: string
  avg_velocity: number
}

export interface PlayerStatsData {
  avg_velocity: number
  avg_spin_rate: number
  strike_rate: number
  total_pitches: number
  heat_map: HeatMapPoint[]
  period_start: string
  period_end: string
}

export interface BatchDeletePlayersAnalysisBody {
  player_ids: number[]
}
