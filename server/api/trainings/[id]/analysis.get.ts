import { getPitchesByTraining, getTrainingStats } from '../../../mock/data/pitches'
import { getPlayerById } from '../../../mock/data/players'
import { getTeamById } from '../../../mock/data/teams'
import { getTrainingById } from '../../../mock/data/trainings'

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
  const pitches = getPitchesByTraining(id)

  // 計算熱區分布 (3x3 九宮格)
  const heatmap = Array.from({ length: 9 }, () => ({ count: 0, strikes: 0 }))
  pitches.forEach((pitch) => {
    // 將 location_x (-0.4 ~ 0.4) 和 location_y (0.3 ~ 1.2) 映射到 0-2
    const col = Math.min(2, Math.max(0, Math.floor((pitch.location_x + 0.4) / 0.27)))
    const row = Math.min(2, Math.max(0, Math.floor((1.2 - pitch.location_y) / 0.3)))
    const index = row * 3 + col
    const cell = heatmap[index]
    if (cell) {
      cell.count++
      if (pitch.is_strike)
        cell.strikes++
    }
  })

  // 計算球速分布
  const velocityRanges = [
    { label: '< 120', min: 0, max: 120, count: 0 },
    { label: '120-125', min: 120, max: 125, count: 0 },
    { label: '125-130', min: 125, max: 130, count: 0 },
    { label: '130-135', min: 130, max: 135, count: 0 },
    { label: '> 135', min: 135, max: 999, count: 0 },
  ]
  pitches.forEach((pitch) => {
    const range = velocityRanges.find(r => pitch.velocity >= r.min && pitch.velocity < r.max)
    if (range)
      range.count++
  })

  return {
    status: 'success',
    data: {
      training: {
        ...training,
        player_name: player?.name || '未知球員',
        team_name: team?.name || '未知球隊',
      },
      stats,
      heatmap: heatmap.map((cell, index) => ({
        row: Math.floor(index / 3),
        col: index % 3,
        count: cell.count,
        strikes: cell.strikes,
        strike_rate: cell.count > 0 ? Math.round((cell.strikes / cell.count) * 100) : 0,
      })),
      velocity_distribution: velocityRanges.map(r => ({
        label: r.label,
        count: r.count,
      })),
    },
  }
})
