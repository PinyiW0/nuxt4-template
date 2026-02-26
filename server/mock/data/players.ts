// Mock 球員資料（≥11 筆以支援分頁測試）

export interface MockPlayer {
  id: number
  number: number
  name: string
  height: number
  position: string
  team_id: number
  team_name: string
  sort_order: number
  created_at: string
  status: 'active' | 'deleted'
}

export const mockPlayers: MockPlayer[] = [
  { id: 1, number: 1, name: '王小明', height: 175, position: '投手', team_id: 1, team_name: '藍鷹隊', sort_order: 1, created_at: '2026-01-01T10:00:00', status: 'active' },
  { id: 2, number: 10, name: '李大華', height: 180, position: '捕手', team_id: 1, team_name: '藍鷹隊', sort_order: 2, created_at: '2026-01-02T10:00:00', status: 'active' },
  { id: 3, number: 5, name: '張三豐', height: 178, position: '游擊手', team_id: 1, team_name: '藍鷹隊', sort_order: 3, created_at: '2026-01-03T10:00:00', status: 'active' },
  { id: 4, number: 7, name: '陳志明', height: 182, position: '一壘手', team_id: 1, team_name: '藍鷹隊', sort_order: 4, created_at: '2026-01-04T10:00:00', status: 'active' },
  { id: 5, number: 14, name: '林建宏', height: 176, position: '二壘手', team_id: 1, team_name: '藍鷹隊', sort_order: 5, created_at: '2026-01-05T10:00:00', status: 'active' },
  { id: 6, number: 22, name: '黃俊傑', height: 185, position: '左外野手', team_id: 2, team_name: '紅龍隊', sort_order: 1, created_at: '2026-01-06T10:00:00', status: 'active' },
  { id: 7, number: 33, name: '趙子龍', height: 179, position: '中外野手', team_id: 2, team_name: '紅龍隊', sort_order: 2, created_at: '2026-01-07T10:00:00', status: 'active' },
  { id: 8, number: 44, name: '吳承恩', height: 177, position: '右外野手', team_id: 2, team_name: '紅龍隊', sort_order: 3, created_at: '2026-01-08T10:00:00', status: 'active' },
  { id: 9, number: 55, name: '鄭成功', height: 183, position: '三壘手', team_id: 2, team_name: '紅龍隊', sort_order: 4, created_at: '2026-01-09T10:00:00', status: 'active' },
  { id: 10, number: 8, name: '劉備', height: 174, position: '指定打擊', team_id: 3, team_name: '白虎隊', sort_order: 1, created_at: '2026-01-10T10:00:00', status: 'active' },
  { id: 11, number: 9, name: '關羽', height: 190, position: '投手', team_id: 3, team_name: '白虎隊', sort_order: 2, created_at: '2026-01-11T10:00:00', status: 'active' },
  { id: 12, number: 11, name: '張飛', height: 188, position: '捕手', team_id: 3, team_name: '白虎隊', sort_order: 3, created_at: '2026-01-12T10:00:00', status: 'active' },
  { id: 13, number: 99, name: '已刪除球員', height: 172, position: '外野手', team_id: 1, team_name: '藍鷹隊', sort_order: 6, created_at: '2026-01-13T10:00:00', status: 'deleted' },
]

export function getNextPlayerId(): number {
  return Math.max(...mockPlayers.map(p => p.id)) + 1
}
