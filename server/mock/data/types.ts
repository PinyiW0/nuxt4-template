// Mock 資料內部型別（含密碼等非 API 公開欄位）

import type { AiStatus, Position } from '../../../types/api'

export interface MockUser {
  id: number
  account: string
  password: string
  role: '管理者' | '教練'
  status: 'active' | 'locked'
  failed_attempts: number
  locked_until: string | null
}

export interface MockTeam {
  id: number
  name: string
  created_by: string
  created_at: string
  status: 'active' | 'deleted'
}

export interface MockPlayer {
  id: number
  number: number
  name: string
  height: number
  position: Position
  team_id: number
  sort_order: number
  created_at: string
  status: 'active' | 'deleted'
}

export interface MockTraining {
  id: number
  date: string
  player_id: number
  team_id: number
  pitch_count: number
  ai_status: AiStatus
  strike_zone_top: number
  strike_zone_bottom: number
  created_by: string
  created_at: string
  status: 'active' | 'deleted'
}

export interface MockPitch {
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
  status: 'active' | 'deleted'
}

export interface MockPlayerAnalysis {
  player_id: number
  training_count: number
  total_pitches: number
  last_training_date: string
  avg_velocity: number
  avg_spin_rate: number
  strike_rate: number
}
