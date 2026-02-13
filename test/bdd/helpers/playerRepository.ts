export interface Player {
  id: number
  number: number
  name: string
  height: number
  position: string
  teamId: number
  teamName: string
  sortOrder: number
  createdAt: Date
  status: string
}

export function createPlayerRepository() {
  const players = new Map<number, Player>()
  let nextId = 1

  return {
    save(player: Omit<Player, 'id'> & { id?: number }): Player {
      const id = player.id ?? nextId++
      const savedPlayer: Player = { ...player, id }
      players.set(id, savedPlayer)
      if (id >= nextId)
        nextId = id + 1
      return savedPlayer
    },

    findById(id: number): Player | undefined {
      return players.get(id)
    },

    findByName(name: string): Player | undefined {
      return Array.from(players.values()).find(p => p.name === name)
    },

    findByTeamId(teamId: number): Player[] {
      return Array.from(players.values()).filter(p => p.teamId === teamId)
    },

    findAllActive(): Player[] {
      return Array.from(players.values()).filter(p => p.status === 'active')
    },

    findActiveByTeamId(teamId: number): Player[] {
      return Array.from(players.values()).filter(p => p.teamId === teamId && p.status === 'active')
    },

    findAll(): Player[] {
      return Array.from(players.values())
    },

    update(id: number, data: Partial<Player>): Player | undefined {
      const player = players.get(id)
      if (!player)
        return undefined
      const updated = { ...player, ...data }
      players.set(id, updated)
      return updated
    },

    clear(): void {
      players.clear()
      nextId = 1
    },
  }
}

export type PlayerRepository = ReturnType<typeof createPlayerRepository>
