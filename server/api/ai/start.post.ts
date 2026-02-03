import { getTrainingById, updateTrainingAIStatus } from '../../mock/data/trainings'

// 模擬的 AI 系統狀態
const aiState = { currentRunningTrainingId: null as number | null }

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { training_id, user, role } = body

  if (!training_id) {
    throw createError({
      statusCode: 400,
      message: '請先建立訓練',
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
      message: '無權限操作此訓練',
    })
  }

  // 檢查是否已在運行
  if (training.ai_status === 'running') {
    throw createError({
      statusCode: 409,
      message: '系統已在運行中',
    })
  }

  // 啟動 AI 系統
  updateTrainingAIStatus(training_id, 'running')
  aiState.currentRunningTrainingId = training_id

  return {
    status: 'success',
    data: {
      training_id,
      ai_status: 'running',
      message: 'AI 系統已啟動',
    },
  }
})

export { aiState }
