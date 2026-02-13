import { mockTrainings } from '../../mock/data/trainings'

export default defineEventHandler(() => {
  // 找到所有正在運行的訓練，關閉 AI
  mockTrainings.forEach((t) => {
    if (t.ai_status === 'running') {
      t.ai_status = 'stopped'
    }
  })

  return {
    status: 'success',
    data: {
      ai_status: 'stopped',
      training_id: null,
      created_by: null,
    },
  }
})
