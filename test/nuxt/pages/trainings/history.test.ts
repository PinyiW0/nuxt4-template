import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import HistoryPage from '~/pages/trainings/history.vue'
import { useAuthStore } from '~/stores/auth'

// 註冊 mock API 端點
registerEndpoint('/api/trainings/history', () => ({
  data: [
    { id: 1, date: '2024-01-10', player_name: '王小明', team_name: '紅龍', pitch_count: 30, created_at: '2024-01-10' },
    { id: 2, date: '2024-01-11', player_name: '李大華', team_name: '藍鯨', pitch_count: 25, created_at: '2024-01-11' },
    { id: 3, date: '2024-01-12', player_name: '張三豐', team_name: '紅龍', pitch_count: 40, created_at: '2024-01-12' },
  ],
}))

describe('historyPage', () => {
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
    it('應根據選手名稱過濾', async () => {
      const wrapper = await mountSuspended(HistoryPage)
      const vm = wrapper.vm as any

      vm.searchQuery = '王小明'
      await wrapper.vm.$nextTick()

      expect(vm.filteredItems).toHaveLength(1)
      expect(vm.filteredItems[0].player_name).toBe('王小明')
    })

    it('應根據球隊名稱過濾', async () => {
      const wrapper = await mountSuspended(HistoryPage)
      const vm = wrapper.vm as any

      vm.searchQuery = '紅龍'
      await wrapper.vm.$nextTick()

      expect(vm.filteredItems).toHaveLength(2)
    })

    it('搜尋時應重置頁數為 1', async () => {
      const wrapper = await mountSuspended(HistoryPage)
      const vm = wrapper.vm as any

      vm.currentPage = 3
      vm.searchQuery = '王小明'
      await wrapper.vm.$nextTick()

      expect(vm.currentPage).toBe(1)
    })
  })

  describe('批次選取', () => {
    it('toggleSelectAll 應選取當前頁所有項目', async () => {
      const wrapper = await mountSuspended(HistoryPage)
      const vm = wrapper.vm as any

      vm.toggleSelectAll()

      expect(vm.selectedIds.size).toBe(vm.paginatedItems.length)
    })

    it('再次 toggleSelectAll 應取消全選', async () => {
      const wrapper = await mountSuspended(HistoryPage)
      const vm = wrapper.vm as any

      vm.toggleSelectAll()
      vm.toggleSelectAll()

      expect(vm.selectedIds.size).toBe(0)
    })

    it('toggleSelect 應切換單一項目的選取狀態', async () => {
      const wrapper = await mountSuspended(HistoryPage)
      const vm = wrapper.vm as any

      vm.toggleSelect(1)
      expect(vm.selectedIds.has(1)).toBe(true)

      vm.toggleSelect(1)
      expect(vm.selectedIds.has(1)).toBe(false)
    })

    it('isAllSelected 應在全選後為 true', async () => {
      const wrapper = await mountSuspended(HistoryPage)
      const vm = wrapper.vm as any

      vm.paginatedItems.forEach((item: any) => vm.selectedIds.add(item.id))
      await wrapper.vm.$nextTick()

      expect(vm.isAllSelected).toBe(true)
    })

    it('空列表時 isAllSelected 應為 false', async () => {
      const wrapper = await mountSuspended(HistoryPage)
      const vm = wrapper.vm as any

      // 搜尋不存在的項目讓列表為空
      vm.searchQuery = 'zzzzz不存在'
      await wrapper.vm.$nextTick()

      expect(vm.isAllSelected).toBe(false)
    })
  })

  describe('批次刪除', () => {
    it('未選取時 openBatchDeleteModal 不應開啟', async () => {
      const wrapper = await mountSuspended(HistoryPage)
      const vm = wrapper.vm as any

      vm.openBatchDeleteModal()

      expect(vm.isBatchDeleteModalOpen).toBe(false)
    })

    it('有選取時 openBatchDeleteModal 應開啟', async () => {
      const wrapper = await mountSuspended(HistoryPage)
      const vm = wrapper.vm as any

      vm.selectedIds.add(1)
      vm.openBatchDeleteModal()

      expect(vm.isBatchDeleteModalOpen).toBe(true)
    })
  })
})
