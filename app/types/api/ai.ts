export interface AiControlBody {
  training_id: number
}

export interface AiStatusResponse {
  ai_status: 'running' | 'stopped'
  training_id: number | null
  created_by: string | null
}
