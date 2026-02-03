import {
  getPlayerAnalyses,
  getPlayerAnalysesByCreator,
  getPlayerAnalysesByTeam,
} from '../../mock/data/playerAnalysis'
import { players } from '../../mock/data/players'
import { teams } from '../../mock/data/teams'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userAccount = query.user as string | undefined
  const userRole = query.role as string | undefined
  const teamId = query.team_id ? Number(query.team_id) : undefined
  const keyword = query.keyword as string | undefined
  const isAdmin = userRole === '管理者'

  let analysisList
  if (isAdmin) {
    analysisList = teamId ? getPlayerAnalysesByTeam(teamId) : getPlayerAnalyses()
  }
  else {
    analysisList = getPlayerAnalysesByCreator(userAccount || '')
    if (teamId) {
      analysisList = analysisList.filter((pa) => {
        const player = players.find(p => p.id === pa.player_id)
        return player && player.team_id === teamId
      })
    }
  }

  // 加入球員和球隊資訊
  let analysesWithDetails = analysisList.map((analysis) => {
    const player = players.find(p => p.id === analysis.player_id)
    const team = player ? teams.find(t => t.id === player.team_id) : null
    return {
      id: player?.id,
      name: player?.name || '未知球員',
      number: player?.number,
      team_name: team?.name || '未知球隊',
      team_id: player?.team_id,
      training_count: analysis.training_count,
      total_pitches: analysis.total_pitches,
      last_training_date: analysis.last_training_date,
      avg_velocity: analysis.avg_velocity,
    }
  })

  // 關鍵字搜尋（姓名）
  if (keyword) {
    analysesWithDetails = analysesWithDetails.filter(a => a.name.includes(keyword))
  }

  return {
    status: 'success',
    data: analysesWithDetails,
  }
})
