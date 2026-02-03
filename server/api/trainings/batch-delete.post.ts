import { batchDeleteTrainings, getTrainingById } from '../../mock/data/trainings'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { ids, user, role } = body

  if (!Array.isArray(ids) || ids.length === 0) {
    throw createError({
      statusCode: 400,
      message: '訓練 ID 列表不可為空',
    })
  }

  // 權限檢查
  if (role !== '管理者') {
    for (const id of ids) {
      const training = getTrainingById(id)
      if (training && training.created_by !== user) {
        throw createError({
          statusCode: 403,
          message: '包含無權限操作的訓練',
        })
      }
    }
  }

  const deletedCount = batchDeleteTrainings(ids)

  return {
    status: 'success',
    data: {
      deleted_count: deletedCount,
    },
  }
})
