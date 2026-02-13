import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import TeamsPage from '~/pages/teams/index.vue'
import { useAuthStore } from '~/stores/auth'

// 註冊 mock API 端點（useFetch 會走 registerEndpoint）
registerEndpoint('/api/teams', () => ({
  data: [
    { id: 1, name: '紅龍', player_count: 12, created_by: 'coach1', created_at: '2024-01-01', status: 'active' },
    { id: 2, name: '藍鯨', player_count: 8, created_by: 'coach2', created_at: '2024-01-02', status: 'active' },
    { id: 3, name: '綠鷹', player_count: 10, created_by: 'coach1', created_at: '2024-01-03', status: 'active' },
  ],
}))

describe('teamsPage', () => {
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
      const wrapper = await mountSuspended(TeamsPage)
      const vm = wrapper.vm as any

      expect(vm.filteredItems).toHaveLength(3)
    })

    it('應根據球隊名稱過濾', async () => {
      const wrapper = await mountSuspended(TeamsPage)
      const vm = wrapper.vm as any

      vm.searchQuery = '紅龍'
      await wrapper.vm.$nextTick()

      expect(vm.filteredItems).toHaveLength(1)
      expect(vm.filteredItems[0].name).toBe('紅龍')
    })

    it('應根據建立者過濾', async () => {
      const wrapper = await mountSuspended(TeamsPage)
      const vm = wrapper.vm as any

      vm.searchQuery = 'coach1'
      await wrapper.vm.$nextTick()

      expect(vm.filteredItems).toHaveLength(2)
    })

    it('搜尋時應重置頁數為 1', async () => {
      const wrapper = await mountSuspended(TeamsPage)
      const vm = wrapper.vm as any

      vm.currentPage = 3
      vm.searchQuery = '紅龍'
      await wrapper.vm.$nextTick()

      expect(vm.currentPage).toBe(1)
    })
  })

  describe('分頁', () => {
    it('應正確計算總數', async () => {
      const wrapper = await mountSuspended(TeamsPage)
      const vm = wrapper.vm as any

      expect(vm.totalItems).toBe(3)
    })
  })

  describe('formatDate', () => {
    it('應格式化日期字串', async () => {
      const wrapper = await mountSuspended(TeamsPage)
      const vm = wrapper.vm as any

      const result = vm.formatDate('2024-01-15')
      expect(result).toMatch(/2024/)
    })
  })

  describe('modal 控制', () => {
    it('openCreateModal 應重置表單並開啟 Modal', async () => {
      const wrapper = await mountSuspended(TeamsPage)
      const vm = wrapper.vm as any

      vm.openCreateModal()

      expect(vm.isFormModalOpen).toBe(true)
      expect(vm.isEditing).toBe(false)
      expect(vm.formState.name).toBe('')
    })

    it('openEditModal 應帶入球隊資料', async () => {
      const wrapper = await mountSuspended(TeamsPage)
      const vm = wrapper.vm as any
      const team = { id: 1, name: '紅龍' }

      vm.openEditModal(team)

      expect(vm.isFormModalOpen).toBe(true)
      expect(vm.isEditing).toBe(true)
      expect(vm.formState.name).toBe('紅龍')
    })
  })
})
