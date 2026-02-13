import type { TestWorld } from '../../helpers/world'
import { When } from 'quickpickle'
import { createPlayerAnalysisService } from '../../helpers/playerAnalysisService'

function ensurePlayerAnalysisService(world: TestWorld) {
  if (!world.playerAnalysisService && world.playerRepository && world.teamRepository && world.trainingRepository && world.pitchRepository) {
    world.playerAnalysisService = createPlayerAnalysisService({
      playerRepository: world.playerRepository,
      teamRepository: world.teamRepository,
      trainingRepository: world.trainingRepository,
      pitchRepository: world.pitchRepository,
      eventBus: world.eventBus,
    })
  }
}

// Feature 24: 教練查詢選手分析列表
When('教練查詢選手分析列表', async (world: TestWorld) => {
  ensurePlayerAnalysisService(world)
  try {
    world.queryResult = world.playerAnalysisService.getPlayerAnalysisList({
      role: '教練',
      createdBy: world.currentUser,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('管理者查詢選手分析列表', async (world: TestWorld) => {
  ensurePlayerAnalysisService(world)
  try {
    world.queryResult = world.playerAnalysisService.getPlayerAnalysisList({
      role: '管理者',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('管理者查詢選手分析列表，篩選球隊 {string}', async (world: TestWorld, teamName: string) => {
  ensurePlayerAnalysisService(world)
  try {
    world.queryResult = world.playerAnalysisService.getPlayerAnalysisList({
      role: '管理者',
      teamName,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練查詢選手分析列表，關鍵字 {string}', async (world: TestWorld, keyword: string) => {
  ensurePlayerAnalysisService(world)
  try {
    world.queryResult = world.playerAnalysisService.getPlayerAnalysisList({
      role: '教練',
      createdBy: world.currentUser,
      keyword,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練查詢選手分析列表（未指定分頁參數）', async (world: TestWorld) => {
  ensurePlayerAnalysisService(world)
  try {
    world.queryResult = world.playerAnalysisService.getPlayerAnalysisList({
      role: '教練',
      createdBy: world.currentUser,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

// Feature 25: 批次刪除選手分析
When('教練批次刪除選手 {string}, {string} 的分析資料', async (world: TestWorld, name1: string, name2: string) => {
  ensurePlayerAnalysisService(world)
  try {
    world.playerAnalysisService.batchDeletePlayerAnalysis({
      playerNames: [name1, name2],
      deletedBy: world.currentUser!,
      role: '教練',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練選擇批次刪除選手 {string}, {string} 的分析資料', async (world: TestWorld, _name1: string, _name2: string) => {
  world.confirmDialog = `確定要刪除 2 位選手的分析資料？此操作無法復原`
})

When('教練批次刪除選手 {string} 的分析資料', async (world: TestWorld, name: string) => {
  ensurePlayerAnalysisService(world)
  try {
    world.playerAnalysisService.batchDeletePlayerAnalysis({
      playerNames: [name],
      deletedBy: world.currentUser!,
      role: '教練',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('管理者批次刪除選手 {string} 的分析資料', async (world: TestWorld, name: string) => {
  ensurePlayerAnalysisService(world)
  try {
    world.playerAnalysisService.batchDeletePlayerAnalysis({
      playerNames: [name],
      deletedBy: world.currentUser!,
      role: '管理者',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

// Feature 26: 查看選手統計
When('教練查看球員 {string} 的統計資料', async (world: TestWorld, playerName: string) => {
  ensurePlayerAnalysisService(world)
  try {
    world.currentPlayerStats = world.playerAnalysisService.getPlayerStats(playerName, world.currentUser!, world.currentUserRole || '教練')
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('管理者查看球員 {string} 的統計資料', async (world: TestWorld, playerName: string) => {
  ensurePlayerAnalysisService(world)
  try {
    world.currentPlayerStats = world.playerAnalysisService.getPlayerStats(playerName, world.currentUser!, '管理者')
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練查看球員 {string} 的熱區圖', async (world: TestWorld, playerName: string) => {
  ensurePlayerAnalysisService(world)
  try {
    world.heatMapData = world.playerAnalysisService.getPlayerHeatMap(playerName, world.currentUser!, world.currentUserRole || '教練')
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})
