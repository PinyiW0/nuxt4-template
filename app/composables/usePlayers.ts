export interface Player {
  id: number
  number: number
  name: string
  height: number
  position: string
  team_id: number
  team_name: string
  sort_order: number
  created_by: string
  status: string
  created_at: string
}

export const POSITIONS = [
  '投手',
  '捕手',
  '一壘手',
  '二壘手',
  '三壘手',
  '游擊手',
  '左外野手',
  '中外野手',
  '右外野手',
  '指定打擊',
] as const

export type Position = typeof POSITIONS[number]

export function usePlayers() {
  const { userAccount, userRole } = useAuth()
  const toast = useToast()

  const players = ref<Player[]>([])
  const isLoading = ref(false)
  const isSubmitting = ref(false)

  async function fetchPlayers(teamId?: number) {
    isLoading.value = true
    try {
      const response = await $fetch('/api/players', {
        query: {
          user: userAccount.value,
          role: userRole.value,
          team_id: teamId,
        },
      })

      if (response.status === 'success') {
        players.value = response.data as Player[]
      }
    }
    catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.add({
        title: '載入失敗',
        description: err.data?.message || '無法載入球員列表',
        color: 'error',
      })
    }
    finally {
      isLoading.value = false
    }
  }

  async function createPlayer(data: {
    number: number
    name: string
    height: number
    position: string
    team_id: number
  }) {
    if (isSubmitting.value)
      return false
    isSubmitting.value = true

    try {
      const response = await $fetch('/api/players', {
        method: 'POST',
        body: {
          ...data,
          user: userAccount.value,
          role: userRole.value,
        },
      })

      if (response.status === 'success') {
        toast.add({
          title: '新增成功',
          description: `球員「${data.name}」已新增`,
          color: 'success',
        })
        await fetchPlayers(data.team_id)
        return true
      }
      return false
    }
    catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.add({
        title: '新增失敗',
        description: err.data?.message || '無法新增球員',
        color: 'error',
      })
      return false
    }
    finally {
      isSubmitting.value = false
    }
  }

  async function updatePlayer(
    id: number,
    data: { number?: number, name?: string, height?: number, position?: string },
    teamId?: number,
  ) {
    if (isSubmitting.value)
      return false
    isSubmitting.value = true

    try {
      const response = await $fetch(`/api/players/${id}`, {
        method: 'PUT',
        body: {
          ...data,
          user: userAccount.value,
          role: userRole.value,
        },
      })

      if (response.status === 'success') {
        toast.add({
          title: '更新成功',
          description: '球員資料已更新',
          color: 'success',
        })
        await fetchPlayers(teamId)
        return true
      }
      return false
    }
    catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.add({
        title: '更新失敗',
        description: err.data?.message || '無法更新球員',
        color: 'error',
      })
      return false
    }
    finally {
      isSubmitting.value = false
    }
  }

  async function deletePlayer(id: number, teamId?: number) {
    if (isSubmitting.value)
      return false
    isSubmitting.value = true

    try {
      const response = await $fetch(`/api/players/${id}`, {
        method: 'DELETE',
        query: {
          user: userAccount.value,
          role: userRole.value,
        },
      })

      if (response.status === 'success') {
        toast.add({
          title: '刪除成功',
          description: '球員已刪除',
          color: 'success',
        })
        await fetchPlayers(teamId)
        return true
      }
      return false
    }
    catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.add({
        title: '刪除失敗',
        description: err.data?.message || '無法刪除球員',
        color: 'error',
      })
      return false
    }
    finally {
      isSubmitting.value = false
    }
  }

  async function updateSortOrder(playerIds: number[]) {
    if (isSubmitting.value)
      return false
    isSubmitting.value = true

    try {
      const response = await $fetch('/api/players/sort', {
        method: 'PUT',
        body: {
          player_ids: playerIds,
          user: userAccount.value,
          role: userRole.value,
        },
      })

      if (response.status === 'success') {
        toast.add({
          title: '排序更新',
          description: '球員排序已更新',
          color: 'success',
        })
        return true
      }
      return false
    }
    catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.add({
        title: '排序失敗',
        description: err.data?.message || '無法更新排序',
        color: 'error',
      })
      return false
    }
    finally {
      isSubmitting.value = false
    }
  }

  return {
    players,
    isLoading,
    isSubmitting,
    fetchPlayers,
    createPlayer,
    updatePlayer,
    deletePlayer,
    updateSortOrder,
  }
}
