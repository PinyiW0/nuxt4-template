import type { H3Event } from 'h3'

import { mockTeams } from '../../mock/data/teams'

export default defineEventHandler(async (event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { name } = body as { name: string }

  const team = mockTeams.find(t => t.id === id)
  if (!team || team.status === 'deleted') {
    throw createError({ statusCode: 404, message: '球隊不存在或已刪除' })
  }

  if (!name || name.trim().length === 0) {
    throw createError({ statusCode: 400, message: '球隊名稱不可為空' })
  }

  const duplicate = mockTeams.find(t => t.name === name && t.id !== id && t.status === 'active')
  if (duplicate) {
    throw createError({ statusCode: 409, message: '球隊名稱已存在' })
  }

  team.name = name

  return { status: 'success' as const, data: team }
})
