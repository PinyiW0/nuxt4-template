import { getTrainingById, updateTrainingAIStatus } from '../../mock/data/trainings'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { training_id, user, role } = body

  if (!training_id) {
    throw createError({
      statusCode: 400,
      message: '訓練 ID 為必填',
    })
  }

  const training = getTrainingById(training_id)

  if (!training) {
    throw createError({
      statusCode: 404,
      message: '訓練不存在或已刪除',
    })
  }

  // 權限檢查
  if (role !== '管理者' && training.created_by !== user) {
    throw createError({
      statusCode: 403,
      message: '無權限操作此 AI 系統',
    })
  }

  // 關閉 AI 系統
  updateTrainingAIStatus(training_id, 'stopped')

  return {
    status: 'success',
    data: {
      training_id,
      ai_status: 'stopped',
      message: 'AI 系統已關閉',
    },
  }
})
