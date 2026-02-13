import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '~/stores/auth'

// Mock $fetch
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockReset()
  })

  it('初始狀態為未登入', () => {
    const store = useAuthStore()

    expect(store.isAuthenticated).toBe(false)
    expect(store.user).toBeNull()
  })

  it('setAuth 設定認證資料', () => {
    const store = useAuthStore()

    store.setAuth({
      access_token: 'token-1',
      refresh_token: 'refresh-1',
      user: { id: 1, account: 'admin', role: '管理者' },
    })

    expect(store.isAuthenticated).toBe(true)
    expect(store.user!.account).toBe('admin')
  })

  it('login 呼叫 API 並設定認證', async () => {
    const store = useAuthStore()

    mockFetch.mockResolvedValue({
      data: {
        access_token: 'token-1',
        refresh_token: 'refresh-1',
        user: { id: 1, account: 'admin', role: '管理者' },
      },
    })

    await store.login('admin', 'pass123')

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      body: { account: 'admin', password: 'pass123' },
    })
    expect(store.isAuthenticated).toBe(true)
  })

  it('clearAuth 清除所有認證資料', () => {
    const store = useAuthStore()

    store.setAuth({
      access_token: 'token-1',
      refresh_token: 'refresh-1',
      user: { id: 1, account: 'admin', role: '管理者' },
    })

    store.clearAuth()

    expect(store.user).toBeNull()
    expect(store.accessToken).toBeNull()
    expect(store.refreshToken).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })
})
