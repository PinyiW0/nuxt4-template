import { getTeamById, isTeamNameExists, updateTeam } from '../../mock/data/teams'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { name, user, role } = body

  const team = getTeamById(id)

  if (!team) {
    throw createError({
      statusCode: 404,
      message: '球隊不存在或已刪除',
    })
  }

  // 權限檢查：管理者可編輯所有，教練只能編輯自己的
  if (role !== '管理者' && team.created_by !== user) {
    throw createError({
      statusCode: 403,
      message: '無權限操作此球隊',
    })
  }

  if (!name || !name.trim()) {
    throw createError({
      statusCode: 400,
      message: '球隊名稱不可為空',
    })
  }

  if (isTeamNameExists(name, id)) {
    throw createError({
      statusCode: 409,
      message: '球隊名稱已存在',
    })
  }

  const updatedTeam = updateTeam(id, { name: name.trim() })

  return {
    status: 'success',
    data: updatedTeam,
  }
})
