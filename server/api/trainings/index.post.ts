import { getPlayerById } from '../../mock/data/players'
import { getTeamById } from '../../mock/data/teams'
import { createTraining } from '../../mock/data/trainings'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { date, player_id, team_id, created_by, user, role, strike_zone_top, strike_zone_bottom }
    = body

  // 驗證日期
  if (!date) {
    throw createError({
      statusCode: 400,
      message: '訓練日期為必填',
    })
  }

  // 驗證球員
  const player = getPlayerById(player_id)
  if (!player) {
    throw createError({
      statusCode: 404,
      message: '球員不存在或已刪除',
    })
  }

  // 驗證球隊
  const team = getTeamById(team_id || player.team_id)
  if (!team) {
    throw createError({
      statusCode: 404,
      message: '球隊不存在或已刪除',
    })
  }

  // 權限檢查
  if (role !== '管理者' && team.created_by !== user) {
    throw createError({
      statusCode: 403,
      message: '無權限操作此訓練',
    })
  }

  const training = createTraining({
    date,
    player_id,
    team_id: team_id || player.team_id,
    created_by: created_by || user || 'unknown',
    strike_zone_top,
    strike_zone_bottom,
  })

  return {
    status: 'success',
    data: training,
  }
})
