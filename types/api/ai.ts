// AI 系統相關型別

export interface AiSystemStatus {
  status: 'running' | 'stopped'
  training_id: number | null
}

export interface StartAiBody {
  training_id: number
}
