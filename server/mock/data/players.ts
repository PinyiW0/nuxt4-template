import type { Player, PlayerPosition } from './types'
import { teams } from './teams'

export const players: Player[] = [
  {
    id: 1,
    number: 1,
    name: '王小明',
    height: 175,
    position: '投手',
    team_id: 1,
    sort_order: 1,
    created_by: 'coach1',
    status: 'active',
    created_at: '2026-01-01T10:00:00',
  },
  {
    id: 2,
    number: 10,
    name: '李大華',
    height: 180,
    position: '捕手',
    team_id: 1,
    sort_order: 2,
    created_by: 'coach1',
    status: 'active',
    created_at: '2026-01-02T10:00:00',
  },
  {
    id: 3,
    number: 5,
    name: '張三豐',
    height: 178,
    position: '游擊手',
    team_id: 2,
    sort_order: 1,
    created_by: 'coach2',
    status: 'active',
    created_at: '2026-01-03T10:00:00',
  },
  {
    id: 4,
    number: 99,
    name: '陳小強',
    height: 172,
    position: '左外野手',
    team_id: 1,
    sort_order: 3,
    created_by: 'coach1',
    status: 'deleted',
    created_at: '2026-01-04T10:00:00',
  },
  {
    id: 5,
    number: 7,
    name: '林志偉',
    height: 182,
    position: '一壘手',
    team_id: 2,
    sort_order: 2,
    created_by: 'coach2',
    status: 'active',
    created_at: '2026-01-05T10:00:00',
  },
]

let nextPlayerId = 6

export function getPlayers(): Player[] {
  return players.filter(p => p.status === 'active')
}

export function getPlayerById(id: number): Player | undefined {
  return players.find(p => p.id === id && p.status === 'active')
}

export function getPlayersByTeam(teamId: number): Player[] {
  return players.filter(p => p.team_id === teamId && p.status === 'active')
}

export function getPlayersByCreator(createdBy: string): Player[] {
  const userTeams = teams.filter(t => t.created_by === createdBy && t.status === 'active')
  const teamIds = userTeams.map(t => t.id)
  return players.filter(p => teamIds.includes(p.team_id) && p.status === 'active')
}

export function createPlayer(data: {
  number: number
  name: string
  height: number
  position: PlayerPosition
  team_id: number
  created_by: string
}): Player {
  const teamPlayers = getPlayersByTeam(data.team_id)
  const maxSortOrder = teamPlayers.reduce((max, p) => Math.max(max, p.sort_order), 0)

  const player: Player = {
    id: nextPlayerId++,
    number: data.number,
    name: data.name,
    height: data.height,
    position: data.position,
    team_id: data.team_id,
    sort_order: maxSortOrder + 1,
    created_by: data.created_by,
    status: 'active',
    created_at: new Date().toISOString(),
  }
  players.push(player)
  return player
}

export function updatePlayer(
  id: number,
  data: { number?: number, name?: string, height?: number, position?: PlayerPosition },
): Player | undefined {
  const player = players.find(p => p.id === id && p.status === 'active')
  if (player) {
    if (data.number !== undefined)
      player.number = data.number
    if (data.name !== undefined)
      player.name = data.name
    if (data.height !== undefined)
      player.height = data.height
    if (data.position !== undefined)
      player.position = data.position
  }
  return player
}

export function deletePlayer(id: number): boolean {
  const player = players.find(p => p.id === id && p.status === 'active')
  if (player) {
    player.status = 'deleted'
    return true
  }
  return false
}

export function isPlayerNumberExists(teamId: number, number: number, excludeId?: number): boolean {
  return players.some(
    p => p.team_id === teamId && p.number === number && p.status === 'active' && p.id !== excludeId,
  )
}

export function updatePlayersSortOrder(playerIds: number[]): boolean {
  playerIds.forEach((id, index) => {
    const player = players.find(p => p.id === id && p.status === 'active')
    if (player) {
      player.sort_order = index + 1
    }
  })
  return true
}
