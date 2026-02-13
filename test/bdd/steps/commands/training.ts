import type { DataTable } from 'quickpickle'
import type { TestWorld } from '../../helpers/world'
import { When } from 'quickpickle'
import { createPitchRepository } from '../../helpers/pitchRepository'
import { createTrainingRepository } from '../../helpers/trainingRepository'
import { createTrainingService } from '../../helpers/trainingService'

function ensureTrainingService(world: TestWorld) {
  if (!world.trainingRepository) {
    world.trainingRepository = createTrainingRepository()
  }
  if (!world.pitchRepository) {
    world.pitchRepository = createPitchRepository()
  }
  if (!world.trainingService && world.playerRepository && world.teamRepository) {
    world.trainingService = createTrainingService({
      trainingRepository: world.trainingRepository,
      playerRepository: world.playerRepository,
      teamRepository: world.teamRepository,
      pitchRepository: world.pitchRepository,
      eventBus: world.eventBus,
    })
  }
}

When('教練建立訓練：', async (world: TestWorld, dataTable: DataTable) => {
  ensureTrainingService(world)
  try {
    const row = dataTable.hashes()[0]
    const training = world.trainingService.createTraining({
      date: row['日期'] || row.date,
      playerName: row['受測選手'] || row.player_name,
      createdBy: world.currentUser!,
    })
    world.lastCreatedTraining = training
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練建立訓練並指定多名受測選手', async (world: TestWorld) => {
  ensureTrainingService(world)
  try {
    world.trainingService.createTraining({
      date: new Date().toISOString().split('T')[0],
      playerName: '王小明',
      playerNames: ['王小明', '李大華'],
      createdBy: world.currentUser!,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練建立訓練並選擇受測選手 {string}', async (world: TestWorld, playerName: string) => {
  ensureTrainingService(world)
  try {
    const training = world.trainingService.createTraining({
      date: new Date().toISOString().split('T')[0],
      playerName,
      createdBy: world.currentUser!,
    })
    world.lastCreatedTraining = training
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練建立訓練並選擇受測選手 {string}，並將好球帶身高調整為 {int} 公分', async (world: TestWorld, playerName: string, height: number) => {
  ensureTrainingService(world)
  try {
    const training = world.trainingService.createTraining({
      date: new Date().toISOString().split('T')[0],
      playerName,
      createdBy: world.currentUser!,
      strikeZoneHeight: height,
    })
    world.lastCreatedTraining = training
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練為球員 {string} 建立訓練', async (world: TestWorld, playerName: string) => {
  ensureTrainingService(world)
  try {
    const training = world.trainingService.createTraining({
      date: new Date().toISOString().split('T')[0],
      playerName,
      createdBy: world.currentUser!,
    })
    world.lastCreatedTraining = training
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練刪除訓練 {string}', async (world: TestWorld, trainingId: string) => {
  ensureTrainingService(world)
  try {
    world.trainingService.deleteTraining({
      trainingId,
      deletedBy: world.currentUser!,
      role: '教練',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('管理者刪除訓練 {string}', async (world: TestWorld, trainingId: string) => {
  ensureTrainingService(world)
  try {
    world.trainingService.deleteTraining({
      trainingId,
      deletedBy: world.currentUser!,
      role: '管理者',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

// Feature 19: 教練點擊投球查看詳情
When('教練點擊投球 {int} 查看詳情', async (world: TestWorld, pitchId: number) => {
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

// Feature 19: 顯示九宮格視圖
When('顯示九宮格視圖', async (world: TestWorld) => {
  world.currentView = '九宮格'
  world.operationResult = { success: true }
})

// Feature 19: 教練點擊 Tab
When('教練點擊 {string} Tab', async (world: TestWorld, tabName: string) => {
  if (tabName === '3D 軌跡') {
    world.currentView = '3D軌跡'
  }
  else if (tabName === '九宮格') {
    world.currentView = '九宮格'
  }
  world.operationResult = { success: true }
})

// Feature 19: 教練切換至 3D 軌跡視圖
When('教練切換至 3D 軌跡視圖', async (world: TestWorld) => {
  world.currentView = '3D軌跡'
  world.operationResult = { success: true }
})

// Feature 20: 教練將訓練的好球帶設定為（DataTable）
When('教練將訓練 {string} 的好球帶設定為：', async (world: TestWorld, trainingId: string, dataTable: DataTable) => {
  ensureTrainingService(world)
  try {
    const row = dataTable.hashes()[0]
    world.trainingService.setStrikeZone({
      trainingId,
      top: Number.parseInt(row['上緣'] || row.top),
      bottom: Number.parseInt(row['下緣'] || row.bottom),
      updatedBy: world.currentUser!,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

// Feature 20: 教練將訓練的好球帶上緣設定為 N 公分
When('教練將訓練 {string} 的好球帶上緣設定為 {int} 公分', async (world: TestWorld, trainingId: string, top: number) => {
  ensureTrainingService(world)
  try {
    world.trainingService.setStrikeZone({
      trainingId,
      top,
      updatedBy: world.currentUser!,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

// Feature 20: 教練將訓練的好球帶下緣設定為 N 公分
When('教練將訓練 {string} 的好球帶下緣設定為 {int} 公分', async (world: TestWorld, trainingId: string, bottom: number) => {
  ensureTrainingService(world)
  try {
    world.trainingService.setStrikeZone({
      trainingId,
      bottom,
      updatedBy: world.currentUser!,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

// Feature 20: 教練設定訓練的好球帶範圍（權限測試用）
When('教練設定訓練 {string} 的好球帶範圍', async (world: TestWorld, trainingId: string) => {
  ensureTrainingService(world)
  try {
    // 使用預設合法值測試權限
    world.trainingService.setStrikeZone({
      trainingId,
      top: 120,
      bottom: 50,
      updatedBy: world.currentUser!,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})
