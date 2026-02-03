import { players } from '../../mock/data/players'
import { teams } from '../../mock/data/teams'
import { getHistoryTrainings } from '../../mock/data/trainings'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userAccount = query.user as string | undefined
  const userRole = query.role as string | undefined
  const isAdmin = userRole === '管理者'

  const trainingList = getHistoryTrainings(userAccount, isAdmin)

  // 加入球員和球隊名稱
  const trainingsWithDetails = trainingList.map((training) => {
    const player = players.find(p => p.id === training.player_id)
    const team = teams.find(t => t.id === training.team_id)
    return {
      ...training,
      player_name: player?.name || '未知球員',
      team_name: team?.name || '未知球隊',
    }
  })

  // 依建立時間倒序排列
  trainingsWithDetails.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  return {
    status: 'success',
    data: trainingsWithDetails,
  }
})
