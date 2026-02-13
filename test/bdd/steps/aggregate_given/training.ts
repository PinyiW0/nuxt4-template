import type { DataTable } from 'quickpickle'
import type { TestWorld } from '../../helpers/world'
import { Given } from 'quickpickle'
import { createPitchRepository } from '../../helpers/pitchRepository'
import { createPlayerRepository } from '../../helpers/playerRepository'
import { createPlayerService } from '../../helpers/playerService'
import { createTeamRepository } from '../../helpers/teamRepository'
import { createTrainingRepository } from '../../helpers/trainingRepository'
import { createTrainingService } from '../../helpers/trainingService'

function ensureTrainingRepository(world: TestWorld) {
  if (!world.trainingRepository) {
    world.trainingRepository = createTrainingRepository()
  }
}

function ensurePitchRepository(world: TestWorld) {
  if (!world.pitchRepository) {
    world.pitchRepository = createPitchRepository()
  }
}

function ensurePlayerRepository(world: TestWorld) {
  if (!world.playerRepository) {
    world.playerRepository = createPlayerRepository()
  }
  if (!world.playerService && world.teamRepository) {
    world.playerService = createPlayerService({
      playerRepository: world.playerRepository,
      teamRepository: world.teamRepository,
      eventBus: world.eventBus,
    })
  }
}

function ensureTeamRepository(world: TestWorld) {
  if (!world.teamRepository) {
    world.teamRepository = createTeamRepository()
  }
}

function ensureTrainingService(world: TestWorld) {
  if (world.trainingRepository) {
    ensureTeamRepository(world)
    ensurePlayerRepository(world)
    ensurePitchRepository(world)
    world.trainingService = createTrainingService({
      trainingRepository: world.trainingRepository,
      playerRepository: world.playerRepository,
      teamRepository: world.teamRepository,
      pitchRepository: world.pitchRepository,
      eventBus: world.eventBus,
    })
  }
}

Given('系統中有以下訓練：', async (world: TestWorld, dataTable: DataTable) => {
  ensureTrainingRepository(world)
  ensurePitchRepository(world)

  const rows = dataTable.hashes()
  rows.forEach((row) => {
    // 取得球員與球隊資訊
    const playerId = Number.parseInt(row.player_id || row['受測選手ID'] || '0')
    const teamId = Number.parseInt(row.team_id || row['球隊ID'] || '0')
    let playerName = row.player_name || row['受測選手'] || ''
    let teamName = row.team_name || row['球隊'] || ''

    // 從 repository 取得名稱
    if (world.playerRepository && playerId) {
      const player = world.playerRepository.findById(playerId)
      if (player) {
        playerName = playerName || player.name
        teamName = teamName || player.teamName
      }
    }
    if (world.teamRepository && teamId && !teamName) {
      const team = world.teamRepository.findById(teamId)
      if (team)
        teamName = team.name
    }

    world.trainingRepository.save({
      id: row.id || row['編號'] || String(playerId),
      date: row.date || row['日期'] || '',
      playerId,
      playerName,
      teamId,
      teamName,
      pitchCount: Number.parseInt(row.pitch_count || row['投球數'] || '0'),
      aiStatus: row.ai_status || row['AI狀態'] || 'stopped',
      strikeZoneTop: row.strike_zone_top ? Number.parseInt(row.strike_zone_top) : undefined,
      strikeZoneBottom: row.strike_zone_bottom ? Number.parseInt(row.strike_zone_bottom) : undefined,
      createdBy: row.created_by || row['建立者'] || '',
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
      status: row.status || row['狀態'] || 'active',
    })
  })

  ensureTrainingService(world)
})

Given('訓練 {string} 有以下投球紀錄：', async (world: TestWorld, trainingId: string, dataTable: DataTable) => {
  ensurePitchRepository(world)

  const rows = dataTable.hashes()
  rows.forEach((row) => {
    world.pitchRepository.save({
      id: row['編號'] || row.id || '',
      trainingId,
      speed: Number.parseFloat(row['球速'] || row.velocity || row.speed || '0'),
      spinRate: row['轉速'] || row.spin_rate ? Number.parseInt(row['轉速'] || row.spin_rate) : undefined,
      strikeOrBall: row['好壞球'] || row.strike_or_ball || (row.is_strike === 'true' ? '好球' : row.is_strike === 'false' ? '壞球' : ''),
      isStrike: row.is_strike !== undefined ? row.is_strike === 'true' : (row['好壞球'] === '好球' ? true : row['好壞球'] === '壞球' ? false : undefined),
      sequence: row.sequence ? Number.parseInt(row.sequence) : undefined,
      time: row.time || undefined,
      locationX: row.location_x !== undefined ? Number.parseFloat(row.location_x) : undefined,
      locationY: row.location_y !== undefined ? Number.parseFloat(row.location_y) : undefined,
      trajectoryData: row.trajectory_data || undefined,
      status: row['狀態'] || row.status || 'active',
    })
  })

  // 重建 trainingService 以注入 pitchRepository
  ensureTrainingService(world)
})

// Feature 17: 訓練 {int} 有以下投球紀錄（使用 int 型 id）
Given('訓練 {int} 有以下投球紀錄：', async (world: TestWorld, trainingId: number, dataTable: DataTable) => {
  ensurePitchRepository(world)

  const tId = String(trainingId)
  const rows = dataTable.hashes()
  rows.forEach((row) => {
    world.pitchRepository.save({
      id: row.id || row['編號'] || '',
      trainingId: tId,
      speed: Number.parseFloat(row.velocity || row['球速'] || row.speed || '0'),
      spinRate: row.spin_rate || row['轉速'] ? Number.parseInt(row.spin_rate || row['轉速']) : undefined,
      strikeOrBall: row.is_strike === 'true' ? '好球' : row.is_strike === 'false' ? '壞球' : (row['好壞球'] || ''),
      isStrike: row.is_strike !== undefined ? row.is_strike === 'true' : undefined,
      sequence: row.sequence ? Number.parseInt(row.sequence) : undefined,
      time: row.time || undefined,
      locationX: row.location_x !== undefined ? Number.parseFloat(row.location_x) : undefined,
      locationY: row.location_y !== undefined ? Number.parseFloat(row.location_y) : undefined,
      trajectoryData: row.trajectory_data || undefined,
      status: row['狀態'] || row.status || 'active',
    })
  })

  ensureTrainingService(world)
})

Given('今天日期為 {string}', async (world: TestWorld, today: string) => {
  world.today = today
})

Given('訓練 {string} 已被刪除', async (world: TestWorld, trainingId: string) => {
  const training = world.trainingRepository.findById(trainingId)
  if (training) {
    world.trainingRepository.update(trainingId, { status: 'deleted' })
  }
})

Given('系統中有訓練 {string} 由 {string} 建立', async (world: TestWorld, trainingId: string, createdBy: string) => {
  ensureTrainingRepository(world)

  world.trainingRepository.save({
    id: trainingId,
    date: new Date().toISOString().split('T')[0],
    playerId: 0,
    playerName: '測試球員',
    teamId: 0,
    teamName: '測試球隊',
    pitchCount: 0,
    aiStatus: 'stopped',
    createdBy,
    createdAt: new Date(),
    status: 'active',
  })

  ensureTrainingService(world)
})

// Feature 17: 教練正在查看訓練紀錄（int id）
Given('教練正在查看訓練 {int} 的紀錄', async (world: TestWorld, trainingId: number) => {
  ensureTrainingService(world)
  const tId = String(trainingId)
  try {
    world.currentTrainingDetail = world.trainingService.getTrainingDetail(tId, world.currentUser!)
    // 記錄當前投球數量，方便後續驗證即時更新
    world.pitchListBeforeCount = world.currentTrainingDetail.pitches.length
    world.statisticsBeforeUpdate = { ...world.currentTrainingDetail.statistics }
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

// Feature 18: 教練正在查看訓練的投球清單（string id）
Given('教練正在查看訓練 {string} 的投球清單', async (world: TestWorld, trainingId: string) => {
  ensureTrainingService(world)
  try {
    const pitches = world.trainingService.getPitchList(trainingId, world.currentUser!)
    world.queryResult = pitches
    world.pitchListBeforeCount = pitches.length
    world.sseConnected = true
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

// Feature 19: 教練正在查看投球的單球儀表板
Given('教練正在查看投球 {int} 的單球儀表板', async (world: TestWorld, pitchId: number) => {
  ensureTrainingService(world)
  try {
    world.currentPitchDetail = world.trainingService.getPitchDetail(String(pitchId))
    world.currentView = '九宮格'
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

// Feature 19: 教練正在查看投球的單球儀表板（九宮格視圖）
Given('教練正在查看投球 {int} 的單球儀表板（九宮格視圖）', async (world: TestWorld, pitchId: number) => {
  ensureTrainingService(world)
  try {
    world.currentPitchDetail = world.trainingService.getPitchDetail(String(pitchId))
    world.currentView = '九宮格'
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

// Feature 19: 教練正在查看投球的單球儀表板（3D 軌跡視圖）
Given('教練正在查看投球 {int} 的單球儀表板（3D 軌跡視圖）', async (world: TestWorld, pitchId: number) => {
  ensureTrainingService(world)
  try {
    world.currentPitchDetail = world.trainingService.getPitchDetail(String(pitchId))
    world.currentView = '3D軌跡'
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

// Feature 20: 訓練的好球帶設定
// Feature 22: 訓練有 N 筆投球紀錄
Given('訓練 {string} 有 {int} 筆投球紀錄', async (world: TestWorld, trainingId: string, count: number) => {
  ensurePitchRepository(world)

  for (let i = 0; i < count; i++) {
    world.pitchRepository.save({
      id: `${trainingId}-P${String(i + 1).padStart(3, '0')}`,
      trainingId,
      sequence: i + 1,
      speed: 120 + Math.floor(Math.random() * 15),
      spinRate: 2000 + Math.floor(Math.random() * 400),
      isStrike: Math.random() > 0.4,
      strikeOrBall: Math.random() > 0.4 ? '好球' : '壞球',
      locationX: Math.random() * 0.6 - 0.3,
      locationY: Math.random() * 0.8 + 0.2,
      status: 'active',
    })
  }

  // 更新訓練的投球數
  const training = world.trainingRepository.findById(trainingId)
  if (training) {
    world.trainingRepository.update(trainingId, { pitchCount: count })
  }

  ensureTrainingService(world)
})

Given('訓練 {string} 的好球帶設定：', async (world: TestWorld, trainingId: string, dataTable: DataTable) => {
  ensureTrainingRepository(world)
  const row = dataTable.hashes()[0]
  const top = Number.parseInt(row['上緣'] || row.top || '120')
  const bottom = Number.parseInt(row['下緣'] || row.bottom || '50')

  world.trainingRepository.update(trainingId, {
    strikeZoneTop: top,
    strikeZoneBottom: bottom,
  })
})
