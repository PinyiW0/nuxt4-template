// Mock 專用型別（含密碼等敏感資料，不匯出到前端）

export interface MockUser {
  id: number
  account: string
  password: string
  role: '管理者' | '教練'
  status: 'active' | 'deleted'
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
  team_id: number
  number: number
  name: string
  height: number
  position: string
  sort_order: number
  created_at: string
  status: 'active' | 'deleted'
}

export interface MockTraining {
  id: number
  date: string
  player_id: number
  team_id: number
  strike_zone_top: number
  strike_zone_bottom: number
  pitch_count: number
  ai_status: 'running' | 'stopped'
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
