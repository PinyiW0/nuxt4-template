import { getTrainingStats } from '../../mock/data/pitches'
import { getPlayerById } from '../../mock/data/players'
import { getTeamById } from '../../mock/data/teams'
import { getTrainingById } from '../../mock/data/trainings'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const query = getQuery(event)
  const user = query.user as string | undefined
  const role = query.role as string | undefined

  const training = getTrainingById(id)

  if (!training) {
    throw createError({
      statusCode: 404,
      message: '訓練不存在或已刪除',
    })
  }

  // 權限檢查
  if (role !== '管理者' && training.created_by !== user) {
    throw createError({
      statusCode: 403,
      message: '無權限查看此訓練',
    })
  }

  const player = getPlayerById(training.player_id)
  const team = getTeamById(training.team_id)
  const stats = getTrainingStats(id)

  return {
    status: 'success',
    data: {
      ...training,
      player_name: player?.name || '未知球員',
      player_height: player?.height,
      team_name: team?.name || '未知球隊',
      stats,
    },
  }
})
