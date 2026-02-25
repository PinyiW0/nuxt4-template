import type { H3Event } from 'h3'

import { mockTeams } from '../../mock/data/teams'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)

  if (!body.name || body.name.trim().length === 0) {
    throw createError({ statusCode: 400, message: '球隊名稱不可為空' })
  }

  if (body.name.length > 50) {
    throw createError({ statusCode: 400, message: '球隊名稱不可超過 50 字元' })
  }

  // 檢查名稱唯一性
  const exists = mockTeams.find(t => t.name === body.name && t.status === 'active')
  if (exists) {
    throw createError({ statusCode: 409, message: '球隊名稱已存在' })
  }

  const maxId = Math.max(...mockTeams.map(t => t.id))
  const newTeam = {
    id: maxId + 1,
    name: body.name,
    created_by: body.created_by || 'coach1',
    created_at: new Date().toISOString(),
    status: 'active' as const,
  }
  mockTeams.push(newTeam)

  return {
    status: 'success',
    data: { ...newTeam, player_count: 0 },
  }
})
