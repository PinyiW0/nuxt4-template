import { getPlayerById, updatePlayersSortOrder } from '../../mock/data/players'
import { teams } from '../../mock/data/teams'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { player_ids, user, role } = body

  if (!Array.isArray(player_ids) || player_ids.length === 0) {
    throw createError({
      statusCode: 400,
      message: '球員 ID 列表不可為空',
    })
  }

  // 驗證所有球員存在且屬於同一球隊
  let teamId: number | null = null
  for (const playerId of player_ids) {
    const player = getPlayerById(playerId)
    if (!player) {
      throw createError({
        statusCode: 404,
        message: '球員不存在或已刪除',
      })
    }

    if (teamId === null) {
      teamId = player.team_id
    }
    else if (player.team_id !== teamId) {
      throw createError({
        statusCode: 400,
        message: '所有球員必須屬於同一球隊',
      })
    }
  }

  // 權限檢查
  const team = teams.find(t => t.id === teamId)
  if (role !== '管理者' && team?.created_by !== user) {
    throw createError({
      statusCode: 403,
      message: '無權限操作此球隊',
    })
  }

  updatePlayersSortOrder(player_ids)

  return {
    status: 'success',
    message: '排序已更新',
  }
})
