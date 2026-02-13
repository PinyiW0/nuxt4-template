import { mockTrainings } from '../../mock/data/trainings'

export default defineEventHandler(() => {
  const running = mockTrainings.find(t => t.ai_status === 'running')

  return {
    status: 'success',
    data: {
      ai_status: running ? 'running' : 'stopped',
      training_id: running?.id ?? null,
      created_by: running?.created_by ?? null,
    },
  }
})
