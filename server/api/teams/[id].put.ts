import type { H3Event } from 'h3'

import { mockTeams } from '../../mock/data/teams'

export default defineEventHandler(async (event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { name } = body

  const team = mockTeams.find(t => t.id === id && t.status === 'active')
  if (!team) {
    throw createError({ statusCode: 404, message: '球隊不存在' })
  }

  if (!name || name.length < 1 || name.length > 50) {
    throw createError({ statusCode: 400, message: '球隊名稱長度必須在 1-50 字元之間' })
  }

  // 檢查名稱唯一（排除自己）
  const exists = mockTeams.find(t => t.name === name && t.id !== id && t.status === 'active')
  if (exists) {
    throw createError({ statusCode: 409, message: '球隊名稱已存在' })
  }

  team.name = name

  return {
    status: 'success',
    data: team,
  }
})
