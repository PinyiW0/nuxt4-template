import type { QuickPickleWorld } from 'quickpickle'

export interface TestWorld extends QuickPickleWorld {
  // 服務實例
  userRepository: any
  eventBus: any
  authService: any
  timeProvider: () => Date

  // 球隊相關
  teamRepository?: any
  teamService?: any

  // 球員相關
  playerRepository?: any
  playerService?: any

  // 訓練相關
  trainingRepository?: any
  trainingService?: any
  pitchRepository?: any
  aiService?: any
  today?: string
  lastCreatedTraining?: any

  // 當前測試狀態
  currentUser?: string
  currentUserRole?: string
  loginResult?: {
    accessToken: string
    refreshToken: string
    accessTokenExpiresAt: Date
    refreshTokenExpiresAt: Date
  }
  operationResult?: {
    success: boolean
    message?: string
  }
  queryResult?: any
  error?: Error

  // 裝置 Token 管理
  deviceTokens?: Record<string, {
    accessToken: string
    refreshToken: string
  } | null>

  // 事件列表
  events: string[]

  // Feature 17-19：訓練紀錄與投球儀表板
  currentTrainingDetail?: any
  currentPitchDetail?: any
  currentView?: string // '九宮格' | '3D軌跡'
  pitchListBeforeCount?: number
  statisticsBeforeUpdate?: any
  sseConnected?: boolean
  sseReconnected?: boolean

  // Feature 21-26：歷史訓練、分析、選手統計
  currentAnalysis?: any
  playerAnalysisData?: Map<number, any>
  playerStatistics?: Map<string, any>
  currentPlayerStats?: any
  confirmDialog?: string
  heatMapData?: any
  playerAnalysisService?: any
}
