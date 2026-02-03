import { getTrainingById, updateTrainingStrikeZone } from '../../../mock/data/trainings'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { strike_zone_top, strike_zone_bottom, user, role } = body

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
      message: '無權限操作此訓練',
    })
  }

  // 驗證好球帶上緣
  if (strike_zone_top === undefined || strike_zone_top < 90 || strike_zone_top > 150) {
    throw createError({
      statusCode: 400,
      message: '好球帶上緣必須為 90-150 公分',
    })
  }

  // 驗證好球帶下緣
  if (strike_zone_bottom === undefined || strike_zone_bottom < 30 || strike_zone_bottom > 70) {
    throw createError({
      statusCode: 400,
      message: '好球帶下緣必須為 30-70 公分',
    })
  }

  // 上緣必須大於下緣
  if (strike_zone_top <= strike_zone_bottom) {
    throw createError({
      statusCode: 400,
      message: '上緣必須大於下緣',
    })
  }

  const updatedTraining = updateTrainingStrikeZone(id, strike_zone_top, strike_zone_bottom)

  return {
    status: 'success',
    data: updatedTraining,
  }
})
