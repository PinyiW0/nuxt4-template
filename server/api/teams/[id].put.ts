import type { H3Event } from 'h3'

import { mockTeams } from '../../mock/data/teams'

export default defineEventHandler(async (event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const team = mockTeams.find(t => t.id === id && t.status === 'active')
  if (!team) {
    throw createError({ statusCode: 404, message: '球隊不存在' })
  }

  if (!body.name || body.name.trim().length === 0) {
    throw createError({ statusCode: 400, message: '球隊名稱不可為空' })
  }

  // 檢查名稱唯一性（排除自己）
  const exists = mockTeams.find(t => t.name === body.name && t.status === 'active' && t.id !== id)
  if (exists) {
    throw createError({ statusCode: 409, message: '球隊名稱已存在' })
  }

  team.name = body.name

  return { status: 'success', data: team }
})
