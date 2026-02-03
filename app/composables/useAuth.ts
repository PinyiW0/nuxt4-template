import { useAuthStore } from '~/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()
  const toast = useToast()
  const router = useRouter()

  const isLoading = ref(false)

  async function login(account: string, password: string) {
    if (isLoading.value)
      return false

    isLoading.value = true

    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { account, password },
      })

      if (response.status === 'success' && response.data) {
        authStore.setAuth({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          user: response.data.user as { id: number, account: string, role: '管理者' | '教練' },
        })

        toast.add({
          title: '登入成功',
          description: `歡迎回來，${response.data.user.account}`,
          color: 'success',
        })

        await router.push('/')
        return true
      }

      return false
    }
    catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.add({
        title: '登入失敗',
        description: err.data?.message || '發生未知錯誤',
        color: 'error',
      })
      return false
    }
    finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
      })
    }
    catch {
      // Ignore logout API errors
    }
    finally {
      authStore.clearAuth()
      toast.add({
        title: '已登出',
        description: '您已成功登出系統',
        color: 'info',
      })
      router.push('/login')
    }
  }

  async function refreshAccessToken() {
    if (!authStore.refreshToken) {
      return false
    }

    try {
      const response = await $fetch('/api/auth/refresh', {
        method: 'POST',
        body: { refreshToken: authStore.refreshToken },
      })

      if (response.status === 'success' && response.data) {
        authStore.setAccessToken(response.data.accessToken)
        return true
      }

      return false
    }
    catch {
      // Refresh failed, clear auth
      authStore.clearAuth()
      toast.add({
        title: '登入已過期',
        description: '請重新登入',
        color: 'warning',
      })
      router.push('/login')
      return false
    }
  }

  return {
    // State
    isLoading,
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isAdmin: computed(() => authStore.isAdmin),
    user: computed(() => authStore.user),
    userAccount: computed(() => authStore.userAccount),
    userRole: computed(() => authStore.userRole),
    // Actions
    login,
    logout,
    refreshAccessToken,
  }
}
