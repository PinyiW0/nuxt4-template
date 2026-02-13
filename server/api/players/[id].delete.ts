import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'

export default defineEventHandler((event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))

  const player = mockPlayers.find(p => p.id === id && p.status === 'active')
  if (!player) {
    throw createError({ statusCode: 404, message: '球員不存在' })
  }

  player.status = 'deleted'

  return { status: 'success', message: '球員已刪除' }
})
