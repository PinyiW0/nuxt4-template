// Mock 球隊資料（≥11 筆以支援分頁測試）

export interface MockTeam {
  id: number
  name: string
  created_by: string
  player_count: number
  created_at: string
  status: 'active' | 'deleted'
}

export const mockTeams: MockTeam[] = [
  { id: 1, name: '藍鷹隊', created_by: 'coach1', player_count: 5, created_at: '2026-01-01T10:00:00', status: 'active' },
  { id: 2, name: '紅龍隊', created_by: 'coach1', player_count: 4, created_at: '2026-01-05T10:00:00', status: 'active' },
  { id: 3, name: '白虎隊', created_by: 'coach1', player_count: 3, created_at: '2026-01-10T10:00:00', status: 'active' },
  { id: 4, name: '黑豹隊', created_by: 'coach1', player_count: 3, created_at: '2026-01-15T10:00:00', status: 'active' },
  { id: 5, name: '金鷲隊', created_by: 'coach1', player_count: 2, created_at: '2026-01-20T10:00:00', status: 'active' },
  { id: 6, name: '銀狼隊', created_by: 'coach1', player_count: 2, created_at: '2026-01-25T10:00:00', status: 'active' },
  { id: 7, name: '翡翠隊', created_by: 'coach1', player_count: 1, created_at: '2026-02-01T10:00:00', status: 'active' },
  { id: 8, name: '烈焰隊', created_by: 'coach1', player_count: 1, created_at: '2026-02-05T10:00:00', status: 'active' },
  { id: 9, name: '暴風隊', created_by: 'coach1', player_count: 0, created_at: '2026-02-10T10:00:00', status: 'active' },
  { id: 10, name: '雷電隊', created_by: 'coach1', player_count: 0, created_at: '2026-02-15T10:00:00', status: 'active' },
  { id: 11, name: '海神隊', created_by: 'coach1', player_count: 0, created_at: '2026-02-20T10:00:00', status: 'active' },
  { id: 12, name: '星辰隊', created_by: 'admin', player_count: 0, created_at: '2026-02-22T10:00:00', status: 'active' },
  { id: 13, name: '已刪除隊', created_by: 'admin', player_count: 0, created_at: '2026-02-23T10:00:00', status: 'deleted' },
]

// 取得下一個可用 ID
export function getNextTeamId(): number {
  return Math.max(...mockTeams.map(t => t.id)) + 1
}
