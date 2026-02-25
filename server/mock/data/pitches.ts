import type { MockPitch } from './types'

// 訓練 4 (2026-02-24, 王小明, 45 球) 的投球資料
const trainingFourPitches: MockPitch[] = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  training_id: 4,
  sequence: i + 1,
  time: `2026-02-24T09:${String(Math.floor(i / 2) + 1).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`,
  velocity: 120 + Math.round(Math.random() * 150) / 10,
  spin_rate: 2000 + Math.round(Math.random() * 500),
  is_strike: Math.random() > 0.4,
  location_x: Math.round((Math.random() * 0.8 - 0.4) * 100) / 100,
  location_y: Math.round((Math.random() * 1.2 + 0.2) * 100) / 100,
  trajectory_data: { points: [[0, 0, 18.44], [0, 0.5, 12], [0, 1, 6], [0, 1.2, 0]] },
  status: 'active' as const,
}))

// 訓練 6 (2026-02-15, 王小明, 50 球) 的投球資料
const trainingSixPitches: MockPitch[] = Array.from({ length: 50 }, (_, i) => ({
  id: 100 + i + 1,
  training_id: 6,
  sequence: i + 1,
  time: `2026-02-15T09:${String(Math.floor(i / 2) + 1).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`,
  velocity: 118 + Math.round(Math.random() * 160) / 10,
  spin_rate: 1950 + Math.round(Math.random() * 550),
  is_strike: Math.random() > 0.38,
  location_x: Math.round((Math.random() * 0.8 - 0.4) * 100) / 100,
  location_y: Math.round((Math.random() * 1.2 + 0.2) * 100) / 100,
  trajectory_data: { points: [[0, 0, 18.44], [0, 0.5, 12], [0, 1, 6], [0, 1.2, 0]] },
  status: 'active' as const,
}))

export const mockPitches: MockPitch[] = [
  ...trainingFourPitches,
  ...trainingSixPitches,
]
