import type { H3Event } from 'h3'

import { getNextTeamId, mockTeams } from '../../mock/data/teams'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const { name } = body as { name: string }

  if (!name || name.trim().length === 0) {
    throw createError({ statusCode: 400, message: '球隊名稱不可為空' })
  }

  if (name.length > 50) {
    throw createError({ statusCode: 400, message: '球隊名稱長度不可超過 50 字元' })
  }

  const exists = mockTeams.find(t => t.name === name && t.status === 'active')
  if (exists) {
    throw createError({ statusCode: 409, message: '球隊名稱已存在' })
  }

  const newTeam = {
    id: getNextTeamId(),
    name,
    created_by: 'coach1',
    player_count: 0,
    created_at: new Date().toISOString(),
    status: 'active' as const,
  }
  mockTeams.push(newTeam)

  return { status: 'success' as const, data: newTeam }
})
