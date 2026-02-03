export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<{
    id: number
    account: string
    role: '管理者' | '教練'
  } | null>(null)

  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === '管理者')
  const userAccount = computed(() => user.value?.account || '')
  const userRole = computed(() => user.value?.role || '')

  // Actions
  function setAuth(data: {
    accessToken: string
    refreshToken: string
    user: { id: number, account: string, role: '管理者' | '教練' }
  }) {
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken
    user.value = data.user
  }

  function setAccessToken(token: string) {
    accessToken.value = token
  }

  function clearAuth() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
  }

  return {
    // State
    user,
    accessToken,
    refreshToken,
    // Getters
    isAuthenticated,
    isAdmin,
    userAccount,
    userRole,
    // Actions
    setAuth,
    setAccessToken,
    clearAuth,
  }
}, {
  persist: {
    pick: ['user', 'accessToken', 'refreshToken'],
  },
})
