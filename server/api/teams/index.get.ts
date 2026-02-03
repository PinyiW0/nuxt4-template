import { players } from '../../mock/data/players'
import { getTeams, getTeamsByCreator } from '../../mock/data/teams'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userAccount = query.user as string | undefined
  const userRole = query.role as string | undefined

  const teamList = userRole === '管理者' ? getTeams() : getTeamsByCreator(userAccount || '')

  // 計算每個球隊的球員數量
  const teamsWithPlayerCount = teamList.map((team) => {
    const playerCount = players.filter(p => p.team_id === team.id && p.status === 'active').length
    return {
      ...team,
      player_count: playerCount,
    }
  })

  // 依建立時間倒序排列
  teamsWithPlayerCount.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  return {
    status: 'success',
    data: teamsWithPlayerCount,
  }
})
