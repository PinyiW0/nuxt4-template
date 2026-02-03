import { batchDeletePlayerAnalyses, getPlayerAnalysisById } from '../../mock/data/playerAnalysis'
import { players } from '../../mock/data/players'
import { teams } from '../../mock/data/teams'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { player_ids, user, role } = body

  if (!Array.isArray(player_ids) || player_ids.length === 0) {
    throw createError({
      statusCode: 400,
      message: '球員 ID 列表不可為空',
    })
  }

  // 權限檢查
  if (role !== '管理者') {
    for (const playerId of player_ids) {
      const analysis = getPlayerAnalysisById(playerId)
      if (analysis) {
        const player = players.find(p => p.id === playerId)
        if (player) {
          const team = teams.find(t => t.id === player.team_id)
          if (team && team.created_by !== user) {
            throw createError({
              statusCode: 403,
              message: '無權限操作此球員',
            })
          }
        }
      }
    }
  }

  const deletedCount = batchDeletePlayerAnalyses(player_ids)

  return {
    status: 'success',
    data: {
      deleted_count: deletedCount,
    },
  }
})
