import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import TrainingAnalysisPage from '~/pages/trainings/[id]/analysis.vue'

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

registerEndpoint('/api/trainings/1/analysis', () => ({
  data: {
    total_pitches: 30,
    strike_count: 18,
    ball_count: 12,
    strike_rate: 0.6,
    avg_velocity: 135.5,
    max_velocity: 142.0,
    min_velocity: 128.0,
    avg_spin_rate: 2200,
    heat_map_data: {
      zones: [
        { x: 0, y: 1.0, density: 0.9 },
        { x: 0.1, y: 0.8, density: 0.5 },
        { x: -0.1, y: 0.6, density: 0.3 },
      ],
    },
  },
}))

describe('trainingAnalysisPage', () => {
  describe('getHeatColor', () => {
    it('density >= 0.8 應回傳 error 色', async () => {
      const wrapper = await mountSuspended(TrainingAnalysisPage, {
        route: { params: { id: '1' } },
      })
      const vm = wrapper.vm as any

      expect(vm.getHeatColor(0.8)).toBe('bg-error-500/80')
      expect(vm.getHeatColor(1.0)).toBe('bg-error-500/80')
    })

    it('density >= 0.6 應回傳 warning 色', async () => {
      const wrapper = await mountSuspended(TrainingAnalysisPage, {
        route: { params: { id: '1' } },
      })
      const vm = wrapper.vm as any

      expect(vm.getHeatColor(0.6)).toBe('bg-warning-500/70')
      expect(vm.getHeatColor(0.79)).toBe('bg-warning-500/70')
    })

    it('density >= 0.4 應回傳淺 warning 色', async () => {
      const wrapper = await mountSuspended(TrainingAnalysisPage, {
        route: { params: { id: '1' } },
      })
      const vm = wrapper.vm as any

      expect(vm.getHeatColor(0.4)).toBe('bg-warning-400/50')
      expect(vm.getHeatColor(0.59)).toBe('bg-warning-400/50')
    })

    it('density < 0.4 應回傳 success 色', async () => {
      const wrapper = await mountSuspended(TrainingAnalysisPage, {
        route: { params: { id: '1' } },
      })
      const vm = wrapper.vm as any

      expect(vm.getHeatColor(0.1)).toBe('bg-success-500/30')
      expect(vm.getHeatColor(0.39)).toBe('bg-success-500/30')
    })
  })

  describe('getPosition', () => {
    it('應將座標正確映射為百分比', async () => {
      const wrapper = await mountSuspended(TrainingAnalysisPage, {
        route: { params: { id: '1' } },
      })
      const vm = wrapper.vm as any

      // x=0 (本壘板中心) → left=50%
      const center = vm.getPosition(0, 0.85)
      expect(center.left).toBeCloseTo(50, 0)

      // x=-0.215 (最左) → left≈0%
      const left = vm.getPosition(-0.215, 0.85)
      expect(left.left).toBeCloseTo(0, 0)

      // x=0.215 (最右) → left≈100%
      const right = vm.getPosition(0.215, 0.85)
      expect(right.left).toBeCloseTo(100, 0)
    })
  })

  describe('heatZones', () => {
    it('應從 analysis 資料解析熱區', async () => {
      const wrapper = await mountSuspended(TrainingAnalysisPage, {
        route: { params: { id: '1' } },
      })
      const vm = wrapper.vm as any

      expect(vm.heatZones).toHaveLength(3)
      expect(vm.heatZones[0].density).toBe(0.9)
    })
  })
})
