import type { TestWorld } from '../../helpers/world'
import { Given } from 'quickpickle'
import { createAiService } from '../../helpers/aiService'
import { createPitchRepository } from '../../helpers/pitchRepository'
import { createTrainingRepository } from '../../helpers/trainingRepository'

function ensureAiService(world: TestWorld) {
  if (!world.trainingRepository) {
    world.trainingRepository = createTrainingRepository()
  }
  if (!world.pitchRepository) {
    world.pitchRepository = createPitchRepository()
  }
  if (!world.aiService) {
    world.aiService = createAiService({
      trainingRepository: world.trainingRepository,
      pitchRepository: world.pitchRepository,
      eventBus: world.eventBus,
    })
  }
}

// 此 step 同時用於 Given（設定狀態）和 Then（驗證狀態）
// quickpickle 共用 step registry，Given/Then 同名 step 會衝突，故只註冊一次
Given('AI 系統狀態為 {string}', async (world: TestWorld, status: string) => {
  ensureAiService(world)
  world.aiService.setStatus(status)
})

Given('教練已建立訓練 {string}', async (_world: TestWorld, _trainingId: string) => {
  // 標記教練已建立訓練，訓練資料已在 Background 中建立
})

Given('教練尚未建立任何訓練', async (world: TestWorld) => {
  // 清空訓練
  if (world.trainingRepository) {
    world.trainingRepository.clear()
  }
  // 重建 aiService 以反映清空後的狀態
  ensureAiService(world)
})

// Feature 16: AI 系統關聯訓練
Given('AI 系統關聯訓練 {string}', async (world: TestWorld, trainingId: string) => {
  ensureAiService(world)
  // 預設 startedBy 為訓練建立者
  const training = world.trainingRepository.findById(trainingId)
  const by = training?.createdBy || world.currentUser || ''
  world.aiService.setCurrentTraining(trainingId, by)
})

// Feature 16: AI 系統正在處理投球數據
Given('AI 系統正在處理一顆投球數據', async (world: TestWorld) => {
  ensureAiService(world)
  world.aiService.setProcessingPitch(true)
})

// Feature 16: AI 系統由指定教練啟動
Given('AI 系統由 {string} 啟動', async (world: TestWorld, coach: string) => {
  ensureAiService(world)
  world.aiService.setStartedBy(coach)
})

// Feature 18: AI 系統正在運行中
Given('AI 系統正在運行中', async (world: TestWorld) => {
  ensureAiService(world)
  world.aiService.setStatus('運行中')
})
