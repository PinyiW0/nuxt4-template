import type { PlayerPosition } from '../../mock/data/types'
import { getPlayerById, isPlayerNumberExists, updatePlayer } from '../../mock/data/players'
import { teams } from '../../mock/data/teams'

const VALID_POSITIONS: PlayerPosition[] = [
  '投手',
  '捕手',
  '一壘手',
  '二壘手',
  '三壘手',
  '游擊手',
  '左外野手',
  '中外野手',
  '右外野手',
  '指定打擊',
]

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { number, name, height, position, user, role } = body

  const player = getPlayerById(id)

  if (!player) {
    throw createError({
      statusCode: 404,
      message: '球員不存在或已刪除',
    })
  }

  // 取得球員所屬球隊
  const team = teams.find(t => t.id === player.team_id)

  // 權限檢查
  if (role !== '管理者' && team?.created_by !== user) {
    throw createError({
      statusCode: 403,
      message: '無權限操作此球員',
    })
  }

  // 驗證背號
  if (number !== undefined) {
    if (number < 0 || number > 999) {
      throw createError({
        statusCode: 400,
        message: '背號必須為 0-999',
      })
    }

    if (isPlayerNumberExists(player.team_id, number, id)) {
      throw createError({
        statusCode: 409,
        message: '該背號已被使用',
      })
    }
  }

  // 驗證身高
  if (height !== undefined && (height < 100 || height > 250)) {
    throw createError({
      statusCode: 400,
      message: '身高必須為 100-250 公分',
    })
  }

  // 驗證守備位置
  if (position !== undefined && !VALID_POSITIONS.includes(position)) {
    throw createError({
      statusCode: 400,
      message: '守備位置無效',
    })
  }

  const updatedPlayer = updatePlayer(id, { number, name, height, position })

  return {
    status: 'success',
    data: updatedPlayer,
  }
})
