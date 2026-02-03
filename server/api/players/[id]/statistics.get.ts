import { getPlayerStatistics } from '../../../mock/data/playerAnalysis'
import { getPlayerById } from '../../../mock/data/players'
import { teams } from '../../../mock/data/teams'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const query = getQuery(event)
  const user = query.user as string | undefined
  const role = query.role as string | undefined

  const player = getPlayerById(id)

  if (!player) {
    throw createError({
      statusCode: 404,
      message: '球員不存在或已刪除',
    })
  }

  // 取得球員所屬球隊
  const team = teams.find(t => t.id === player.team_id)

  // 權限檢查
  if (role !== '管理者' && team?.created_by !== user) {
    throw createError({
      statusCode: 403,
      message: '無權限查看此球員',
    })
  }

  const statistics = getPlayerStatistics(id)

  if (!statistics) {
    return {
      status: 'success',
      data: {
        player_id: id,
        player_name: player.name,
        player_number: player.number,
        team_name: team?.name || '未知球隊',
        training_count: 0,
        total_pitches: 0,
        last_training_date: null,
        avg_velocity: null,
        avg_spin_rate: null,
        strike_rate: null,
        velocity_trend: [],
        pitch_type_distribution: [],
        strike_zone_heatmap: [],
      },
    }
  }

  return {
    status: 'success',
    data: {
      ...statistics,
      player_name: player.name,
      player_number: player.number,
      team_name: team?.name || '未知球隊',
    },
  }
})
