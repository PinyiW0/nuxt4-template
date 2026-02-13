import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AnalysisPage from '~/pages/analysis/index.vue'

// 註冊 mock API 端點
registerEndpoint('/api/player-analysis', () => ({
  data: [
    { id: 1, number: 10, name: '王小明', team_name: '紅龍', training_count: 5, total_pitches: 100, avg_velocity: 135.5, last_training_date: '2024-01-15' },
    { id: 2, number: 20, name: '李大華', team_name: '藍鯨', training_count: 3, total_pitches: 60, avg_velocity: 130.0, last_training_date: '2024-01-14' },
    { id: 3, number: 30, name: '張三豐', team_name: '紅龍', training_count: 8, total_pitches: 200, avg_velocity: 140.0, last_training_date: '2024-01-13' },
  ],
}))

describe('analysisPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('分頁', () => {
    it('應正確計算總數', async () => {
      const wrapper = await mountSuspended(AnalysisPage)
      const vm = wrapper.vm as any

      expect(vm.totalItems).toBe(3)
    })

    it('搜尋時應重置頁數為 1', async () => {
      const wrapper = await mountSuspended(AnalysisPage)
      const vm = wrapper.vm as any

      vm.currentPage = 3
      vm.searchQuery = '王小明'
      await wrapper.vm.$nextTick()

      expect(vm.currentPage).toBe(1)
    })
  })

  describe('批次選取', () => {
    it('toggleSelectAll 應選取當前頁所有項目', async () => {
      const wrapper = await mountSuspended(AnalysisPage)
      const vm = wrapper.vm as any

      vm.toggleSelectAll()

      expect(vm.selectedIds.size).toBe(vm.paginatedItems.length)
    })

    it('toggleSelect 應切換單一項目的選取狀態', async () => {
      const wrapper = await mountSuspended(AnalysisPage)
      const vm = wrapper.vm as any

      vm.toggleSelect(1)
      expect(vm.selectedIds.has(1)).toBe(true)

      vm.toggleSelect(1)
      expect(vm.selectedIds.has(1)).toBe(false)
    })

    it('isAllSelected 應在全選後為 true', async () => {
      const wrapper = await mountSuspended(AnalysisPage)
      const vm = wrapper.vm as any

      vm.paginatedItems.forEach((item: any) => vm.selectedIds.add(item.id))
      await wrapper.vm.$nextTick()

      expect(vm.isAllSelected).toBe(true)
    })
  })

  describe('批次刪除', () => {
    it('未選取時 openBatchDeleteModal 不應開啟', async () => {
      const wrapper = await mountSuspended(AnalysisPage)
      const vm = wrapper.vm as any

      vm.openBatchDeleteModal()

      expect(vm.isBatchDeleteModalOpen).toBe(false)
    })
  })

  describe('formatDate', () => {
    it('應格式化日期字串', async () => {
      const wrapper = await mountSuspended(AnalysisPage)
      const vm = wrapper.vm as any

      const result = vm.formatDate('2024-01-15')
      expect(result).toMatch(/2024/)
    })
  })
})
