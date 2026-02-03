import { createTeam, isTeamNameExists } from '../../mock/data/teams'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, created_by } = body

  if (!name || !name.trim()) {
    throw createError({
      statusCode: 400,
      message: '球隊名稱不可為空',
    })
  }

  if (isTeamNameExists(name)) {
    throw createError({
      statusCode: 409,
      message: '球隊名稱已存在',
    })
  }

  const team = createTeam({
    name: name.trim(),
    created_by: created_by || 'unknown',
  })

  return {
    status: 'success',
    data: team,
  }
})
