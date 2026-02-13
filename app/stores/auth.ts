import type { LoginData, LoginUser } from '~/types/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<LoginUser | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

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

  function clearAuth() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
  }

  return { user, accessToken, refreshToken, isAuthenticated, setAuth, login, clearAuth }
}, {
  persist: {
    pick: ['user', 'accessToken', 'refreshToken'],
  },
})
