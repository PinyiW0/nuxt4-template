import type { MockPlayer } from './types'

export const mockPlayers: MockPlayer[] = [
  // 藍鷹隊 (team_id: 1, coach1)
  { id: 1, number: 1, name: '王小明', height: 175, position: '投手', team_id: 1, sort_order: 1, created_at: '2026-01-01T10:00:00', status: 'active' },
  { id: 2, number: 10, name: '李大華', height: 180, position: '捕手', team_id: 1, sort_order: 2, created_at: '2026-01-02T10:00:00', status: 'active' },
  { id: 3, number: 5, name: '陳志豪', height: 178, position: '游擊手', team_id: 1, sort_order: 3, created_at: '2026-01-03T10:00:00', status: 'active' },
  { id: 4, number: 99, name: '林建宏', height: 182, position: '一壘手', team_id: 1, sort_order: 4, created_at: '2026-01-04T10:00:00', status: 'active' },
  { id: 5, number: 7, name: '張偉翔', height: 176, position: '右外野手', team_id: 1, sort_order: 5, created_at: '2026-01-05T10:00:00', status: 'active' },
  // 紅龍隊 (team_id: 2, coach1)
  { id: 6, number: 3, name: '黃俊傑', height: 179, position: '二壘手', team_id: 2, sort_order: 1, created_at: '2026-01-06T10:00:00', status: 'active' },
  { id: 7, number: 8, name: '劉冠廷', height: 183, position: '投手', team_id: 2, sort_order: 2, created_at: '2026-01-07T10:00:00', status: 'active' },
  { id: 8, number: 15, name: '吳宗翰', height: 177, position: '三壘手', team_id: 2, sort_order: 3, created_at: '2026-01-08T10:00:00', status: 'active' },
  // 白虎隊 (team_id: 3, coach2)
  { id: 9, number: 2, name: '張三豐', height: 178, position: '游擊手', team_id: 3, sort_order: 1, created_at: '2026-01-09T10:00:00', status: 'active' },
  { id: 10, number: 11, name: '趙子龍', height: 185, position: '投手', team_id: 3, sort_order: 2, created_at: '2026-01-10T10:00:00', status: 'active' },
  { id: 11, number: 22, name: '周伯通', height: 174, position: '捕手', team_id: 3, sort_order: 3, created_at: '2026-01-11T10:00:00', status: 'active' },
  { id: 12, number: 33, name: '孫悟空', height: 172, position: '左外野手', team_id: 3, sort_order: 4, created_at: '2026-01-12T10:00:00', status: 'active' },
  // 已刪除
  { id: 13, number: 44, name: '已退出球員', height: 170, position: '指定打擊', team_id: 1, sort_order: 99, created_at: '2025-12-01T10:00:00', status: 'deleted' },
]
