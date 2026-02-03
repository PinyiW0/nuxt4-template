import type { Pitch } from './types'

export const pitches: Pitch[] = [
  // 訓練 1 的投球紀錄 (50球)
  ...generatePitchesForTraining(1, 50, '2026-01-20T10:00:00'),
  // 訓練 2 的投球紀錄 (25球，進行中)
  ...generatePitchesForTraining(2, 25, `${new Date().toISOString().split('T')[0]}T10:00:00`),
  // 訓練 4 的投球紀錄 (30球)
  ...generatePitchesForTraining(4, 30, '2026-01-22T10:00:00'),
  // 訓練 6 的投球紀錄 (40球)
  ...generatePitchesForTraining(6, 40, '2026-01-23T14:00:00'),
]

let nextPitchId = pitches.length + 1

function generatePitchesForTraining(
  trainingId: number,
  count: number,
  startTime: string,
): Pitch[] {
  const result: Pitch[] = []
  const baseTime = new Date(startTime)

  for (let i = 1; i <= count; i++) {
    const pitchTime = new Date(baseTime.getTime() + i * 60000) // 每球間隔1分鐘
    const velocity = 120 + Math.random() * 20 // 120-140 km/h
    const spinRate = 2000 + Math.random() * 500 // 2000-2500 rpm
    const isStrike = Math.random() > 0.35 // 約65%好球率
    const locationX = (Math.random() - 0.5) * 0.8 // -0.4 ~ 0.4
    const locationY = 0.3 + Math.random() * 0.9 // 0.3 ~ 1.2

    result.push({
      id: trainingId * 1000 + i,
      training_id: trainingId,
      sequence: i,
      time: pitchTime.toISOString(),
      velocity: Math.round(velocity * 10) / 10,
      spin_rate: Math.round(spinRate),
      is_strike: isStrike,
      location_x: Math.round(locationX * 100) / 100,
      location_y: Math.round(locationY * 100) / 100,
      trajectory_data: generateTrajectoryData(),
      status: 'active',
      created_at: pitchTime.toISOString(),
    })
  }

  return result
}

function generateTrajectoryData(): Record<string, unknown> {
  // 生成模擬的3D軌跡數據
  const points = []
  for (let t = 0; t <= 1; t += 0.1) {
    points.push({
      t,
      x: Math.sin(t * Math.PI) * 0.2,
      y: 1.5 - t * 1.2,
      z: t * 18.44, // 投手丘到本壘距離
    })
  }
  return {
    points,
    release_point: { x: 0, y: 1.8, z: 0 },
    break_point: { x: 0.1, y: 0.9, z: 12 },
  }
}

export function getPitchesByTraining(trainingId: number): Pitch[] {
  return pitches
    .filter(p => p.training_id === trainingId && p.status === 'active')
    .sort((a, b) => a.sequence - b.sequence)
}

export function getPitchById(id: number): Pitch | undefined {
  return pitches.find(p => p.id === id && p.status === 'active')
}

export function getPitchByTrainingAndSequence(
  trainingId: number,
  sequence: number,
): Pitch | undefined {
  return pitches.find(
    p => p.training_id === trainingId && p.sequence === sequence && p.status === 'active',
  )
}

export function addPitch(trainingId: number): Pitch {
  const existingPitches = getPitchesByTraining(trainingId)
  const sequence = existingPitches.length + 1
  const now = new Date()

  const velocity = 120 + Math.random() * 20
  const spinRate = 2000 + Math.random() * 500
  const isStrike = Math.random() > 0.35
  const locationX = (Math.random() - 0.5) * 0.8
  const locationY = 0.3 + Math.random() * 0.9

  const pitch: Pitch = {
    id: nextPitchId++,
    training_id: trainingId,
    sequence,
    time: now.toISOString(),
    velocity: Math.round(velocity * 10) / 10,
    spin_rate: Math.round(spinRate),
    is_strike: isStrike,
    location_x: Math.round(locationX * 100) / 100,
    location_y: Math.round(locationY * 100) / 100,
    trajectory_data: generateTrajectoryData(),
    status: 'active',
    created_at: now.toISOString(),
  }

  pitches.push(pitch)
  return pitch
}

export function getTrainingStats(trainingId: number): {
  total_pitches: number
  strike_count: number
  ball_count: number
  strike_rate: number
  avg_velocity: number
  max_velocity: number
  min_velocity: number
  avg_spin_rate: number
} {
  const trainingPitches = getPitchesByTraining(trainingId)
  const total = trainingPitches.length

  if (total === 0) {
    return {
      total_pitches: 0,
      strike_count: 0,
      ball_count: 0,
      strike_rate: 0,
      avg_velocity: 0,
      max_velocity: 0,
      min_velocity: 0,
      avg_spin_rate: 0,
    }
  }

  const strikes = trainingPitches.filter(p => p.is_strike).length
  const balls = total - strikes
  const velocities = trainingPitches.map(p => p.velocity)
  const avgVelocity = velocities.reduce((sum, v) => sum + v, 0) / total
  const maxVelocity = Math.max(...velocities)
  const minVelocity = Math.min(...velocities)
  const avgSpinRate = trainingPitches.reduce((sum, p) => sum + p.spin_rate, 0) / total

  return {
    total_pitches: total,
    strike_count: strikes,
    ball_count: balls,
    strike_rate: Math.round((strikes / total) * 1000) / 10,
    avg_velocity: Math.round(avgVelocity * 100) / 100,
    max_velocity: Math.round(maxVelocity * 100) / 100,
    min_velocity: Math.round(minVelocity * 100) / 100,
    avg_spin_rate: Math.round(avgSpinRate),
  }
}
