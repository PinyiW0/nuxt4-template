// Mock 訓練資料（≥11 筆以支援分頁測試）

export interface MockTraining {
  id: number
  date: string
  player_id: number
  player_name: string
  team_id: number
  team_name: string
  pitch_count: number
  ai_status: 'running' | 'stopped'
  strike_zone_top: number
  strike_zone_bottom: number
  created_by: string
  created_at: string
  status: 'active' | 'deleted'
}

export const mockTrainings: MockTraining[] = [
  // 未來/今天的訓練（出現在訓練列表）
  { id: 1, date: '2026-03-01', player_id: 1, player_name: '王小明', team_id: 1, team_name: '藍鷹隊', pitch_count: 0, ai_status: 'stopped', strike_zone_top: 120, strike_zone_bottom: 50, created_by: 'coach1', created_at: '2026-02-25T09:00:00', status: 'active' },
  { id: 2, date: '2026-03-02', player_id: 2, player_name: '李大華', team_id: 1, team_name: '藍鷹隊', pitch_count: 0, ai_status: 'stopped', strike_zone_top: 125, strike_zone_bottom: 52, created_by: 'coach1', created_at: '2026-02-25T10:00:00', status: 'active' },
  { id: 3, date: '2026-03-03', player_id: 3, player_name: '張三豐', team_id: 1, team_name: '藍鷹隊', pitch_count: 0, ai_status: 'stopped', strike_zone_top: 122, strike_zone_bottom: 48, created_by: 'coach1', created_at: '2026-02-25T11:00:00', status: 'active' },
  { id: 4, date: '2026-02-26', player_id: 1, player_name: '王小明', team_id: 1, team_name: '藍鷹隊', pitch_count: 30, ai_status: 'running', strike_zone_top: 120, strike_zone_bottom: 50, created_by: 'coach1', created_at: '2026-02-26T08:00:00', status: 'active' },

  // 歷史訓練（出現在歷史訓練列表）
  { id: 5, date: '2026-02-20', player_id: 1, player_name: '王小明', team_id: 1, team_name: '藍鷹隊', pitch_count: 50, ai_status: 'stopped', strike_zone_top: 120, strike_zone_bottom: 50, created_by: 'coach1', created_at: '2026-02-20T09:00:00', status: 'active' },
  { id: 6, date: '2026-02-18', player_id: 2, player_name: '李大華', team_id: 1, team_name: '藍鷹隊', pitch_count: 45, ai_status: 'stopped', strike_zone_top: 125, strike_zone_bottom: 52, created_by: 'coach1', created_at: '2026-02-18T09:00:00', status: 'active' },
  { id: 7, date: '2026-02-15', player_id: 1, player_name: '王小明', team_id: 1, team_name: '藍鷹隊', pitch_count: 60, ai_status: 'stopped', strike_zone_top: 120, strike_zone_bottom: 50, created_by: 'coach1', created_at: '2026-02-15T09:00:00', status: 'active' },
  { id: 8, date: '2026-02-12', player_id: 3, player_name: '張三豐', team_id: 1, team_name: '藍鷹隊', pitch_count: 40, ai_status: 'stopped', strike_zone_top: 122, strike_zone_bottom: 48, created_by: 'coach1', created_at: '2026-02-12T09:00:00', status: 'active' },
  { id: 9, date: '2026-02-10', player_id: 1, player_name: '王小明', team_id: 1, team_name: '藍鷹隊', pitch_count: 55, ai_status: 'stopped', strike_zone_top: 120, strike_zone_bottom: 50, created_by: 'coach1', created_at: '2026-02-10T09:00:00', status: 'active' },
  { id: 10, date: '2026-02-08', player_id: 2, player_name: '李大華', team_id: 1, team_name: '藍鷹隊', pitch_count: 35, ai_status: 'stopped', strike_zone_top: 125, strike_zone_bottom: 52, created_by: 'coach1', created_at: '2026-02-08T09:00:00', status: 'active' },
  { id: 11, date: '2026-02-05', player_id: 1, player_name: '王小明', team_id: 1, team_name: '藍鷹隊', pitch_count: 48, ai_status: 'stopped', strike_zone_top: 120, strike_zone_bottom: 50, created_by: 'coach1', created_at: '2026-02-05T09:00:00', status: 'active' },
  { id: 12, date: '2026-02-03', player_id: 6, player_name: '黃俊傑', team_id: 2, team_name: '紅龍隊', pitch_count: 42, ai_status: 'stopped', strike_zone_top: 128, strike_zone_bottom: 55, created_by: 'coach1', created_at: '2026-02-03T09:00:00', status: 'active' },
  { id: 13, date: '2026-02-01', player_id: 1, player_name: '王小明', team_id: 1, team_name: '藍鷹隊', pitch_count: 52, ai_status: 'stopped', strike_zone_top: 120, strike_zone_bottom: 50, created_by: 'coach1', created_at: '2026-02-01T09:00:00', status: 'active' },
  { id: 14, date: '2026-01-28', player_id: 10, player_name: '劉備', team_id: 3, team_name: '白虎隊', pitch_count: 38, ai_status: 'stopped', strike_zone_top: 118, strike_zone_bottom: 46, created_by: 'admin', created_at: '2026-01-28T09:00:00', status: 'active' },
  { id: 15, date: '2026-01-20', player_id: 1, player_name: '王小明', team_id: 1, team_name: '藍鷹隊', pitch_count: 0, ai_status: 'stopped', strike_zone_top: 120, strike_zone_bottom: 50, created_by: 'coach1', created_at: '2026-01-20T09:00:00', status: 'deleted' },
]

export function getNextTrainingId(): number {
  return Math.max(...mockTrainings.map(t => t.id)) + 1
}
