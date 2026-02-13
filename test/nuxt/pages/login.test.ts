import { mountSuspended } from '@nuxt/test-utils/runtime'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginPage from '~/pages/login.vue'

// Mock $fetch for store
vi.stubGlobal('$fetch', vi.fn())

describe('loginPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked($fetch).mockReset()
  })

  it('應渲染登入表單', async () => {
    const wrapper = await mountSuspended(LoginPage)

    expect(wrapper.find('[data-testid="login-form"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="login-account"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="login-password"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="login-submit"]').exists()).toBe(true)
  })

  it('應顯示系統名稱', async () => {
    const wrapper = await mountSuspended(LoginPage)

    expect(wrapper.text()).toContain('鷹眼偵測系統')
  })
})
