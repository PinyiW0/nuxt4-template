import type { EventBus } from './eventBus'
import type { PlayerRepository } from './playerRepository'
import type { Team, TeamRepository } from './teamRepository'

export interface TeamServiceDeps {
  teamRepository: TeamRepository
  eventBus: EventBus
  playerRepository?: PlayerRepository
}

export interface TeamQueryResult {
  items: Team[]
  page: number
  pageSize: number
  total: number
}

export function createTeamService({ teamRepository, eventBus, playerRepository }: TeamServiceDeps) {
  return {
    getTeams(options: { createdBy?: string, role?: string, page?: number, pageSize?: number } = {}): TeamQueryResult {
      const { role, createdBy, page = 1, pageSize = 20 } = options

      let teams: Team[]
      if (role === '管理者') {
        teams = teamRepository.findAllActive()
      }
      else if (createdBy) {
        teams = teamRepository.findByCreatedBy(createdBy)
      }
      else {
        teams = teamRepository.findAllActive()
      }

      // Sort by created_at descending (newest first)
      teams.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      return {
        items: teams,
        page,
        pageSize,
        total: teams.length,
      }
    },

    createTeam(data: { name: string, createdBy: string }): Team {
      if (!data.name) {
        throw new Error('球隊名稱不可為空')
      }

      const existing = teamRepository.findByName(data.name)
      if (existing && existing.status === 'active') {
        throw new Error('球隊名稱已存在')
      }

      const team = teamRepository.save({
        name: data.name,
        createdBy: data.createdBy,
        playerCount: 0,
        createdAt: new Date(),
        status: 'active',
      })

      eventBus.emit('球隊已建立')
      return team
    },

    updateTeam(data: { teamName: string, newName: string, updatedBy: string, role: string }): Team {
      const team = teamRepository.findByName(data.teamName)
      if (!team || team.status === 'deleted') {
        throw new Error('球隊不存在或已刪除')
      }

      if (data.role !== '管理者' && team.createdBy !== data.updatedBy) {
        throw new Error('無權限操作此球隊')
      }

      if (!data.newName) {
        throw new Error('球隊名稱不可為空')
      }

      if (data.newName !== data.teamName) {
        const existing = teamRepository.findByName(data.newName)
        if (existing && existing.status === 'active') {
          throw new Error('球隊名稱已存在')
        }
      }

      const updated = teamRepository.update(team.id, { name: data.newName })
      eventBus.emit('球隊已更新')
      return updated!
    },

    deleteTeam(data: { teamName: string, deletedBy: string, role: string }): void {
      const team = teamRepository.findByName(data.teamName)
      if (!team || team.status === 'deleted') {
        throw new Error('球隊不存在或已刪除')
      }

      if (data.role !== '管理者' && team.createdBy !== data.deletedBy) {
        throw new Error('無權限操作此球隊')
      }

      teamRepository.update(team.id, { status: 'deleted' })

      // 連帶軟刪除所有關聯球員
      if (playerRepository) {
        const players = playerRepository.findByTeamId(team.id)
        players.forEach((player) => {
          playerRepository.update(player.id, { status: 'deleted' })
        })
      }

      eventBus.emit('球隊已刪除')
    },
  }
}

export type TeamService = ReturnType<typeof createTeamService>
