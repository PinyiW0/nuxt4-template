import type { TestWorld } from '../../helpers/world'
import { When } from 'quickpickle'
import { createAiService } from '../../helpers/aiService'
import { createPitchRepository } from '../../helpers/pitchRepository'

function ensureAiService(world: TestWorld) {
  if (!world.pitchRepository) {
    world.pitchRepository = createPitchRepository()
  }
  if (!world.aiService && world.trainingRepository) {
    world.aiService = createAiService({
      trainingRepository: world.trainingRepository,
      pitchRepository: world.pitchRepository,
      eventBus: world.eventBus,
    })
  }
}

When('教練啟動 AI 系統並關聯訓練 {string}', async (world: TestWorld, trainingId: string) => {
  ensureAiService(world)
  try {
    world.aiService.startAi({
      trainingId,
      startedBy: world.currentUser!,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練嘗試啟動 AI 系統', async (world: TestWorld) => {
  ensureAiService(world)
  try {
    world.aiService.startAiWithoutTraining()
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

// Feature 16: 教練關閉 AI 系統
When('教練關閉 AI 系統', async (world: TestWorld) => {
  ensureAiService(world)
  try {
    world.aiService.stopAi({
      stoppedBy: world.currentUser!,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

// Feature 17/18: AI 系統偵測到新投球
When('AI 系統偵測到新投球', async (world: TestWorld) => {
  ensureAiService(world)
  const trainingId = world.aiService.getCurrentTrainingId()
    || (world.currentTrainingDetail?.training?.id)
  world.aiService.detectNewPitch(trainingId)

  // 若有 currentTrainingDetail，重新查詢以模擬即時更新
  if (world.currentTrainingDetail && world.trainingService) {
    const tId = world.currentTrainingDetail.training.id
    world.currentTrainingDetail = world.trainingService.getTrainingDetail(tId, world.currentUser!)
  }
})

// Feature 18: AI 系統偵測到一顆新投球
When('AI 系統偵測到一顆新投球', async (world: TestWorld) => {
  ensureAiService(world)
  const trainingId = world.aiService.getCurrentTrainingId()
    || (world.queryResult?.[0]?.trainingId)
  world.aiService.detectNewPitch(trainingId)
})

// Feature 18: SSE 連線中斷
When('SSE 連線中斷', async (world: TestWorld) => {
  world.sseConnected = false
  // 模擬自動重連
  world.sseReconnected = true
  world.sseConnected = true
})
