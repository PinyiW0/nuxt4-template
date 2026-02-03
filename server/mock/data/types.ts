// Mock 資料類型定義

export type UserRole = '管理者' | '教練'
export type Status = 'active' | 'deleted'
export type AIStatus = 'running' | 'stopped'

export interface User {
  id: number
  account: string
  password: string
  role: UserRole
  status: Status
  failed_attempts: number
  locked_until: string | null
  created_at: string
}

export interface Team {
  id: number
  name: string
  created_by: string
  status: Status
  created_at: string
}

export type PlayerPosition
  = | '投手'
    | '捕手'
    | '一壘手'
    | '二壘手'
    | '三壘手'
    | '游擊手'
    | '左外野手'
    | '中外野手'
    | '右外野手'
    | '指定打擊'

export interface Player {
  id: number
  number: number
  name: string
  height: number
  position: PlayerPosition
  team_id: number
  sort_order: number
  created_by: string
  status: Status
  created_at: string
}

export interface Training {
  id: number
  date: string
  player_id: number
  team_id: number
  pitch_count: number
  ai_status: AIStatus
  strike_zone_top: number
  strike_zone_bottom: number
  created_by: string
  status: Status
  created_at: string
}

export interface Pitch {
  id: number
  training_id: number
  sequence: number
  time: string
  velocity: number
  spin_rate: number
  is_strike: boolean
  location_x: number
  location_y: number
  trajectory_data: Record<string, unknown>
  status: Status
  created_at: string
}

export interface PlayerAnalysis {
  player_id: number
  training_count: number
  total_pitches: number
  last_training_date: string | null
  avg_velocity: number | null
  avg_spin_rate: number | null
  strike_rate: number | null
}
