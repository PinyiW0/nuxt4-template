import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const { team_id, player_ids } = body as { team_id: number, player_ids: number[] }

  player_ids.forEach((playerId, index) => {
    const player = mockPlayers.find(p => p.id === playerId && p.team_id === team_id)
    if (player) {
      player.sort_order = index + 1
    }
  })

  return { status: 'success' as const, message: '球員排序已更新' }
})
