import type { MockPlayer } from './types'

export const mockPlayers: MockPlayer[] = [
  {
    id: 1,
    team_id: 1,
    number: 1,
    name: '王小明',
    height: 175,
    position: '投手',
    sort_order: 1,
    created_at: '2025-01-10T00:00:00Z',
    status: 'active',
  },
  {
    id: 2,
    team_id: 1,
    number: 2,
    name: '李大華',
    height: 180,
    position: '捕手',
    sort_order: 2,
    created_at: '2025-01-11T00:00:00Z',
    status: 'active',
  },
  {
    id: 3,
    team_id: 2,
    number: 10,
    name: '張三',
    height: 178,
    position: '投手',
    sort_order: 1,
    created_at: '2025-02-01T00:00:00Z',
    status: 'active',
  },
]
