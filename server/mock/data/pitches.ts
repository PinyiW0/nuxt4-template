// Mock 投球資料

export interface MockPitch {
  id: number
  training_id: number
  sequence: number
  time: string
  velocity: number
  spin_rate: number
  is_strike: boolean
  location_x: number
  location_y: number
  trajectory_data: Record<string, unknown>
  status: 'active' | 'deleted'
}

// 訓練 4（進行中，30 球）
function generatePitches(trainingId: number, count: number, baseTime: string, startId: number): MockPitch[] {
  const pitches: MockPitch[] = []
  for (let i = 0; i < count; i++) {
    const hour = 10
    const min = Math.floor(i / 2)
    const sec = (i % 2) * 30
    pitches.push({
      id: startId + i,
      training_id: trainingId,
      sequence: i + 1,
      time: `${baseTime}T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`,
      velocity: 120 + Math.round(Math.random() * 15 * 10) / 10,
      spin_rate: 2000 + Math.round(Math.random() * 500),
      is_strike: Math.random() > 0.4,
      location_x: Math.round((Math.random() * 0.8 - 0.4) * 100) / 100,
      location_y: Math.round((Math.random() * 1.2 + 0.2) * 100) / 100,
      trajectory_data: { type: 'fastball', break_x: 0.05, break_y: -0.15 },
      status: 'active',
    })
  }
  return pitches
}

export const mockPitches: MockPitch[] = [
  // 訓練 4（進行中，30 球）
  ...generatePitches(4, 30, '2026-02-26', 1),
  // 訓練 5（歷史，50 球）
  ...generatePitches(5, 50, '2026-02-20', 101),
  // 訓練 6（歷史，45 球）
  ...generatePitches(6, 45, '2026-02-18', 201),
  // 訓練 7（歷史，60 球）
  ...generatePitches(7, 60, '2026-02-15', 301),
]
