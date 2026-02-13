export interface PlayerItem {
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

export interface CreatePlayerBody {
  number: number
  name: string
  height: number
  position: string
  team_id: number
}

export interface UpdatePlayerBody {
  number?: number
  name?: string
  height?: number
  position?: string
}

export interface SortPlayersBody {
  team_id: number
  player_ids: number[]
}
