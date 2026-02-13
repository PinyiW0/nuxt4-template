import type { TestWorld } from '../../helpers/world'
import { When } from 'quickpickle'

When('教練查詢訓練列表', async (world: TestWorld) => {
  try {
    world.queryResult = world.trainingService.getTrainings({
      createdBy: world.currentUser,
      role: '教練',
      today: world.today,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('管理者查詢訓練列表', async (world: TestWorld) => {
  try {
    world.queryResult = world.trainingService.getTrainings({
      role: '管理者',
      today: world.today,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練查詢訓練列表，日期範圍 {string} 至 {string}', async (world: TestWorld, dateFrom: string, dateTo: string) => {
  try {
    world.queryResult = world.trainingService.getTrainings({
      createdBy: world.currentUser,
      role: '教練',
      today: world.today,
      dateFrom,
      dateTo,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練查詢訓練列表（未指定分頁參數）', async (world: TestWorld) => {
  try {
    world.queryResult = world.trainingService.getTrainings({
      createdBy: world.currentUser,
      role: '教練',
      today: world.today,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

// Feature 21: 教練查詢歷史訓練列表
When('教練查詢歷史訓練列表', async (world: TestWorld) => {
  try {
    world.queryResult = world.trainingService.getHistoryTrainings({
      createdBy: world.currentUser,
      role: '教練',
      today: world.today,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('管理者查詢歷史訓練列表', async (world: TestWorld) => {
  try {
    world.queryResult = world.trainingService.getHistoryTrainings({
      role: '管理者',
      today: world.today,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練查詢歷史訓練列表，日期範圍 {string} 至 {string}', async (world: TestWorld, dateFrom: string, dateTo: string) => {
  try {
    world.queryResult = world.trainingService.getHistoryTrainings({
      createdBy: world.currentUser,
      role: '教練',
      today: world.today,
      dateFrom,
      dateTo,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('管理者查詢歷史訓練列表，篩選球隊 {string}', async (world: TestWorld, teamName: string) => {
  try {
    world.queryResult = world.trainingService.getHistoryTrainings({
      role: '管理者',
      today: world.today,
      teamName,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練查詢歷史訓練列表（未指定分頁參數）', async (world: TestWorld) => {
  try {
    world.queryResult = world.trainingService.getHistoryTrainings({
      createdBy: world.currentUser,
      role: '教練',
      today: world.today,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

// Feature 17: 教練查看訓練紀錄（int id）
When('教練查看訓練 {int} 的紀錄', async (world: TestWorld, trainingId: number) => {
  try {
    const tId = String(trainingId)
    world.currentTrainingDetail = world.trainingService.getTrainingDetail(tId, world.currentUser!)
    world.queryResult = world.currentTrainingDetail
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

// Feature 18: 教練查詢訓練的投球清單（string id）
When('教練查詢訓練 {string} 的投球清單', async (world: TestWorld, trainingId: string) => {
  try {
    const pitches = world.trainingService.getPitchList(trainingId, world.currentUser!)
    world.queryResult = pitches
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})
