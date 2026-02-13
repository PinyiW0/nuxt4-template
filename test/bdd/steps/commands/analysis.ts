import type { TestWorld } from '../../helpers/world'
import { When } from 'quickpickle'

// Feature 22: 批次刪除訓練
When('教練批次刪除訓練 {string}, {string}', async (world: TestWorld, id1: string, id2: string) => {
  try {
    world.trainingService.batchDeleteTrainings({
      trainingIds: [id1, id2],
      deletedBy: world.currentUser!,
      role: '教練',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練選擇批次刪除訓練 {string}, {string}', async (world: TestWorld, _id1: string, _id2: string) => {
  // 顯示確認對話框（不實際刪除）
  world.confirmDialog = `確定要刪除 2 筆訓練紀錄？`
})

When('管理者批次刪除訓練 {string}, {string}', async (world: TestWorld, id1: string, id2: string) => {
  try {
    world.trainingService.batchDeleteTrainings({
      trainingIds: [id1, id2],
      deletedBy: world.currentUser!,
      role: '管理者',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

// Feature 23: 教練查看訓練分析
When('教練查看訓練 {int} 的分析', async (world: TestWorld, trainingId: number) => {
  try {
    world.currentAnalysis = world.trainingService.getTrainingAnalysis(String(trainingId), world.currentUser!)
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})
