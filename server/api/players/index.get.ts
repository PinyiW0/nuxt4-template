import { getPlayers, getPlayersByCreator, getPlayersByTeam } from '../../mock/data/players'
import { teams } from '../../mock/data/teams'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userAccount = query.user as string | undefined
  const userRole = query.role as string | undefined
  const teamId = query.team_id ? Number(query.team_id) : undefined

  let playerList
  if (userRole === '管理者') {
    playerList = teamId ? getPlayersByTeam(teamId) : getPlayers()
  }
  else {
    playerList = getPlayersByCreator(userAccount || '')
    if (teamId) {
      playerList = playerList.filter(p => p.team_id === teamId)
    }
  }

  // 加入球隊名稱
  const playersWithTeamName = playerList.map((player) => {
    const team = teams.find(t => t.id === player.team_id)
    return {
      ...player,
      team_name: team?.name || '未知球隊',
    }
  })

  // 依建立時間倒序排列
  playersWithTeamName.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  return {
    status: 'success',
    data: playersWithTeamName,
  }
})
