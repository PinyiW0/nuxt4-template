export type Position
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
