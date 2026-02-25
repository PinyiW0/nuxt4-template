// 訓練相關型別

export type AiStatus = 'running' | 'stopped'

export interface TrainingItem {
  id: number
  date: string
  player_id: number
  player_name: string
  team_id: number
  team_name: string
  pitch_count: number
  ai_status: AiStatus
  created_by: string
  created_at: string
  status: 'active' | 'deleted'
}

export interface TrainingDetail {
  id: number
  date: string
  player_id: number
  player_name: string
  team_id: number
  team_name: string
  strike_zone_top: number
  strike_zone_bottom: number
  pitch_count: number
  ai_status: AiStatus
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
