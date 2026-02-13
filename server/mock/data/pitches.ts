import type { MockPitch } from './types'

// 訓練 1 的 5 筆投球（feature 23 分析數據：avg 127.58, max 130.1, min 125.5, 3好球 2壞球, avg spin 2232）
// 訓練 2 的 5 筆投球
// 訓練 4 的 8 筆投球（coach2）

export const mockPitches: MockPitch[] = [
  // --- 訓練 1（王小明, 2025-06-01）---
  { id: 1, training_id: 1, sequence: 1, time: '2025-06-01T10:00:00Z', velocity: 130.1, spin_rate: 2300, is_strike: true, location_x: 0.1, location_y: 0.6, trajectory_data: {}, status: 'active' },
  { id: 2, training_id: 1, sequence: 2, time: '2025-06-01T10:01:00Z', velocity: 128.5, spin_rate: 2200, is_strike: true, location_x: -0.15, location_y: 0.5, trajectory_data: {}, status: 'active' },
  { id: 3, training_id: 1, sequence: 3, time: '2025-06-01T10:02:00Z', velocity: 125.5, spin_rate: 2100, is_strike: false, location_x: 0.3, location_y: 0.8, trajectory_data: {}, status: 'active' },
  { id: 4, training_id: 1, sequence: 4, time: '2025-06-01T10:03:00Z', velocity: 127.3, spin_rate: 2250, is_strike: true, location_x: -0.05, location_y: 0.55, trajectory_data: {}, status: 'active' },
  { id: 5, training_id: 1, sequence: 5, time: '2025-06-01T10:04:00Z', velocity: 126.5, spin_rate: 2310, is_strike: false, location_x: -0.4, location_y: 0.3, trajectory_data: {}, status: 'active' },

  // --- 訓練 2（王小明, 2025-06-15）---
  { id: 6, training_id: 2, sequence: 1, time: '2025-06-15T10:00:00Z', velocity: 129.0, spin_rate: 2250, is_strike: true, location_x: 0.05, location_y: 0.5, trajectory_data: {}, status: 'active' },
  { id: 7, training_id: 2, sequence: 2, time: '2025-06-15T10:01:00Z', velocity: 126.8, spin_rate: 2180, is_strike: false, location_x: 0.35, location_y: 0.7, trajectory_data: {}, status: 'active' },
  { id: 8, training_id: 2, sequence: 3, time: '2025-06-15T10:02:00Z', velocity: 131.2, spin_rate: 2350, is_strike: true, location_x: -0.1, location_y: 0.55, trajectory_data: {}, status: 'active' },
  { id: 9, training_id: 2, sequence: 4, time: '2025-06-15T10:03:00Z', velocity: 127.5, spin_rate: 2200, is_strike: true, location_x: 0.15, location_y: 0.45, trajectory_data: {}, status: 'active' },
  { id: 10, training_id: 2, sequence: 5, time: '2025-06-15T10:04:00Z', velocity: 125.0, spin_rate: 2150, is_strike: false, location_x: -0.3, location_y: 0.85, trajectory_data: {}, status: 'active' },

  // --- 訓練 4（張三, 2025-07-01）---
  { id: 11, training_id: 4, sequence: 1, time: '2025-07-01T10:00:00Z', velocity: 125.0, spin_rate: 2100, is_strike: true, location_x: 0.0, location_y: 0.5, trajectory_data: {}, status: 'active' },
  { id: 12, training_id: 4, sequence: 2, time: '2025-07-01T10:01:00Z', velocity: 123.5, spin_rate: 2050, is_strike: false, location_x: 0.4, location_y: 0.75, trajectory_data: {}, status: 'active' },
  { id: 13, training_id: 4, sequence: 3, time: '2025-07-01T10:02:00Z', velocity: 127.8, spin_rate: 2200, is_strike: true, location_x: -0.1, location_y: 0.55, trajectory_data: {}, status: 'active' },
  { id: 14, training_id: 4, sequence: 4, time: '2025-07-01T10:03:00Z', velocity: 124.2, spin_rate: 2150, is_strike: true, location_x: 0.15, location_y: 0.45, trajectory_data: {}, status: 'active' },
  { id: 15, training_id: 4, sequence: 5, time: '2025-07-01T10:04:00Z', velocity: 126.0, spin_rate: 2180, is_strike: false, location_x: -0.35, location_y: 0.8, trajectory_data: {}, status: 'active' },
  { id: 16, training_id: 4, sequence: 6, time: '2025-07-01T10:05:00Z', velocity: 128.3, spin_rate: 2250, is_strike: true, location_x: 0.05, location_y: 0.5, trajectory_data: {}, status: 'active' },
  { id: 17, training_id: 4, sequence: 7, time: '2025-07-01T10:06:00Z', velocity: 122.0, spin_rate: 2000, is_strike: false, location_x: -0.45, location_y: 0.35, trajectory_data: {}, status: 'active' },
  { id: 18, training_id: 4, sequence: 8, time: '2025-07-01T10:07:00Z', velocity: 129.5, spin_rate: 2300, is_strike: true, location_x: 0.1, location_y: 0.6, trajectory_data: {}, status: 'active' },
]
