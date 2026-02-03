import { getTrainingById } from '../../mock/data/trainings'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const trainingId = query.training_id ? Number(query.training_id) : undefined

  if (!trainingId) {
    return {
      status: 'success',
      data: {
        ai_status: 'stopped',
        training_id: null,
      },
    }
  }

  const training = getTrainingById(trainingId)

  if (!training) {
    throw createError({
      statusCode: 404,
      message: '訓練不存在或已刪除',
    })
  }

  return {
    status: 'success',
    data: {
      training_id: trainingId,
      ai_status: training.ai_status,
      pitch_count: training.pitch_count,
    },
  }
})
