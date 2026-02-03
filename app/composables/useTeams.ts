export interface Team {
  id: number
  name: string
  created_by: string
  player_count: number
  status: string
  created_at: string
}

export function useTeams() {
  const { userAccount, userRole } = useAuth()
  const toast = useToast()

  const teams = ref<Team[]>([])
  const isLoading = ref(false)
  const isSubmitting = ref(false)

  async function fetchTeams() {
    isLoading.value = true
    try {
      const response = await $fetch('/api/teams', {
        query: {
          user: userAccount.value,
          role: userRole.value,
        },
      })

      if (response.status === 'success') {
        teams.value = response.data as Team[]
      }
    }
    catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.add({
        title: '載入失敗',
        description: err.data?.message || '無法載入球隊列表',
        color: 'error',
      })
    }
    finally {
      isLoading.value = false
    }
  }

  async function createTeam(name: string) {
    if (isSubmitting.value)
      return false
    isSubmitting.value = true

    try {
      const response = await $fetch('/api/teams', {
        method: 'POST',
        body: {
          name,
          created_by: userAccount.value,
        },
      })

      if (response.status === 'success') {
        toast.add({
          title: '建立成功',
          description: `球隊「${name}」已建立`,
          color: 'success',
        })
        await fetchTeams()
        return true
      }
      return false
    }
    catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.add({
        title: '建立失敗',
        description: err.data?.message || '無法建立球隊',
        color: 'error',
      })
      return false
    }
    finally {
      isSubmitting.value = false
    }
  }

  async function updateTeam(id: number, name: string) {
    if (isSubmitting.value)
      return false
    isSubmitting.value = true

    try {
      const response = await $fetch(`/api/teams/${id}`, {
        method: 'PUT',
        body: {
          name,
          user: userAccount.value,
          role: userRole.value,
        },
      })

      if (response.status === 'success') {
        toast.add({
          title: '更新成功',
          description: `球隊名稱已更新為「${name}」`,
          color: 'success',
        })
        await fetchTeams()
        return true
      }
      return false
    }
    catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.add({
        title: '更新失敗',
        description: err.data?.message || '無法更新球隊',
        color: 'error',
      })
      return false
    }
    finally {
      isSubmitting.value = false
    }
  }

  async function deleteTeam(id: number) {
    if (isSubmitting.value)
      return false
    isSubmitting.value = true

    try {
      const response = await $fetch(`/api/teams/${id}`, {
        method: 'DELETE',
        query: {
          user: userAccount.value,
          role: userRole.value,
        },
      })

      if (response.status === 'success') {
        toast.add({
          title: '刪除成功',
          description: '球隊已刪除',
          color: 'success',
        })
        await fetchTeams()
        return true
      }
      return false
    }
    catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.add({
        title: '刪除失敗',
        description: err.data?.message || '無法刪除球隊',
        color: 'error',
      })
      return false
    }
    finally {
      isSubmitting.value = false
    }
  }

  return {
    teams,
    isLoading,
    isSubmitting,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
  }
}
