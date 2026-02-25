import type { H3Event } from 'h3'

import { mockTrainings } from '../../mock/data/trainings'
import { aiState } from './start.post'

export default defineEventHandler((_event: H3Event) => {
  if (aiState.training_id) {
    const training = mockTrainings.find(t => t.id === aiState.training_id)
    if (training) {
      training.ai_status = 'stopped'
    }
  }

  aiState.status = 'stopped'
  aiState.training_id = null

  return { status: 'success', message: 'AI 系統已關閉' }
})
