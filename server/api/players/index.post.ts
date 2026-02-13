import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const { team_id, number: playerNumber, name, height, position } = body

  if (!name || name.length < 1 || name.length > 50) {
    throw createError({ statusCode: 400, message: '球員姓名長度必須在 1-50 字元之間' })
  }
  if (playerNumber < 0 || playerNumber > 999) {
    throw createError({ statusCode: 400, message: '背號必須在 0-999 之間' })
  }
  if (height < 100 || height > 250) {
    throw createError({ statusCode: 400, message: '身高必須在 100-250 公分之間' })
  }

  // 同隊背號唯一
  const exists = mockPlayers.find(p => p.team_id === team_id && p.number === playerNumber && p.status === 'active')
  if (exists) {
    throw createError({ statusCode: 409, message: '該球隊已有此背號' })
  }

  const maxSort = mockPlayers
    .filter(p => p.team_id === team_id && p.status === 'active')
    .reduce((max, p) => Math.max(max, p.sort_order), 0)

  const newPlayer = {
    id: mockPlayers.length + 1,
    team_id,
    number: playerNumber,
    name,
    height,
    position,
    sort_order: maxSort + 1,
    created_at: new Date().toISOString(),
    status: 'active' as const,
  }

  mockPlayers.push(newPlayer)

  return { status: 'success', data: newPlayer }
})
