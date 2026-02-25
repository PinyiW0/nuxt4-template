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
  heat_map_data: HeatMapPoint[]
}

export interface HeatMapPoint {
  location_x: number
  location_y: number
  count: number
}

export interface PlayerAnalysisItem {
  id: number
  name: string
  number: number
  team_id: number
  team_name: string
  training_count: number
  total_pitches: number
  last_training_date: string
  avg_velocity: number
}

export interface PlayerStatistics {
  avg_velocity: number | null
  avg_spin_rate: number | null
  strike_rate: number | null
  total_pitches: number
  heat_map_data: HeatMapPoint[]
}

export interface BatchDeletePlayerAnalysisBody {
  player_ids: number[]
}
