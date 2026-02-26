import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'

export default defineEventHandler(async (event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const player = mockPlayers.find(p => p.id === id)
  if (!player || player.status === 'deleted') {
    throw createError({ statusCode: 404, message: '球員不存在或已刪除' })
  }

  const { number: playerNumber, name, height, position } = body as {
    number?: number
    name?: string
    height?: number
    position?: string
  }

  if (playerNumber !== undefined) {
    if (playerNumber < 0 || playerNumber > 999) {
      throw createError({ statusCode: 400, message: '背號必須為 0-999' })
    }
    const duplicate = mockPlayers.find(p => p.team_id === player.team_id && p.number === playerNumber && p.id !== id && p.status === 'active')
    if (duplicate) {
      throw createError({ statusCode: 409, message: '該背號已被使用' })
    }
    player.number = playerNumber
  }

  if (name !== undefined) {
    player.name = name
  }

  if (height !== undefined) {
    if (height < 100 || height > 250) {
      throw createError({ statusCode: 400, message: '身高必須為 100-250 公分' })
    }
    player.height = height
  }

  if (position !== undefined) {
    const validPositions = ['投手', '捕手', '一壘手', '二壘手', '三壘手', '游擊手', '左外野手', '中外野手', '右外野手', '指定打擊']
    if (!validPositions.includes(position)) {
      throw createError({ statusCode: 400, message: '守備位置無效' })
    }
    player.position = position
  }

  return { status: 'success' as const, data: player }
})
