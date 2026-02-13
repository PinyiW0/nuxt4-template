import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import PlayersPage from '~/pages/players/index.vue'
import { useAuthStore } from '~/stores/auth'

// 註冊 mock API 端點
registerEndpoint('/api/teams', () => ({
  data: [
    { id: 1, name: '紅龍' },
    { id: 2, name: '藍鯨' },
  ],
}))

registerEndpoint('/api/players', () => ({
  data: [
    { id: 1, number: 10, name: '王小明', height: 178, position: '投手', team_id: 1, team_name: '紅龍' },
    { id: 2, number: 20, name: '李大華', height: 182, position: '捕手', team_id: 2, team_name: '藍鯨' },
    { id: 3, number: 30, name: '張三豐', height: 175, position: '游擊手', team_id: 1, team_name: '紅龍' },
  ],
}))

describe('playersPage', () => {
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
    it('應根據球員姓名過濾', async () => {
      const wrapper = await mountSuspended(PlayersPage)
      const vm = wrapper.vm as any

      vm.searchQuery = '王小明'
      await wrapper.vm.$nextTick()

      expect(vm.filteredItems).toHaveLength(1)
      expect(vm.filteredItems[0].name).toBe('王小明')
    })

    it('應根據背號過濾', async () => {
      const wrapper = await mountSuspended(PlayersPage)
      const vm = wrapper.vm as any

      vm.searchQuery = '10'
      await wrapper.vm.$nextTick()

      expect(vm.filteredItems).toHaveLength(1)
      expect(vm.filteredItems[0].number).toBe(10)
    })

    it('應根據球隊名稱過濾', async () => {
      const wrapper = await mountSuspended(PlayersPage)
      const vm = wrapper.vm as any

      vm.searchQuery = '紅龍'
      await wrapper.vm.$nextTick()

      expect(vm.filteredItems).toHaveLength(2)
    })

    it('應根據守備位置過濾', async () => {
      const wrapper = await mountSuspended(PlayersPage)
      const vm = wrapper.vm as any

      vm.searchQuery = '投手'
      await wrapper.vm.$nextTick()

      expect(vm.filteredItems).toHaveLength(1)
    })

    it('搜尋時應重置頁數為 1', async () => {
      const wrapper = await mountSuspended(PlayersPage)
      const vm = wrapper.vm as any

      vm.currentPage = 3
      vm.searchQuery = '王小明'
      await wrapper.vm.$nextTick()

      expect(vm.currentPage).toBe(1)
    })
  })

  describe('modal 控制', () => {
    it('openCreateModal 應重置表單', async () => {
      const wrapper = await mountSuspended(PlayersPage)
      const vm = wrapper.vm as any

      vm.openCreateModal()

      expect(vm.isFormModalOpen).toBe(true)
      expect(vm.isEditing).toBe(false)
      expect(vm.formState.name).toBe('')
    })

    it('openEditModal 應帶入球員資料', async () => {
      const wrapper = await mountSuspended(PlayersPage)
      const vm = wrapper.vm as any

      const player = { id: 1, number: 10, name: '王小明', height: 178, position: '投手', team_id: 1 }
      vm.openEditModal(player)

      expect(vm.isFormModalOpen).toBe(true)
      expect(vm.isEditing).toBe(true)
      expect(vm.formState.name).toBe('王小明')
      expect(vm.formState.number).toBe(10)
    })
  })
})
