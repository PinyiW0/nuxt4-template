import type { H3Event } from 'h3'

import { getNextPlayerId, mockPlayers } from '../../mock/data/players'
import { mockTeams } from '../../mock/data/teams'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const { team_id, number: playerNumber, name, height, position } = body as {
    team_id: number
    number: number
    name: string
    height: number
    position: string
  }

  if (!name || name.trim().length === 0) {
    throw createError({ statusCode: 400, message: '球員姓名不可為空' })
  }

  if (playerNumber < 0 || playerNumber > 999) {
    throw createError({ statusCode: 400, message: '背號必須為 0-999' })
  }

  if (height < 100 || height > 250) {
    throw createError({ statusCode: 400, message: '身高必須為 100-250 公分' })
  }

  const validPositions = ['投手', '捕手', '一壘手', '二壘手', '三壘手', '游擊手', '左外野手', '中外野手', '右外野手', '指定打擊']
  if (!validPositions.includes(position)) {
    throw createError({ statusCode: 400, message: '守備位置無效' })
  }

  // 同隊背號唯一
  const duplicate = mockPlayers.find(p => p.team_id === team_id && p.number === playerNumber && p.status === 'active')
  if (duplicate) {
    throw createError({ statusCode: 409, message: '該背號已被使用' })
  }

  const team = mockTeams.find(t => t.id === team_id)
  const teamName = team ? team.name : ''
  const maxSort = mockPlayers.filter(p => p.team_id === team_id && p.status === 'active').length

  const newPlayer = {
    id: getNextPlayerId(),
    number: playerNumber,
    name,
    height,
    position,
    team_id,
    team_name: teamName,
    sort_order: maxSort + 1,
    created_at: new Date().toISOString(),
    status: 'active' as const,
  }
  mockPlayers.push(newPlayer)

  // 更新球隊球員數
  if (team) {
    team.player_count += 1
  }

  return { status: 'success' as const, data: newPlayer }
})
