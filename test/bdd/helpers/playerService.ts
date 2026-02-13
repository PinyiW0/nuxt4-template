import type { EventBus } from './eventBus'
import type { Player, PlayerRepository } from './playerRepository'
import type { TeamRepository } from './teamRepository'

const VALID_POSITIONS = ['投手', '捕手', '一壘手', '二壘手', '三壘手', '游擊手', '左外野手', '中外野手', '右外野手', '指定打擊']

export interface PlayerServiceDeps {
  playerRepository: PlayerRepository
  teamRepository: TeamRepository
  eventBus?: EventBus
}

export interface PlayerQueryResult {
  items: Player[]
  page: number
  pageSize: number
  total: number
}

export function createPlayerService({ playerRepository, teamRepository, eventBus }: PlayerServiceDeps) {
  return {
    getPlayers(options: { role?: string, createdBy?: string, teamName?: string, page?: number, pageSize?: number } = {}): PlayerQueryResult {
      const { role, createdBy, teamName, page = 1, pageSize = 20 } = options

      let players: Player[]

      if (teamName) {
        // 篩選特定球隊
        const team = teamRepository.findByName(teamName)
        players = team ? playerRepository.findActiveByTeamId(team.id) : []
      }
      else if (role === '管理者') {
        players = playerRepository.findAllActive()
      }
      else if (createdBy) {
        // 教練只能看自己球隊的球員
        const teams = teamRepository.findByCreatedBy(createdBy)
        const teamIds = teams.map(t => t.id)
        players = playerRepository.findAllActive().filter(p => teamIds.includes(p.teamId))
      }
      else {
        players = playerRepository.findAllActive()
      }

      // 依建立時間倒序排列
      players.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      return {
        items: players,
        page,
        pageSize,
        total: players.length,
      }
    },

    createPlayer(data: { teamName: string, number: number, name: string, height: number, position: string, createdBy: string }): Player {
      const team = teamRepository.findByName(data.teamName)
      if (!team || team.status === 'deleted') {
        throw new Error('球隊不存在或已刪除')
      }

      if (team.createdBy !== data.createdBy) {
        throw new Error('無權限操作此球隊')
      }

      if (!data.name) {
        throw new Error('球員姓名不可為空')
      }

      if (data.number < 0 || data.number > 999) {
        throw new Error('背號必須為 0-999')
      }

      if (data.height < 100 || data.height > 250) {
        throw new Error('身高必須為 100-250 公分')
      }

      if (!VALID_POSITIONS.includes(data.position)) {
        throw new Error('守備位置無效')
      }

      // 同球隊內背號唯一
      const existingPlayers = playerRepository.findActiveByTeamId(team.id)
      if (existingPlayers.some(p => p.number === data.number)) {
        throw new Error('該背號已被使用')
      }

      const player = playerRepository.save({
        number: data.number,
        name: data.name,
        height: data.height,
        position: data.position,
        teamId: team.id,
        teamName: data.teamName,
        sortOrder: 0,
        createdAt: new Date(),
        status: 'active',
      })

      eventBus?.emit('球員已新增')
      return player
    },

    updatePlayer(data: { playerName: string, updates: Partial<{ number: number, name: string, height: number, position: string }>, updatedBy: string, role: string }): Player {
      const player = playerRepository.findByName(data.playerName)
      if (!player || player.status === 'deleted') {
        throw new Error('球員不存在或已刪除')
      }

      const team = teamRepository.findById(player.teamId)
      if (data.role !== '管理者' && team?.createdBy !== data.updatedBy) {
        throw new Error('無權限操作此球員')
      }

      if (data.updates.number !== undefined) {
        if (data.updates.number < 0 || data.updates.number > 999) {
          throw new Error('背號必須為 0-999')
        }
        const teammates = playerRepository.findActiveByTeamId(player.teamId)
        if (teammates.some(p => p.number === data.updates.number && p.id !== player.id)) {
          throw new Error('該背號已被使用')
        }
      }

      if (data.updates.height !== undefined) {
        if (data.updates.height < 100 || data.updates.height > 250) {
          throw new Error('身高必須為 100-250 公分')
        }
      }

      if (data.updates.position !== undefined) {
        if (!VALID_POSITIONS.includes(data.updates.position)) {
          throw new Error('守備位置無效')
        }
      }

      const updated = playerRepository.update(player.id, data.updates)
      eventBus?.emit('球員已更新')
      return updated!
    },

    deletePlayer(data: { playerName: string, deletedBy: string, role: string }): void {
      const player = playerRepository.findByName(data.playerName)
      if (!player || player.status === 'deleted') {
        throw new Error('球員不存在或已刪除')
      }

      const team = teamRepository.findById(player.teamId)
      if (data.role !== '管理者' && team?.createdBy !== data.deletedBy) {
        throw new Error('無權限操作此球員')
      }

      playerRepository.update(player.id, { status: 'deleted' })
      eventBus?.emit('球員已刪除')
    },

    reorderPlayers(data: { teamName: string, order: { name: string, sortOrder: number }[], reorderedBy: string, role: string }): void {
      const team = teamRepository.findByName(data.teamName)
      if (!team || team.status === 'deleted') {
        throw new Error('球隊不存在或已刪除')
      }

      if (data.role !== '管理者' && team.createdBy !== data.reorderedBy) {
        throw new Error('無權限操作此球隊')
      }

      data.order.forEach((item) => {
        const player = playerRepository.findByName(item.name)
        if (player && player.teamId === team.id) {
          playerRepository.update(player.id, { sortOrder: item.sortOrder })
        }
      })

      eventBus?.emit('球員排序已更新')
    },
  }
}

export type PlayerService = ReturnType<typeof createPlayerService>
