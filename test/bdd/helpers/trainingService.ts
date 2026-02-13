import type { EventBus } from './eventBus'
import type { PitchRepository } from './pitchRepository'
import type { PlayerRepository } from './playerRepository'
import type { TeamRepository } from './teamRepository'
import type { Training, TrainingRepository } from './trainingRepository'

export interface TrainingServiceDeps {
  trainingRepository: TrainingRepository
  playerRepository: PlayerRepository
  teamRepository: TeamRepository
  pitchRepository?: PitchRepository
  eventBus: EventBus
}

export interface TrainingQueryResult {
  items: Training[]
  page: number
  pageSize: number
  total: number
}

export function createTrainingService({ trainingRepository, playerRepository, teamRepository, pitchRepository, eventBus }: TrainingServiceDeps) {
  let nextId = 1

  return {
    getTrainings(options: { role?: string, createdBy?: string, today?: string, dateFrom?: string, dateTo?: string, page?: number, pageSize?: number } = {}): TrainingQueryResult {
      const { role, createdBy, today, dateFrom, dateTo, page = 1, pageSize = 20 } = options

      let trainings: Training[]

      // 依角色篩選
      if (role === '管理者') {
        trainings = trainingRepository.findAllActive()
      }
      else if (createdBy) {
        trainings = trainingRepository.findByCreatedBy(createdBy)
      }
      else {
        trainings = trainingRepository.findAllActive()
      }

      // 只回傳 today 及之後的訓練
      if (today) {
        trainings = trainings.filter(t => t.date >= today)
      }

      // 日期範圍篩選
      if (dateFrom) {
        trainings = trainings.filter(t => t.date >= dateFrom)
      }
      if (dateTo) {
        trainings = trainings.filter(t => t.date <= dateTo)
      }

      // 依訓練日期倒序排列
      trainings.sort((a, b) => b.date.localeCompare(a.date))

      return {
        items: trainings,
        page,
        pageSize,
        total: trainings.length,
      }
    },

    createTraining(data: { date: string, playerName: string, createdBy: string, strikeZoneHeight?: number, playerNames?: string[] }): Training {
      // 每次只能一名受測選手
      if (data.playerNames && data.playerNames.length > 1) {
        throw new Error('每次訓練只能指定一名受測選手')
      }

      const player = playerRepository.findByName(data.playerName)
      if (!player || player.status === 'deleted') {
        throw new Error('球員不存在或已刪除')
      }

      // 教練只能為自己球隊的球員建立
      const team = teamRepository.findById(player.teamId)
      if (!team || team.createdBy !== data.createdBy) {
        throw new Error('無權限操作此球員')
      }

      // 好球帶預設帶入球員身高
      const strikeZoneHeight = data.strikeZoneHeight ?? player.height

      const id = `T${String(nextId++).padStart(3, '0')}`
      const training = trainingRepository.save({
        id,
        date: data.date || new Date().toISOString().split('T')[0],
        playerId: player.id,
        playerName: player.name,
        teamId: player.teamId,
        teamName: team.name,
        pitchCount: 0,
        aiStatus: 'stopped',
        strikeZoneHeight,
        createdBy: data.createdBy,
        createdAt: new Date(),
        status: 'active',
      })

      eventBus.emit('訓練已建立')
      return training
    },

    deleteTraining(data: { trainingId: string, deletedBy: string, role: string }): void {
      const training = trainingRepository.findById(data.trainingId)
      if (!training || training.status === 'deleted') {
        throw new Error('訓練不存在或已刪除')
      }

      // 權限檢查
      if (data.role !== '管理者' && training.createdBy !== data.deletedBy) {
        throw new Error('無權限操作此訓練')
      }

      // 軟刪除訓練
      trainingRepository.update(data.trainingId, { status: 'deleted' })

      // 連帶軟刪除投球數據
      if (pitchRepository) {
        const pitches = pitchRepository.findByTrainingId(data.trainingId)
        pitches.forEach((pitch) => {
          pitchRepository.update(pitch.id, { status: 'deleted' })
        })
      }

      eventBus.emit('訓練已刪除')
    },

    // 查看訓練紀錄詳情（Feature 17）
    getTrainingDetail(trainingId: string, viewedBy: string): any {
      const training = trainingRepository.findById(trainingId)
      if (!training || training.status === 'deleted') {
        throw new Error('訓練不存在')
      }

      // 權限檢查
      if (training.createdBy !== viewedBy) {
        throw new Error('無權限查看此訓練')
      }

      // 取得投球清單
      const pitches = pitchRepository
        ? pitchRepository.findByTrainingId(trainingId).filter((p: any) => p.status === 'active')
        : []

      // 排序投球清單（按 sequence）
      pitches.sort((a: any, b: any) => (a.sequence || 0) - (b.sequence || 0))

      // 計算即時統計
      const totalPitches = pitches.length
      const strikeCount = pitches.filter((p: any) => p.isStrike === true).length
      const ballCount = totalPitches - strikeCount
      const strikeRate = totalPitches > 0 ? (strikeCount / totalPitches * 100) : 0
      const avgVelocity = totalPitches > 0
        ? pitches.reduce((sum: number, p: any) => sum + (p.speed || 0), 0) / totalPitches
        : 0

      // 取得球隊和球員名稱
      const team = teamRepository.findById(training.teamId)
      const player = playerRepository.findById(training.playerId)

      return {
        training: {
          ...training,
          teamName: team?.name || training.teamName,
          playerName: player?.name || training.playerName,
        },
        pitches,
        statistics: {
          totalPitches,
          strikeCount,
          ballCount,
          strikeRate: Number.parseFloat(strikeRate.toFixed(1)),
          avgVelocity: Number.parseFloat(avgVelocity.toFixed(2)),
        },
      }
    },

    // 查詢投球清單（Feature 18）
    getPitchList(trainingId: string, queriedBy: string): any {
      const training = trainingRepository.findById(trainingId)
      if (!training || training.status === 'deleted') {
        throw new Error('訓練不存在')
      }

      // 權限檢查
      if (training.createdBy !== queriedBy) {
        throw new Error('無權限查看此訓練')
      }

      const pitches = pitchRepository
        ? pitchRepository.findByTrainingId(trainingId).filter((p: any) => p.status === 'active')
        : []

      pitches.sort((a: any, b: any) => (a.sequence || 0) - (b.sequence || 0))
      return pitches
    },

    // 查看單球儀表板（Feature 19）
    getPitchDetail(pitchId: string | number): any {
      if (!pitchRepository)
        throw new Error('投球資料不可用')

      const id = typeof pitchId === 'number' ? String(pitchId) : pitchId
      const pitch = pitchRepository.findById(id)
      if (!pitch || pitch.status === 'deleted') {
        throw new Error('投球不存在')
      }

      // 取得訓練的好球帶資訊
      const training = trainingRepository.findById(pitch.trainingId)

      return {
        pitch,
        strikeZoneTop: training?.strikeZoneTop,
        strikeZoneBottom: training?.strikeZoneBottom,
      }
    },

    // 查詢歷史訓練列表（Feature 21）
    getHistoryTrainings(options: { role?: string, createdBy?: string, today?: string, dateFrom?: string, dateTo?: string, teamName?: string, page?: number, pageSize?: number } = {}): TrainingQueryResult {
      const { role, createdBy, today, dateFrom, dateTo, teamName, page = 1, pageSize = 20 } = options

      let trainings: Training[]
      if (role === '管理者') {
        trainings = trainingRepository.findAllActive()
      }
      else if (createdBy) {
        trainings = trainingRepository.findByCreatedBy(createdBy)
      }
      else {
        trainings = trainingRepository.findAllActive()
      }

      // 歷史：只回傳 today 及過去的訓練
      if (today) {
        trainings = trainings.filter(t => t.date <= today)
      }

      if (dateFrom)
        trainings = trainings.filter(t => t.date >= dateFrom)
      if (dateTo)
        trainings = trainings.filter(t => t.date <= dateTo)

      // 篩選球隊
      if (teamName) {
        trainings = trainings.filter(t => t.teamName === teamName)
      }

      // 依訓練日期倒序排列
      trainings.sort((a, b) => b.date.localeCompare(a.date))

      return { items: trainings, page, pageSize, total: trainings.length }
    },

    // 批次刪除訓練（Feature 22）
    batchDeleteTrainings(data: { trainingIds: string[], deletedBy: string, role: string }): void {
      // 先檢查權限
      for (const id of data.trainingIds) {
        const training = trainingRepository.findById(id)
        if (!training || training.status === 'deleted') {
          throw new Error('訓練不存在或已刪除')
        }
        if (data.role !== '管理者' && training.createdBy !== data.deletedBy) {
          throw new Error('包含無權限操作的訓練')
        }
      }

      // 批次軟刪除
      for (const id of data.trainingIds) {
        trainingRepository.update(id, { status: 'deleted' })
        if (pitchRepository) {
          const pitches = pitchRepository.findByTrainingId(id)
          pitches.forEach(p => pitchRepository!.update(p.id, { status: 'deleted' }))
        }
      }

      eventBus.emit('訓練已批次刪除')
    },

    // 查看訓練分析（Feature 23）
    getTrainingAnalysis(trainingId: string, viewedBy: string): any {
      const training = trainingRepository.findById(trainingId)
      if (!training || training.status === 'deleted') {
        throw new Error('訓練不存在')
      }

      if (training.createdBy !== viewedBy) {
        throw new Error('無權限查看此訓練')
      }

      const pitches = pitchRepository
        ? pitchRepository.findByTrainingId(trainingId).filter((p: any) => p.status === 'active')
        : []

      const totalPitches = pitches.length
      const strikeCount = pitches.filter((p: any) => p.isStrike === true).length
      const ballCount = totalPitches - strikeCount
      const strikeRate = totalPitches > 0 ? Math.round(strikeCount / totalPitches * 100) : 0

      const velocities = pitches.map((p: any) => p.speed).filter((v: number) => v > 0)
      const avgVelocity = velocities.length > 0 ? velocities.reduce((a: number, b: number) => a + b, 0) / velocities.length : 0
      const maxVelocity = velocities.length > 0 ? Math.max(...velocities) : 0
      const minVelocity = velocities.length > 0 ? Math.min(...velocities) : 0

      const spinRates = pitches.map((p: any) => p.spinRate).filter((s: any) => s !== undefined && s > 0)
      const avgSpinRate = spinRates.length > 0 ? Math.round(spinRates.reduce((a: number, b: number) => a + b, 0) / spinRates.length) : 0

      const heatMap = pitches
        .filter((p: any) => p.locationX !== undefined && p.locationY !== undefined)
        .map((p: any) => ({ x: p.locationX, y: p.locationY }))

      return {
        training,
        statistics: {
          totalPitches,
          strikeCount,
          ballCount,
          strikeRate,
          avgVelocity: Number(avgVelocity.toFixed(2)),
          maxVelocity: Number(maxVelocity.toFixed(1)),
          minVelocity: Number(minVelocity.toFixed(1)),
          avgSpinRate,
          heatMap,
        },
      }
    },

    // 設定好球帶範圍（Feature 20）
    setStrikeZone(data: { trainingId: string, top?: number, bottom?: number, updatedBy: string }): void {
      const training = trainingRepository.findById(data.trainingId)
      if (!training || training.status === 'deleted') {
        throw new Error('訓練不存在')
      }

      // 權限檢查
      if (training.createdBy !== data.updatedBy) {
        throw new Error('無權限操作此訓練')
      }

      const top = data.top ?? training.strikeZoneTop ?? 120
      const bottom = data.bottom ?? training.strikeZoneBottom ?? 50

      // 上緣必須大於下緣（優先檢查關聯性）
      if (top <= bottom) {
        throw new Error('上緣必須大於下緣')
      }

      // 上緣驗證 90-150
      if (top < 90 || top > 150) {
        throw new Error('好球帶上緣必須為 90-150 公分')
      }

      // 下緣驗證 30-70
      if (bottom < 30 || bottom > 70) {
        throw new Error('好球帶下緣必須為 30-70 公分')
      }

      trainingRepository.update(data.trainingId, {
        strikeZoneTop: top,
        strikeZoneBottom: bottom,
      })

      eventBus.emit('好球帶範圍已更新')
    },
  }
}

export type TrainingService = ReturnType<typeof createTrainingService>
