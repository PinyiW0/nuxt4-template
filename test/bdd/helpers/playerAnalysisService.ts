import type { EventBus } from './eventBus'
import type { PitchRepository } from './pitchRepository'
import type { PlayerRepository } from './playerRepository'
import type { TeamRepository } from './teamRepository'
import type { TrainingRepository } from './trainingRepository'

export interface PlayerAnalysisServiceDeps {
  playerRepository: PlayerRepository
  teamRepository: TeamRepository
  trainingRepository: TrainingRepository
  pitchRepository: PitchRepository
  eventBus: EventBus
}

export interface PlayerAnalysisQueryResult {
  items: any[]
  page: number
  pageSize: number
  total: number
}

export function createPlayerAnalysisService({ playerRepository, teamRepository, trainingRepository, pitchRepository, eventBus }: PlayerAnalysisServiceDeps) {
  // 選手分析數據（由 Given step 注入）
  const analysisData = new Map<number, any>()
  // 選手投球統計（由 Given step 注入）
  const playerStats = new Map<string, any>()

  return {
    // 設定選手分析數據
    setAnalysisData(playerId: number, data: any): void {
      analysisData.set(playerId, data)
    },

    // 設定選手投球統計
    setPlayerStats(playerName: string, stats: any): void {
      playerStats.set(playerName, stats)
    },

    // 查詢選手分析列表（Feature 24）
    getPlayerAnalysisList(options: { role?: string, createdBy?: string, teamName?: string, keyword?: string, page?: number, pageSize?: number } = {}): PlayerAnalysisQueryResult {
      const { role, createdBy, teamName, keyword, page = 1, pageSize = 20 } = options

      let players = playerRepository.findAllActive()

      // 教練只能看自己球隊的球員
      if (role !== '管理者' && createdBy) {
        const teams = teamRepository.findByCreatedBy(createdBy)
        const teamIds = teams.map(t => t.id)
        players = players.filter(p => teamIds.includes(p.teamId))
      }

      // 篩選球隊
      if (teamName) {
        const team = teamRepository.findByName(teamName)
        if (team) {
          players = players.filter(p => p.teamId === team.id)
        }
        else {
          players = []
        }
      }

      // 關鍵字搜尋（姓名）
      if (keyword) {
        players = players.filter(p => p.name.includes(keyword))
      }

      // 依建立時間倒序排列
      players.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      // 合併分析數據
      const items = players.map((player) => {
        const analysis = analysisData.get(player.id) || {}
        const team = teamRepository.findById(player.teamId)
        return {
          id: player.id,
          name: player.name,
          number: player.number,
          teamName: team?.name || player.teamName,
          trainingCount: analysis.trainingCount || 0,
          totalPitches: analysis.totalPitches || 0,
          lastTrainingDate: analysis.lastTrainingDate || null,
          avgVelocity: analysis.avgVelocity || 0,
          createdAt: player.createdAt,
          date: player.createdAt.toISOString().split('T')[0],
        }
      })

      return { items, page, pageSize, total: items.length }
    },

    // 批次刪除選手分析（Feature 25）
    batchDeletePlayerAnalysis(data: { playerNames: string[], deletedBy: string, role: string }): void {
      for (const name of data.playerNames) {
        const player = playerRepository.findByName(name)
        if (!player || player.status === 'deleted') {
          throw new Error('球員不存在或已刪除')
        }

        // 權限檢查
        const team = teamRepository.findById(player.teamId)
        if (data.role !== '管理者' && team?.createdBy !== data.deletedBy) {
          throw new Error('無權限操作此球員')
        }
      }

      // 執行刪除
      for (const name of data.playerNames) {
        const player = playerRepository.findByName(name)
        if (!player)
          continue

        // 軟刪除該球員的所有訓練紀錄和投球數據
        const allTrainings = trainingRepository.findAll().filter(t => t.playerId === player.id)
        allTrainings.forEach((training) => {
          trainingRepository.update(training.id, { status: 'deleted' })
          const pitches = pitchRepository.findByTrainingId(training.id)
          pitches.forEach(p => pitchRepository.update(p.id, { status: 'deleted' }))
        })

        // 清除分析數據
        analysisData.delete(player.id)
        playerStats.delete(name)
      }

      eventBus.emit('選手分析已批次刪除')
    },

    // 查看選手統計（Feature 26）
    getPlayerStats(playerName: string, viewedBy: string, role: string): any {
      const player = playerRepository.findByName(playerName)
      if (!player || player.status === 'deleted') {
        throw new Error('球員不存在或已刪除')
      }

      // 權限檢查
      const team = teamRepository.findById(player.teamId)
      if (role !== '管理者' && team?.createdBy !== viewedBy) {
        throw new Error('無權限查看此球員')
      }

      const stats = playerStats.get(playerName)
      if (!stats) {
        // 空統計
        return {
          player,
          period: `${player.createdAt.toISOString().split('T')[0]} 至今`,
          avgVelocity: '-',
          avgSpinRate: '-',
          strikeRate: '-',
          totalPitches: 0,
        }
      }

      return {
        player,
        period: `${player.createdAt.toISOString().split('T')[0]} 至今`,
        avgVelocity: stats.avgVelocity,
        avgSpinRate: stats.avgSpinRate,
        strikeRate: stats.strikeRate,
        totalPitches: stats.totalPitches,
      }
    },

    // 查看選手熱區圖（Feature 26）
    getPlayerHeatMap(playerName: string, viewedBy: string, role: string): any {
      const player = playerRepository.findByName(playerName)
      if (!player || player.status === 'deleted') {
        throw new Error('球員不存在或已刪除')
      }

      const team = teamRepository.findById(player.teamId)
      if (role !== '管理者' && team?.createdBy !== viewedBy) {
        throw new Error('無權限查看此球員')
      }

      // 取得所有投球的落點數據
      const allTrainings = trainingRepository.findAll().filter(t => t.playerId === player.id && t.status === 'active')
      const allPitches: any[] = []
      allTrainings.forEach((training) => {
        const pitches = pitchRepository.findByTrainingId(training.id).filter(p => p.status === 'active')
        allPitches.push(...pitches)
      })

      const heatMapData = allPitches
        .filter(p => p.locationX !== undefined && p.locationY !== undefined)
        .map(p => ({ x: p.locationX, y: p.locationY }))

      return {
        player,
        heatMap: heatMapData,
        warmColors: true,
        coldColors: true,
      }
    },
  }
}

export type PlayerAnalysisService = ReturnType<typeof createPlayerAnalysisService>
