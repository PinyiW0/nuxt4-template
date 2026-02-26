// 球隊相關型別

export interface TeamItem {
  id: number
  name: string
  player_count: number
  created_by: string
  created_at: string
  status: 'active' | 'deleted'
}

export interface CreateTeamBody {
  name: string
}

export interface UpdateTeamBody {
  name: string
}
