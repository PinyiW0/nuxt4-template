export interface TrainingAnalysis {
  training_id: number
  total_pitches: number
  strike_count: number
  ball_count: number
  strike_rate: number
  avg_velocity: number
  max_velocity: number
  min_velocity: number
  avg_spin_rate: number
  heat_map_data: Record<string, unknown>
}

export interface PlayerAnalysisItem {
  id: number
  player_id: number
  name: string
  number: number
  team_name: string
  training_count: number
  total_pitches: number
  last_training_date: string
  avg_velocity: number | null
}

export interface BatchDeleteAnalysisBody {
  player_ids: number[]
}

export interface PlayerStatistics {
  player_id: number
  period: string
  avg_velocity: number | null
  avg_spin_rate: number | null
  strike_rate: number | null
  total_pitches: number
  heat_map_data: Record<string, unknown>[] | null
}
