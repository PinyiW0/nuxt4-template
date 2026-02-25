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
    if (!body.name || body.name.trim().length === 0) {
      throw createError({ statusCode: 400, message: '球員姓名不可為空' })
    }
    player.name = body.name
  }
  if (body.number !== undefined) {
    if (body.number < 0 || body.number > 999) {
      throw createError({ statusCode: 400, message: '背號必須為 0-999' })
    }
    const duplicate = mockPlayers.find(p => p.team_id === player.team_id && p.number === body.number && p.status === 'active' && p.id !== id)
    if (duplicate) {
      throw createError({ statusCode: 409, message: '該背號已被使用' })
    }
    player.number = body.number
  }
  if (body.height !== undefined) {
    if (body.height < 100 || body.height > 250) {
      throw createError({ statusCode: 400, message: '身高必須為 100-250 公分' })
    }
    player.height = body.height
  }
  if (body.position !== undefined) {
    player.position = body.position
  }

  return { status: 'success', data: player }
})
