// 訓練相關型別

export interface TrainingItem {
  id: number
  date: string
  player_name: string
  team_name: string
  pitch_count: number
  ai_status: 'running' | 'stopped'
  created_by: string
  created_at: string
}

export interface TrainingDetail {
  id: number
  date: string
  player_name: string
  team_name: string
  strike_zone_top: number
  strike_zone_bottom: number
  pitch_count: number
  ai_status: 'running' | 'stopped'
  created_by: string
  created_at: string
}

export interface CreateTrainingBody {
  date: string
  player_id: number
  strike_zone_top?: number
  strike_zone_bottom?: number
}

export interface UpdateStrikeZoneBody {
  top: number
  bottom: number
}

export interface BatchDeleteBody {
  ids: number[]
}
