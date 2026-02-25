import type { LoginData, LoginUser } from '~/types/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<LoginUser | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === '管理者')
  const currentAccount = computed(() => user.value?.account || '')

  function setAuth(data: LoginData) {
    accessToken.value = data.access_token
    refreshToken.value = data.refresh_token
    user.value = data.user
  }

  async function login(account: string, password: string) {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { account, password },
    })
    setAuth(response.data)
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    }
    finally {
      clearAuth()
    }
  }

  async function refresh() {
    if (!refreshToken.value) {
      clearAuth()
      throw new Error('請重新登入')
    }

    const response = await $fetch('/api/auth/refresh', {
      method: 'POST',
      body: { refresh_token: refreshToken.value },
    })
    accessToken.value = response.data.access_token
  }

  function clearAuth() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isAdmin,
    currentAccount,
    setAuth,
    login,
    logout,
    refresh,
    clearAuth,
  }
}, {
  persist: {
    pick: ['user', 'accessToken', 'refreshToken'],
  },
})
