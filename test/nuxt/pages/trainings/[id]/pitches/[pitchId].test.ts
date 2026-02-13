import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import PitchDetailPage from '~/pages/trainings/[id]/pitches/[pitchId].vue'

// 註冊 mock API 端點
registerEndpoint('/api/trainings/1', () => ({
  data: {
    id: 1,
    date: '2024-01-15',
    player_name: '王小明',
    team_name: '紅龍',
    strike_zone_top: 120,
    strike_zone_bottom: 50,
    pitch_count: 30,
    ai_status: 'stopped',
  },
}))

registerEndpoint('/api/trainings/1/pitches/1', () => ({
  data: {
    id: 1,
    sequence: 1,
    time: '2024-01-15T10:00:00Z',
    velocity: 135,
    spin_rate: 2200,
    is_strike: true,
    location_x: 0.05,
    location_y: 0.9,
    trajectory_data: {
      points: [
        { x: 0, y: 1.8, z: 0 },
        { x: 0.02, y: 1.5, z: 6 },
        { x: 0.04, y: 1.2, z: 12 },
        { x: 0.05, y: 0.9, z: 18.44 },
      ],
    },
  },
}))

describe('pitchDetailPage', () => {
  describe('trajectoryPoints', () => {
    it('應從 pitch 資料解析軌跡點', async () => {
      const wrapper = await mountSuspended(PitchDetailPage, {
        route: { params: { id: '1', pitchId: '1' } },
      })
      const vm = wrapper.vm as any

      expect(vm.trajectoryPoints).toHaveLength(4)
      expect(vm.trajectoryPoints[0]).toMatchObject({ x: 0, y: 1.8, z: 0 })
    })
  })

  describe('視圖切換', () => {
    it('預設應為九宮格視圖', async () => {
      const wrapper = await mountSuspended(PitchDetailPage, {
        route: { params: { id: '1', pitchId: '1' } },
      })
      const vm = wrapper.vm as any

      expect(vm.activeTab).toBe('grid')
    })

    it('切換到軌跡視圖', async () => {
      const wrapper = await mountSuspended(PitchDetailPage, {
        route: { params: { id: '1', pitchId: '1' } },
      })
      const vm = wrapper.vm as any

      vm.activeTab = 'trajectory'
      await wrapper.vm.$nextTick()

      expect(vm.activeTab).toBe('trajectory')
    })
  })
})
