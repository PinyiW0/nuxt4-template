import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)

  if (!body.items || !Array.isArray(body.items)) {
    throw createError({ statusCode: 400, message: '缺少排序資料' })
  }

  for (const item of body.items) {
    const player = mockPlayers.find(p => p.id === item.id && p.status === 'active')
    if (player) {
      player.sort_order = item.sort_order
    }
  }

  return { status: 'success', message: '排序已更新' }
})
