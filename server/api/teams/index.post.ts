import type { H3Event } from 'h3'

import { mockTeams } from '../../mock/data/teams'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const { name } = body

  if (!name || name.length < 1 || name.length > 50) {
    throw createError({ statusCode: 400, message: '球隊名稱長度必須在 1-50 字元之間' })
  }

  // 檢查名稱唯一
  const exists = mockTeams.find(t => t.name === name && t.status === 'active')
  if (exists) {
    throw createError({ statusCode: 409, message: '球隊名稱已存在' })
  }

  const newTeam = {
    id: mockTeams.length + 1,
    name,
    created_by: 'coach1',
    created_at: new Date().toISOString(),
    status: 'active' as const,
  }

  mockTeams.push(newTeam)

  return {
    status: 'success',
    data: {
      ...newTeam,
      player_count: 0,
    },
  }
})
