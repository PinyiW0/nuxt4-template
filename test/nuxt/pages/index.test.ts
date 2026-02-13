import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import IndexPage from '~/pages/index.vue'
import { useAuthStore } from '~/stores/auth'

// 註冊 mock API 端點
registerEndpoint('/api/trainings', () => ({
  data: [
    { id: 1, date: '2025-06-01', player_name: '王小明', team_name: '紅龍', pitch_count: 30, ai_status: 'stopped' },
    { id: 2, date: '2025-06-02', player_name: '李大華', team_name: '藍鯨', pitch_count: 25, ai_status: 'running' },
    { id: 3, date: '2025-06-03', player_name: '張三豐', team_name: '紅龍', pitch_count: 40, ai_status: 'stopped' },
  ],
}))

registerEndpoint('/api/teams', () => ({
  data: [
    { id: 1, name: '紅龍' },
    { id: 2, name: '藍鯨' },
  ],
}))

registerEndpoint('/api/players', () => ({
  data: [
    { id: 1, number: 10, name: '王小明', team_id: 1 },
    { id: 2, number: 20, name: '李大華', team_id: 2 },
  ],
}))

describe('indexPage（訓練管理）', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const store = useAuthStore()
    store.setAuth({
      access_token: 'token',
      refresh_token: 'refresh',
      user: { id: 1, account: 'admin', role: '管理者' },
    })
  })

  describe('搜尋過濾', () => {
    it('無搜尋時應顯示所有項目', async () => {
      const wrapper = await mountSuspended(IndexPage)
      const vm = wrapper.vm as any

      expect(vm.filteredItems).toHaveLength(3)
    })

    it('應根據選手名稱過濾', async () => {
      const wrapper = await mountSuspended(IndexPage)
      const vm = wrapper.vm as any

      vm.searchQuery = '王小明'
      await wrapper.vm.$nextTick()

      expect(vm.filteredItems).toHaveLength(1)
    })

    it('應根據球隊名稱過濾', async () => {
      const wrapper = await mountSuspended(IndexPage)
      const vm = wrapper.vm as any

      vm.searchQuery = '紅龍'
      await wrapper.vm.$nextTick()

      expect(vm.filteredItems).toHaveLength(2)
    })

    it('搜尋時應重置頁數為 1', async () => {
      const wrapper = await mountSuspended(IndexPage)
      const vm = wrapper.vm as any

      vm.currentPage = 3
      vm.searchQuery = '王小明'
      await wrapper.vm.$nextTick()

      expect(vm.currentPage).toBe(1)
    })
  })

  describe('formatDate', () => {
    it('應格式化日期字串', async () => {
      const wrapper = await mountSuspended(IndexPage)
      const vm = wrapper.vm as any

      const result = vm.formatDate('2025-06-01')
      expect(result).toMatch(/2025/)
    })
  })

  describe('modal 控制', () => {
    it('openCreateModal 應開啟建立 Modal', async () => {
      const wrapper = await mountSuspended(IndexPage)
      const vm = wrapper.vm as any

      vm.openCreateModal()

      expect(vm.isFormModalOpen).toBe(true)
    })

    it('openDeleteModal 應開啟刪除 Modal', async () => {
      const wrapper = await mountSuspended(IndexPage)
      const vm = wrapper.vm as any

      const training = { id: 1, player_name: '王小明' }
      vm.openDeleteModal(training)

      expect(vm.isDeleteModalOpen).toBe(true)
      expect(vm.deletingTraining).toEqual(training)
    })
  })
})
