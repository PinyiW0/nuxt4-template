import { deletePlayer, getPlayerById } from '../../mock/data/players'
import { teams } from '../../mock/data/teams'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const query = getQuery(event)
  const user = query.user as string | undefined
  const role = query.role as string | undefined

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

  deletePlayer(id)

  return {
    status: 'success',
    message: '球員已刪除',
  }
})
