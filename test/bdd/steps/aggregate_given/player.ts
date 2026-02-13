import type { DataTable } from 'quickpickle'
import type { TestWorld } from '../../helpers/world'
import { Given } from 'quickpickle'
import { createPlayerRepository } from '../../helpers/playerRepository'
import { createPlayerService } from '../../helpers/playerService'
import { createTeamService } from '../../helpers/teamService'

function ensurePlayerRepository(world: TestWorld) {
  if (!world.playerRepository) {
    world.playerRepository = createPlayerRepository()
    // 重新建立 teamService 以注入 playerRepository
    if (world.teamRepository && world.eventBus) {
      world.teamService = createTeamService({
        teamRepository: world.teamRepository,
        eventBus: world.eventBus,
        playerRepository: world.playerRepository,
      })
    }
  }
}

function ensurePlayerService(world: TestWorld) {
  if (!world.playerService && world.playerRepository && world.teamRepository) {
    world.playerService = createPlayerService({
      playerRepository: world.playerRepository,
      teamRepository: world.teamRepository,
      eventBus: world.eventBus,
    })
  }
}

Given('球隊 {string} 中有以下球員：', async (world: TestWorld, teamName: string, dataTable: DataTable) => {
  ensurePlayerRepository(world)

  const team = world.teamRepository.findByName(teamName)
  const teamId = team?.id ?? 0

  const players = dataTable.hashes()
  players.forEach((row) => {
    world.playerRepository.save({
      number: Number.parseInt(row['背號'] || row.number || '0'),
      name: row['姓名'] || row.name,
      height: Number.parseInt(row['身高'] || row.height || '0'),
      position: row['守備位置'] || row.position || '',
      teamId,
      teamName,
      sortOrder: Number.parseInt(row['排序順位'] || row.sort_order || '0'),
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
      status: row['狀態'] || row.status || 'active',
    })
  })

  ensurePlayerService(world)
})

Given('系統中有以下球員：', async (world: TestWorld, dataTable: DataTable) => {
  ensurePlayerRepository(world)

  const players = dataTable.hashes()
  players.forEach((row) => {
    const teamId = Number.parseInt(row.team_id || '0')
    const team = world.teamRepository.findById(teamId)

    world.playerRepository.save({
      id: row.id ? Number.parseInt(row.id) : undefined,
      number: Number.parseInt(row.number || '0'),
      name: row.name || '',
      height: Number.parseInt(row.height || '0'),
      position: row.position || '',
      teamId,
      teamName: team?.name || '',
      sortOrder: Number.parseInt(row.sort_order || '0'),
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
      status: row.status || 'active',
    })
  })

  ensurePlayerService(world)
})

Given('球隊 {string} 中有球員 {string}', async (world: TestWorld, teamName: string, playerName: string) => {
  ensurePlayerRepository(world)

  const team = world.teamRepository.findByName(teamName)
  const teamId = team?.id ?? 0

  world.playerRepository.save({
    number: 99,
    name: playerName,
    height: 175,
    position: '投手',
    teamId,
    teamName,
    sortOrder: 0,
    createdAt: new Date(),
    status: 'active',
  })

  ensurePlayerService(world)
})

Given('球員 {string} 已被刪除', async (world: TestWorld, playerName: string) => {
  const player = world.playerRepository.findByName(playerName)
  if (player) {
    world.playerRepository.update(player.id, { status: 'deleted' })
  }
})

Given('球員 {string} 有 {int} 筆訓練紀錄', async (_world: TestWorld, _playerName: string, _count: number) => {
  // 訓練紀錄在刪除球員時應保留不變，此處為前置條件標記
})

// Feature 24: 系統中有以下選手分析數據
Given('系統中有以下選手分析數據：', async (world: TestWorld, dataTable: DataTable) => {
  const { createPlayerAnalysisService } = await import('../../helpers/playerAnalysisService')
  const { createTrainingRepository } = await import('../../helpers/trainingRepository')
  const { createPitchRepository } = await import('../../helpers/pitchRepository')

  if (!world.trainingRepository) {
    world.trainingRepository = createTrainingRepository()
  }
  if (!world.pitchRepository) {
    world.pitchRepository = createPitchRepository()
  }

  if (!world.playerAnalysisService) {
    world.playerAnalysisService = createPlayerAnalysisService({
      playerRepository: world.playerRepository,
      teamRepository: world.teamRepository,
      trainingRepository: world.trainingRepository,
      pitchRepository: world.pitchRepository,
      eventBus: world.eventBus,
    })
  }

  const rows = dataTable.hashes()
  rows.forEach((row) => {
    const playerId = Number.parseInt(row.player_id)
    world.playerAnalysisService.setAnalysisData(playerId, {
      trainingCount: Number.parseInt(row.training_count || '0'),
      totalPitches: Number.parseInt(row.total_pitches || '0'),
      lastTrainingDate: row.last_training_date || null,
      avgVelocity: Number.parseFloat(row.avg_velocity || '0'),
    })
  })
})

// Feature 25: 球員有 N 筆訓練紀錄和 M 筆投球數據
Given('球員 {string} 有 {int} 筆訓練紀錄和 {int} 筆投球數據', async (world: TestWorld, playerName: string, trainingCount: number, pitchCount: number) => {
  const { createTrainingRepository } = await import('../../helpers/trainingRepository')
  const { createPitchRepository } = await import('../../helpers/pitchRepository')

  if (!world.trainingRepository) {
    world.trainingRepository = createTrainingRepository()
  }
  if (!world.pitchRepository) {
    world.pitchRepository = createPitchRepository()
  }

  const player = world.playerRepository.findByName(playerName)
  if (!player)
    return

  const team = world.teamRepository.findById(player.teamId)
  const pitchesPerTraining = Math.ceil(pitchCount / trainingCount)

  for (let t = 0; t < trainingCount; t++) {
    const trainingId = `${playerName}-T${String(t + 1).padStart(3, '0')}`
    world.trainingRepository.save({
      id: trainingId,
      date: `2026-01-${String(t + 1).padStart(2, '0')}`,
      playerId: player.id,
      playerName: player.name,
      teamId: player.teamId,
      teamName: team?.name || player.teamName,
      pitchCount: Math.min(pitchesPerTraining, pitchCount - t * pitchesPerTraining),
      aiStatus: 'stopped',
      createdBy: team?.createdBy || '',
      createdAt: new Date(`2026-01-${String(t + 1).padStart(2, '0')}`),
      status: 'active',
    })

    // 建立投球數據
    const pitchesForThisTraining = Math.min(pitchesPerTraining, pitchCount - t * pitchesPerTraining)
    for (let p = 0; p < pitchesForThisTraining; p++) {
      world.pitchRepository.save({
        id: `${trainingId}-P${String(p + 1).padStart(3, '0')}`,
        trainingId,
        sequence: p + 1,
        speed: 120 + Math.floor(Math.random() * 15),
        spinRate: 2000 + Math.floor(Math.random() * 400),
        isStrike: Math.random() > 0.4,
        strikeOrBall: Math.random() > 0.4 ? '好球' : '壞球',
        locationX: Math.random() * 0.6 - 0.3,
        locationY: Math.random() * 0.8 + 0.2,
        status: 'active',
      })
    }
  }
})

// Feature 26: 球員有以下投球統計
Given('球員 {string} 有以下投球統計：', async (world: TestWorld, playerName: string, dataTable: DataTable) => {
  const { createPlayerAnalysisService } = await import('../../helpers/playerAnalysisService')
  const { createTrainingRepository } = await import('../../helpers/trainingRepository')
  const { createPitchRepository } = await import('../../helpers/pitchRepository')

  if (!world.trainingRepository) {
    world.trainingRepository = createTrainingRepository()
  }
  if (!world.pitchRepository) {
    world.pitchRepository = createPitchRepository()
  }

  if (!world.playerAnalysisService) {
    world.playerAnalysisService = createPlayerAnalysisService({
      playerRepository: world.playerRepository,
      teamRepository: world.teamRepository,
      trainingRepository: world.trainingRepository,
      pitchRepository: world.pitchRepository,
      eventBus: world.eventBus,
    })
  }

  const row = dataTable.hashes()[0]
  world.playerAnalysisService.setPlayerStats(playerName, {
    avgVelocity: Number.parseFloat(row['平均球速'] || '0'),
    avgSpinRate: Number.parseInt(row['平均轉速'] || '0'),
    strikeRate: row['好球率'] || '0%',
    totalPitches: Number.parseInt(row['投球總數'] || '0'),
  })
})

// Feature 26: 球員剛建立，尚無投球紀錄
Given('球員 {string} 剛建立，尚無投球紀錄', async (world: TestWorld, playerName: string) => {
  ensurePlayerRepository(world)

  // 如果球員不存在，建立一個
  const player = world.playerRepository.findByName(playerName)
  if (!player) {
    // 找到教練的球隊
    const teams = world.teamRepository.findAll()
    const team = teams[0]
    world.playerRepository.save({
      number: 99,
      name: playerName,
      height: 175,
      position: '投手',
      teamId: team?.id || 1,
      teamName: team?.name || '',
      sortOrder: 0,
      createdAt: new Date(),
      status: 'active',
    })
  }
})

Given('球隊 {string} 中有以下球員（依排序）：', async (world: TestWorld, teamName: string, dataTable: DataTable) => {
  ensurePlayerRepository(world)

  const team = world.teamRepository.findByName(teamName)
  const teamId = team?.id ?? 0

  const players = dataTable.hashes()
  players.forEach((row) => {
    world.playerRepository.save({
      number: Number.parseInt(row['背號'] || row.number || '0'),
      name: row['姓名'] || row.name,
      height: 175,
      position: '投手',
      teamId,
      teamName,
      sortOrder: Number.parseInt(row['排序'] || row.sort_order || '0'),
      createdAt: new Date(),
      status: 'active',
    })
  })

  ensurePlayerService(world)
})
