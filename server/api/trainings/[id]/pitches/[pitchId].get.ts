import { getPitchById } from '../../../../mock/data/pitches'
import { getTrainingById } from '../../../../mock/data/trainings'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const pitchId = Number(getRouterParam(event, 'pitchId'))
  const query = getQuery(event)
  const user = query.user as string | undefined
  const role = query.role as string | undefined

  const training = getTrainingById(id)

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
      message: '無權限查看此訓練',
    })
  }

  const pitch = getPitchById(pitchId)

  if (!pitch || pitch.training_id !== id) {
    throw createError({
      statusCode: 404,
      message: '投球紀錄不存在',
    })
  }

  return {
    status: 'success',
    data: pitch,
  }
})
