import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import PlayerStatisticsPage from '~/pages/analysis/[id].vue'

// 註冊 mock API 端點
registerEndpoint('/api/players/1/statistics', () => ({
  data: {
    id: 1,
    name: '王小明',
    number: 10,
    team_name: '紅龍',
    total_pitches: 100,
    avg_velocity: 135.5,
    avg_spin_rate: 2200,
    strike_rate: 0.6,
    heat_map_data: {
      zones: [
        { x: 0, y: 1.0, density: 0.9 },
        { x: 0.1, y: 0.8, density: 0.3 },
      ],
    },
  },
}))

describe('playerStatisticsPage', () => {
  describe('getHeatColor', () => {
    it('density >= 0.8 應回傳 error 色', async () => {
      const wrapper = await mountSuspended(PlayerStatisticsPage, {
        route: { params: { id: '1' } },
      })
      const vm = wrapper.vm as any

      expect(vm.getHeatColor(0.8)).toBe('bg-error-500/80')
    })

    it('density < 0.4 應回傳 success 色', async () => {
      const wrapper = await mountSuspended(PlayerStatisticsPage, {
        route: { params: { id: '1' } },
      })
      const vm = wrapper.vm as any

      expect(vm.getHeatColor(0.2)).toBe('bg-success-500/30')
    })
  })

  describe('getPosition', () => {
    it('應將座標正確映射為百分比（使用固定好球帶）', async () => {
      const wrapper = await mountSuspended(PlayerStatisticsPage, {
        route: { params: { id: '1' } },
      })
      const vm = wrapper.vm as any

      // x=0 (中心) → left=50%
      const center = vm.getPosition(0, 0.85)
      expect(center.left).toBeCloseTo(50, 0)
    })
  })

  describe('heatZones', () => {
    it('應從 stats 資料解析熱區', async () => {
      const wrapper = await mountSuspended(PlayerStatisticsPage, {
        route: { params: { id: '1' } },
      })
      const vm = wrapper.vm as any

      expect(vm.heatZones).toHaveLength(2)
    })
  })
})
