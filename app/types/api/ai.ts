export interface AiControlBody {
  training_id: number
}

export interface AiStatusResponse {
  ai_status: 'running' | 'stopped'
  training_id: number | null
  created_by: string | null
}

export interface AiSystemStatus {
  status: 'running' | 'stopped'
  training_id: number | null
}

export interface StartAiBody {
  training_id: number
}
