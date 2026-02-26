import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ id: number, account: string, role: string } | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  function setAuth(data: {
    access_token: string
    refresh_token: string
    user: { id: number, account: string, role: string }
  }) {
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
    await $fetch('/api/auth/logout', { method: 'POST' })
    clearAuth()
  }

  function clearAuth() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
  }

  return { user, accessToken, refreshToken, isAuthenticated, setAuth, login, logout, clearAuth }
}, {
  persist: {
    pick: ['user', 'accessToken', 'refreshToken'],
  },
})
