import { deleteTeam, getTeamById } from '../../mock/data/teams'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const query = getQuery(event)
  const user = query.user as string | undefined
  const role = query.role as string | undefined

  const team = getTeamById(id)

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

  deleteTeam(id)

  return {
    status: 'success',
    message: '球隊已刪除',
  }
})
