import type { MockPlayerAnalysis } from './types'

export const mockPlayerAnalysis: MockPlayerAnalysis[] = [
  // 藍鷹隊 (team_id: 1)
  { player_id: 1, training_count: 10, total_pitches: 500, last_training_date: '2026-02-24', avg_velocity: 128.5, avg_spin_rate: 2200, strike_rate: 62 },
  { player_id: 2, training_count: 8, total_pitches: 400, last_training_date: '2026-02-20', avg_velocity: 125.3, avg_spin_rate: 2150, strike_rate: 58 },
  { player_id: 3, training_count: 6, total_pitches: 280, last_training_date: '2026-02-10', avg_velocity: 122.8, avg_spin_rate: 2050, strike_rate: 55 },
  { player_id: 4, training_count: 4, total_pitches: 180, last_training_date: '2026-02-08', avg_velocity: 119.2, avg_spin_rate: 1980, strike_rate: 60 },
  { player_id: 5, training_count: 3, total_pitches: 120, last_training_date: '2026-02-01', avg_velocity: 115.6, avg_spin_rate: 1900, strike_rate: 52 },
  // 紅龍隊 (team_id: 2)
  { player_id: 6, training_count: 7, total_pitches: 350, last_training_date: '2026-02-18', avg_velocity: 126.1, avg_spin_rate: 2180, strike_rate: 61 },
  { player_id: 7, training_count: 9, total_pitches: 450, last_training_date: '2026-02-22', avg_velocity: 130.2, avg_spin_rate: 2300, strike_rate: 65 },
  { player_id: 8, training_count: 5, total_pitches: 220, last_training_date: '2026-02-12', avg_velocity: 121.5, avg_spin_rate: 2020, strike_rate: 57 },
  // 白虎隊 (team_id: 3)
  { player_id: 9, training_count: 5, total_pitches: 250, last_training_date: '2026-02-22', avg_velocity: 130.2, avg_spin_rate: 2280, strike_rate: 63 },
  { player_id: 10, training_count: 4, total_pitches: 200, last_training_date: '2026-02-19', avg_velocity: 132.1, avg_spin_rate: 2350, strike_rate: 59 },
  { player_id: 11, training_count: 3, total_pitches: 150, last_training_date: '2026-02-14', avg_velocity: 118.7, avg_spin_rate: 1950, strike_rate: 54 },
  { player_id: 12, training_count: 2, total_pitches: 80, last_training_date: '2026-02-06', avg_velocity: 114.3, avg_spin_rate: 1880, strike_rate: 50 },
]
