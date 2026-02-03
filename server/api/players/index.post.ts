import type { PlayerPosition } from '../../mock/data/types'
import { createPlayer, isPlayerNumberExists } from '../../mock/data/players'
import { getTeamById } from '../../mock/data/teams'

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
  const body = await readBody(event)
  const { number, name, height, position, team_id, created_by, user, role } = body

  // 驗證球隊存在
  const team = getTeamById(team_id)
  if (!team) {
    throw createError({
      statusCode: 404,
      message: '球隊不存在或已刪除',
    })
  }

  // 權限檢查
  if (role !== '管理者' && team.created_by !== user) {
    throw createError({
      statusCode: 403,
      message: '無權限操作此球隊',
    })
  }

  // 驗證姓名
  if (!name || !name.trim()) {
    throw createError({
      statusCode: 400,
      message: '球員姓名不可為空',
    })
  }

  // 驗證背號
  if (number === undefined || number < 0 || number > 999) {
    throw createError({
      statusCode: 400,
      message: '背號必須為 0-999',
    })
  }

  if (isPlayerNumberExists(team_id, number)) {
    throw createError({
      statusCode: 409,
      message: '該背號已被使用',
    })
  }

  // 驗證身高
  if (!height || height < 100 || height > 250) {
    throw createError({
      statusCode: 400,
      message: '身高必須為 100-250 公分',
    })
  }

  // 驗證守備位置
  if (!position || !VALID_POSITIONS.includes(position)) {
    throw createError({
      statusCode: 400,
      message: '守備位置無效',
    })
  }

  const player = createPlayer({
    number,
    name: name.trim(),
    height,
    position,
    team_id,
    created_by: created_by || user || 'unknown',
  })

  return {
    status: 'success',
    data: player,
  }
})
