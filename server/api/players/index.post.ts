import type { H3Event } from 'h3'

import { mockPlayers } from '../../mock/data/players'
import { mockTeams } from '../../mock/data/teams'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)

  // 驗證
  if (!body.name || body.name.trim().length === 0) {
    throw createError({ statusCode: 400, message: '球員姓名不可為空' })
  }
  if (body.name.length > 50) {
    throw createError({ statusCode: 400, message: '球員姓名不可超過 50 字元' })
  }
  if (body.number < 0 || body.number > 999) {
    throw createError({ statusCode: 400, message: '背號必須為 0-999' })
  }
  if (body.height < 100 || body.height > 250) {
    throw createError({ statusCode: 400, message: '身高必須為 100-250 公分' })
  }

  const validPositions = ['投手', '捕手', '一壘手', '二壘手', '三壘手', '游擊手', '左外野手', '中外野手', '右外野手', '指定打擊']
  if (!validPositions.includes(body.position)) {
    throw createError({ statusCode: 400, message: '守備位置無效' })
  }

  // 同隊內背號唯一
  const duplicate = mockPlayers.find(p => p.team_id === body.team_id && p.number === body.number && p.status === 'active')
  if (duplicate) {
    throw createError({ statusCode: 409, message: '該背號已被使用' })
  }

  const maxId = Math.max(...mockPlayers.map(p => p.id))
  const maxSort = Math.max(0, ...mockPlayers.filter(p => p.team_id === body.team_id && p.status === 'active').map(p => p.sort_order))
  const team = mockTeams.find(t => t.id === body.team_id)

  const newPlayer = {
    id: maxId + 1,
    number: body.number,
    name: body.name,
    height: body.height,
    position: body.position,
    team_id: body.team_id,
    team_name: team?.name || '未知',
    sort_order: maxSort + 1,
    created_at: new Date().toISOString(),
    status: 'active' as const,
  }
  mockPlayers.push(newPlayer)

  return { status: 'success', data: newPlayer }
})
