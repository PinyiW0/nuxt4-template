export interface PlayerAnalysis {
  id: number
  name: string
  number: number
  team_name: string
  team_id: number
  training_count: number
  total_pitches: number
  last_training_date: string | null
  avg_velocity: number | null
}

export interface PlayerStatistics {
  player_id: number
  player_name: string
  player_number: number
  team_name: string
  training_count: number
  total_pitches: number
  last_training_date: string | null
  avg_velocity: number | null
  avg_spin_rate: number | null
  strike_rate: number | null
  velocity_trend: { date: string, value: number }[]
  pitch_type_distribution: { type: string, count: number, percentage: number }[]
  strike_zone_heatmap: { x: number, y: number, count: number }[]
}

export function usePlayerAnalysis() {
  const { userAccount, userRole } = useAuth()
  const toast = useToast()

  const analyses = ref<PlayerAnalysis[]>([])
  const isLoading = ref(false)

  async function fetchAnalyses(teamId?: number, keyword?: string) {
    isLoading.value = true
    try {
      const response = await $fetch('/api/player-analysis', {
        query: {
          user: userAccount.value,
          role: userRole.value,
          team_id: teamId,
          keyword,
        },
      })

      if (response.status === 'success') {
        analyses.value = response.data as PlayerAnalysis[]
      }
    }
    catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.add({
        title: '載入失敗',
        description: err.data?.message || '無法載入選手分析列表',
        color: 'error',
      })
    }
    finally {
      isLoading.value = false
    }
  }

  async function fetchPlayerStatistics(playerId: number): Promise<PlayerStatistics | null> {
    try {
      const response = await $fetch(`/api/players/${playerId}/statistics`, {
        query: {
          user: userAccount.value,
          role: userRole.value,
        },
      })

      if (response.status === 'success') {
        return response.data as PlayerStatistics
      }
      return null
    }
    catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.add({
        title: '載入失敗',
        description: err.data?.message || '無法載入選手統計資料',
        color: 'error',
      })
      return null
    }
  }

  const isSubmitting = ref(false)

  async function batchDeleteAnalyses(playerIds: number[]) {
    if (isSubmitting.value)
      return false
    isSubmitting.value = true

    try {
      const response = await $fetch('/api/player-analysis/batch-delete', {
        method: 'POST',
        body: {
          player_ids: playerIds,
          user: userAccount.value,
          role: userRole.value,
        },
      })

      if (response.status === 'success') {
        const data = response.data as { deleted_count: number }
        toast.add({
          title: '刪除成功',
          description: `已刪除 ${data.deleted_count} 位選手的分析資料`,
          color: 'success',
        })
        return true
      }
      return false
    }
    catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.add({
        title: '刪除失敗',
        description: err.data?.message || '無法刪除選手分析資料',
        color: 'error',
      })
      return false
    }
    finally {
      isSubmitting.value = false
    }
  }

  return {
    analyses,
    isLoading,
    isSubmitting,
    fetchAnalyses,
    fetchPlayerStatistics,
    batchDeleteAnalyses,
  }
}
