export interface Team {
  id: number
  name: string
  createdBy: string
  playerCount: number
  createdAt: Date
  status: string
}

export function createTeamRepository() {
  const teams = new Map<number, Team>()
  let nextId = 1

  return {
    save(team: Omit<Team, 'id'> & { id?: number }): Team {
      const id = team.id ?? nextId++
      const savedTeam: Team = { ...team, id }
      teams.set(id, savedTeam)
      // Keep nextId ahead of manually set ids
      if (id >= nextId)
        nextId = id + 1
      return savedTeam
    },

    findById(id: number): Team | undefined {
      return teams.get(id)
    },

    findByName(name: string): Team | undefined {
      return Array.from(teams.values()).find(t => t.name === name)
    },

    findAll(): Team[] {
      return Array.from(teams.values())
    },

    findByCreatedBy(createdBy: string): Team[] {
      return Array.from(teams.values()).filter(t => t.createdBy === createdBy && t.status === 'active')
    },

    findAllActive(): Team[] {
      return Array.from(teams.values()).filter(t => t.status === 'active')
    },

    update(id: number, data: Partial<Team>): Team | undefined {
      const team = teams.get(id)
      if (!team)
        return undefined
      const updated = { ...team, ...data }
      teams.set(id, updated)
      return updated
    },

    delete(id: number): boolean {
      const team = teams.get(id)
      if (!team)
        return false
      team.status = 'deleted'
      teams.set(id, team)
      return true
    },

    clear(): void {
      teams.clear()
      nextId = 1
    },
  }
}

export type TeamRepository = ReturnType<typeof createTeamRepository>
