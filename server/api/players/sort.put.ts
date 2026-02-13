import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const { team_id, player_ids } = body

  if (!team_id || !player_ids || !Array.isArray(player_ids)) {
    throw createError({ statusCode: 400, message: '參數錯誤' })
  }

  player_ids.forEach((playerId: number, index: number) => {
    const player = mockPlayers.find(p => p.id === playerId && p.team_id === team_id)
    if (player) {
      player.sort_order = index + 1
    }
  })

  return { status: 'success', message: '排序已更新' }
})
