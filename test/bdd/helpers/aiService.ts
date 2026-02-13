import type { EventBus } from './eventBus'
import type { PitchRepository } from './pitchRepository'
import type { TrainingRepository } from './trainingRepository'

export interface AiServiceDeps {
  trainingRepository: TrainingRepository
  pitchRepository?: PitchRepository
  eventBus: EventBus
}

export function createAiService({ trainingRepository, pitchRepository, eventBus }: AiServiceDeps) {
  let aiStatus = '關閉'
  let currentTrainingId: string | null = null
  let startedBy: string | null = null
  let processingPitch = false

  return {
    getStatus(): string {
      return aiStatus
    },

    setStatus(status: string): void {
      aiStatus = status
    },

    getCurrentTrainingId(): string | null {
      return currentTrainingId
    },

    getStartedBy(): string | null {
      return startedBy
    },

    // 設定 AI 關聯的訓練與啟動者
    setCurrentTraining(trainingId: string, by?: string): void {
      currentTrainingId = trainingId
      if (by)
        startedBy = by
    },

    setStartedBy(by: string): void {
      startedBy = by
    },

    setProcessingPitch(value: boolean): void {
      processingPitch = value
    },

    isProcessingPitch(): boolean {
      return processingPitch
    },

    startAi(data: { trainingId: string, startedBy: string }): void {
      // 不可重複啟動
      if (aiStatus === '運行中') {
        throw new Error('系統已在運行中')
      }

      // 必須先有訓練
      const training = trainingRepository.findById(data.trainingId)
      if (!training) {
        throw new Error('請先建立訓練')
      }

      // 權限檢查
      if (training.createdBy !== data.startedBy) {
        throw new Error('無權限操作此訓練')
      }

      aiStatus = '運行中'
      currentTrainingId = data.trainingId
      startedBy = data.startedBy
      trainingRepository.update(data.trainingId, { aiStatus: 'running' })
      eventBus.emit('AI系統已啟動')
    },

    startAiWithoutTraining(): void {
      // 不可重複啟動
      if (aiStatus === '運行中') {
        throw new Error('系統已在運行中')
      }

      throw new Error('請先建立訓練')
    },

    // 關閉 AI 系統
    stopAi(data: { stoppedBy: string }): void {
      // 冪等：已關閉直接成功，不產生事件
      if (aiStatus === '關閉') {
        return
      }

      // 權限檢查：只有啟動者能關閉
      if (startedBy && startedBy !== data.stoppedBy) {
        throw new Error('無權限操作此 AI 系統')
      }

      // 丟棄未完成的投球數據
      processingPitch = false

      aiStatus = '關閉'
      if (currentTrainingId) {
        trainingRepository.update(currentTrainingId, { aiStatus: 'stopped' })
      }
      currentTrainingId = null
      startedBy = null
      eventBus.emit('AI系統已關閉')
    },

    // AI 偵測到新投球
    detectNewPitch(trainingId?: string): void {
      const tId = trainingId || currentTrainingId
      if (!tId || !pitchRepository)
        return

      const pitches = pitchRepository.findByTrainingId(tId)
      const nextSeq = pitches.length + 1
      const newPitch = {
        id: `P${String(nextSeq).padStart(3, '0')}`,
        trainingId: tId,
        sequence: nextSeq,
        time: new Date().toISOString(),
        speed: 125 + Math.floor(Math.random() * 10),
        spinRate: 2100 + Math.floor(Math.random() * 300),
        isStrike: Math.random() > 0.5,
        locationX: Math.random() * 0.6 - 0.3,
        locationY: Math.random() * 0.8 + 0.2,
        strikeOrBall: Math.random() > 0.5 ? '好球' : '壞球',
        status: 'active',
      }
      newPitch.strikeOrBall = newPitch.isStrike ? '好球' : '壞球'
      pitchRepository.save(newPitch)

      // 更新訓練的投球數
      const training = trainingRepository.findById(tId)
      if (training) {
        trainingRepository.update(tId, { pitchCount: (training.pitchCount || 0) + 1 })
      }
    },
  }
}

export type AiService = ReturnType<typeof createAiService>
