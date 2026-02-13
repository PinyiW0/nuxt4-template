import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import TrainingDetailPage from '~/pages/trainings/[id]/index.vue'

// 註冊 mock API 端點
registerEndpoint('/api/trainings/1', () => ({
  data: {
    id: 1,
    date: '2024-01-15',
    player_name: '王小明',
    team_name: '紅龍',
    strike_zone_top: 120,
    strike_zone_bottom: 50,
    pitch_count: 5,
    ai_status: 'stopped',
  },
}))

registerEndpoint('/api/trainings/1/pitches', () => ({
  data: [
    { id: 1, sequence: 1, time: '2024-01-15T10:00:00Z', velocity: 135, spin_rate: 2200, is_strike: true },
    { id: 2, sequence: 2, time: '2024-01-15T10:01:00Z', velocity: 130, spin_rate: 2100, is_strike: false },
    { id: 3, sequence: 3, time: '2024-01-15T10:02:00Z', velocity: 140, spin_rate: 2300, is_strike: true },
    { id: 4, sequence: 4, time: '2024-01-15T10:03:00Z', velocity: 128, spin_rate: 2000, is_strike: false },
    { id: 5, sequence: 5, time: '2024-01-15T10:04:00Z', velocity: 132, spin_rate: 2150, is_strike: true },
  ],
}))

describe('trainingDetailPage', () => {
  describe('stats computed', () => {
    it('應計算正確的投球統計', async () => {
      const wrapper = await mountSuspended(TrainingDetailPage, {
        route: { params: { id: '1' } },
      })
      const vm = wrapper.vm as any

      expect(vm.stats).not.toBeNull()
      expect(vm.stats.total).toBe(5)
      expect(vm.stats.strikes).toBe(3)
      expect(vm.stats.balls).toBe(2)
      expect(vm.stats.strikeRate).toBe('60.0')
    })

    it('應計算正確的平均球速', async () => {
      const wrapper = await mountSuspended(TrainingDetailPage, {
        route: { params: { id: '1' } },
      })
      const vm = wrapper.vm as any

      // (135+130+140+128+132) / 5 = 133.0
      expect(vm.stats.avgVelocity).toBe('133.0')
    })
  })

  describe('formatTime', () => {
    it('應格式化時間字串', async () => {
      const wrapper = await mountSuspended(TrainingDetailPage, {
        route: { params: { id: '1' } },
      })
      const vm = wrapper.vm as any

      const result = vm.formatTime('2024-01-15T10:30:45Z')
      // 格式化結果取決於時區，只驗證包含數字即可
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/)
    })
  })
})
