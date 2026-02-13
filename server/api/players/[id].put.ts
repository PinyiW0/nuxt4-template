import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'

export default defineEventHandler(async (event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const player = mockPlayers.find(p => p.id === id && p.status === 'active')
  if (!player) {
    throw createError({ statusCode: 404, message: '球員不存在' })
  }

  if (body.name !== undefined) {
    if (body.name.length < 1 || body.name.length > 50) {
      throw createError({ statusCode: 400, message: '球員姓名長度必須在 1-50 字元之間' })
    }
    player.name = body.name
  }
  if (body.number !== undefined) {
    const exists = mockPlayers.find(p => p.team_id === player.team_id && p.number === body.number && p.id !== id && p.status === 'active')
    if (exists) {
      throw createError({ statusCode: 409, message: '該球隊已有此背號' })
    }
    player.number = body.number
  }
  if (body.height !== undefined)
    player.height = body.height
  if (body.position !== undefined)
    player.position = body.position

  return { status: 'success', data: player }
})
