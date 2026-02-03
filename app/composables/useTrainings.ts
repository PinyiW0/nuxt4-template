export interface Training {
  id: number
  date: string
  player_id: number
  player_name: string
  team_id: number
  team_name: string
  pitch_count: number
  ai_status: 'running' | 'stopped'
  strike_zone_top: number
  strike_zone_bottom: number
  created_by: string
  status: string
  created_at: string
}

export function useTrainings() {
  const { userAccount, userRole } = useAuth()
  const toast = useToast()

  const trainings = ref<Training[]>([])
  const isLoading = ref(false)
  const isSubmitting = ref(false)

  async function fetchTrainings() {
    isLoading.value = true
    try {
      const response = await $fetch('/api/trainings', {
        query: {
          user: userAccount.value,
          role: userRole.value,
        },
      })

      if (response.status === 'success') {
        trainings.value = response.data as Training[]
      }
    }
    catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.add({
        title: '載入失敗',
        description: err.data?.message || '無法載入訓練列表',
        color: 'error',
      })
    }
    finally {
      isLoading.value = false
    }
  }

  async function fetchHistoryTrainings() {
    isLoading.value = true
    try {
      const response = await $fetch('/api/trainings/history', {
        query: {
          user: userAccount.value,
          role: userRole.value,
        },
      })

      if (response.status === 'success') {
        trainings.value = response.data as Training[]
      }
    }
    catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.add({
        title: '載入失敗',
        description: err.data?.message || '無法載入歷史訓練列表',
        color: 'error',
      })
    }
    finally {
      isLoading.value = false
    }
  }

  async function createTraining(data: {
    date: string
    player_id: number
    team_id: number
    strike_zone_top?: number
    strike_zone_bottom?: number
  }) {
    if (isSubmitting.value)
      return false
    isSubmitting.value = true

    try {
      const response = await $fetch('/api/trainings', {
        method: 'POST',
        body: {
          ...data,
          user: userAccount.value,
          role: userRole.value,
        },
      })

      if (response.status === 'success') {
        toast.add({
          title: '建立成功',
          description: '訓練已建立',
          color: 'success',
        })
        await fetchTrainings()
        return true
      }
      return false
    }
    catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.add({
        title: '建立失敗',
        description: err.data?.message || '無法建立訓練',
        color: 'error',
      })
      return false
    }
    finally {
      isSubmitting.value = false
    }
  }

  async function deleteTraining(id: number) {
    if (isSubmitting.value)
      return false
    isSubmitting.value = true

    try {
      const response = await $fetch(`/api/trainings/${id}`, {
        method: 'DELETE',
        query: {
          user: userAccount.value,
          role: userRole.value,
        },
      })

      if (response.status === 'success') {
        toast.add({
          title: '刪除成功',
          description: '訓練已刪除',
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
        description: err.data?.message || '無法刪除訓練',
        color: 'error',
      })
      return false
    }
    finally {
      isSubmitting.value = false
    }
  }

  async function batchDeleteTrainings(ids: number[]) {
    if (isSubmitting.value)
      return false
    isSubmitting.value = true

    try {
      const response = await $fetch('/api/trainings/batch-delete', {
        method: 'POST',
        body: {
          ids,
          user: userAccount.value,
          role: userRole.value,
        },
      })

      if (response.status === 'success') {
        const data = response.data as { deleted_count: number }
        toast.add({
          title: '批次刪除成功',
          description: `已刪除 ${data.deleted_count} 筆訓練`,
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
        description: err.data?.message || '無法刪除訓練',
        color: 'error',
      })
      return false
    }
    finally {
      isSubmitting.value = false
    }
  }

  return {
    trainings,
    isLoading,
    isSubmitting,
    fetchTrainings,
    fetchHistoryTrainings,
    createTraining,
    deleteTraining,
    batchDeleteTrainings,
  }
}
