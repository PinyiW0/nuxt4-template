import type { MockTraining } from './types'

export const mockTrainings: MockTraining[] = [
  // coach1 的訓練（藍鷹隊球員）— 未來訓練
  { id: 1, date: '2026-03-01', player_id: 1, team_id: 1, pitch_count: 0, ai_status: 'stopped', strike_zone_top: 120, strike_zone_bottom: 50, created_by: 'coach1', created_at: '2026-02-20T09:00:00', status: 'active' },
  { id: 2, date: '2026-03-05', player_id: 2, team_id: 1, pitch_count: 0, ai_status: 'stopped', strike_zone_top: 125, strike_zone_bottom: 52, created_by: 'coach1', created_at: '2026-02-21T10:00:00', status: 'active' },
  { id: 3, date: '2026-03-10', player_id: 1, team_id: 1, pitch_count: 0, ai_status: 'stopped', strike_zone_top: 120, strike_zone_bottom: 50, created_by: 'coach1', created_at: '2026-02-22T10:00:00', status: 'active' },
  // coach1 的訓練 — 歷史訓練（今天及過去）
  { id: 4, date: '2026-02-24', player_id: 1, team_id: 1, pitch_count: 45, ai_status: 'stopped', strike_zone_top: 120, strike_zone_bottom: 50, created_by: 'coach1', created_at: '2026-02-24T09:00:00', status: 'active' },
  { id: 5, date: '2026-02-20', player_id: 2, team_id: 1, pitch_count: 38, ai_status: 'stopped', strike_zone_top: 125, strike_zone_bottom: 52, created_by: 'coach1', created_at: '2026-02-20T10:00:00', status: 'active' },
  { id: 6, date: '2026-02-15', player_id: 1, team_id: 1, pitch_count: 50, ai_status: 'stopped', strike_zone_top: 120, strike_zone_bottom: 50, created_by: 'coach1', created_at: '2026-02-15T09:00:00', status: 'active' },
  { id: 7, date: '2026-02-10', player_id: 3, team_id: 1, pitch_count: 42, ai_status: 'stopped', strike_zone_top: 122, strike_zone_bottom: 48, created_by: 'coach1', created_at: '2026-02-10T14:00:00', status: 'active' },
  { id: 8, date: '2026-02-05', player_id: 1, team_id: 1, pitch_count: 55, ai_status: 'stopped', strike_zone_top: 120, strike_zone_bottom: 50, created_by: 'coach1', created_at: '2026-02-05T09:00:00', status: 'active' },
  { id: 9, date: '2026-01-30', player_id: 2, team_id: 1, pitch_count: 40, ai_status: 'stopped', strike_zone_top: 125, strike_zone_bottom: 52, created_by: 'coach1', created_at: '2026-01-30T10:00:00', status: 'active' },
  { id: 10, date: '2026-01-25', player_id: 1, team_id: 1, pitch_count: 48, ai_status: 'stopped', strike_zone_top: 120, strike_zone_bottom: 50, created_by: 'coach1', created_at: '2026-01-25T09:00:00', status: 'active' },
  { id: 11, date: '2026-01-20', player_id: 3, team_id: 1, pitch_count: 35, ai_status: 'stopped', strike_zone_top: 122, strike_zone_bottom: 48, created_by: 'coach1', created_at: '2026-01-20T14:00:00', status: 'active' },
  { id: 12, date: '2026-01-15', player_id: 1, team_id: 1, pitch_count: 52, ai_status: 'stopped', strike_zone_top: 120, strike_zone_bottom: 50, created_by: 'coach1', created_at: '2026-01-15T09:00:00', status: 'active' },
  // coach2 的訓練
  { id: 13, date: '2026-02-22', player_id: 9, team_id: 3, pitch_count: 30, ai_status: 'stopped', strike_zone_top: 122, strike_zone_bottom: 48, created_by: 'coach2', created_at: '2026-02-22T09:00:00', status: 'active' },
  { id: 14, date: '2026-03-02', player_id: 10, team_id: 3, pitch_count: 0, ai_status: 'stopped', strike_zone_top: 130, strike_zone_bottom: 55, created_by: 'coach2', created_at: '2026-02-23T10:00:00', status: 'active' },
  // 已刪除
  { id: 15, date: '2026-01-10', player_id: 1, team_id: 1, pitch_count: 20, ai_status: 'stopped', strike_zone_top: 120, strike_zone_bottom: 50, created_by: 'coach1', created_at: '2026-01-10T09:00:00', status: 'deleted' },
]
