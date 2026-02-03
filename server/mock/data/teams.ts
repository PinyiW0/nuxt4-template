import type { Team } from './types'

export const teams: Team[] = [
  {
    id: 1,
    name: '藍鷹隊',
    created_by: 'coach1',
    status: 'active',
    created_at: '2025-06-01T09:00:00',
  },
  {
    id: 2,
    name: '紅龍隊',
    created_by: 'coach2',
    status: 'active',
    created_at: '2025-06-02T10:00:00',
  },
  {
    id: 3,
    name: '綠巨人隊',
    created_by: 'admin',
    status: 'active',
    created_at: '2025-06-03T11:00:00',
  },
]

let nextTeamId = 4

export function getTeams(): Team[] {
  return teams.filter(t => t.status === 'active')
}

export function getTeamById(id: number): Team | undefined {
  return teams.find(t => t.id === id && t.status === 'active')
}

export function getTeamsByCreator(createdBy: string): Team[] {
  return teams.filter(t => t.created_by === createdBy && t.status === 'active')
}

export function createTeam(data: { name: string, created_by: string }): Team {
  const team: Team = {
    id: nextTeamId++,
    name: data.name,
    created_by: data.created_by,
    status: 'active',
    created_at: new Date().toISOString(),
  }
  teams.push(team)
  return team
}

export function updateTeam(id: number, data: { name: string }): Team | undefined {
  const team = teams.find(t => t.id === id && t.status === 'active')
  if (team) {
    team.name = data.name
  }
  return team
}

export function deleteTeam(id: number): boolean {
  const team = teams.find(t => t.id === id && t.status === 'active')
  if (team) {
    team.status = 'deleted'
    return true
  }
  return false
}

export function isTeamNameExists(name: string, excludeId?: number): boolean {
  return teams.some(t => t.name === name && t.status === 'active' && t.id !== excludeId)
}
