import type { PlayerAnalysisItem, PlayerStatistics } from '../../../app/types/api/analysis'

// 選手分析列表 mock 資料（feature 24-25）
// coach1 看到 2 筆（藍鷹隊），admin 看到 3 筆（全部）
export const mockPlayerAnalysis: (PlayerAnalysisItem & { team_id: number })[] = [
  {
    id: 1,
    player_id: 1,
    name: '王小明',
    number: 1,
    team_name: '藍鷹隊',
    team_id: 1,
    training_count: 5,
    total_pitches: 50,
    last_training_date: '2025-06-15',
    avg_velocity: 118.5,
  },
  {
    id: 2,
    player_id: 2,
    name: '李大華',
    number: 2,
    team_name: '藍鷹隊',
    team_id: 1,
    training_count: 3,
    total_pitches: 30,
    last_training_date: '2025-05-20',
    avg_velocity: 115.2,
  },
  {
    id: 3,
    player_id: 3,
    name: '張三',
    number: 10,
    team_name: '紅虎隊',
    team_id: 2,
    training_count: 4,
    total_pitches: 40,
    last_training_date: '2025-07-01',
    avg_velocity: 125.8,
  },
]

// 選手統計 mock 資料（feature 26）
export const mockPlayerStatistics: Record<number, PlayerStatistics> = {
  // 王小明：有完整統計
  1: {
    player_id: 1,
    period: '2025-06-01 至今',
    avg_velocity: 118.5,
    avg_spin_rate: 2180,
    strike_rate: 62,
    total_pitches: 150,
    heat_map_data: [
      { x: 0.1, y: 0.5, density: 0.8 },
      { x: -0.1, y: 0.55, density: 0.6 },
      { x: 0.0, y: 0.6, density: 0.9 },
      { x: 0.15, y: 0.45, density: 0.5 },
      { x: -0.2, y: 0.5, density: 0.4 },
    ],
  },
  // 李大華：無投球數據
  2: {
    player_id: 2,
    period: '',
    avg_velocity: null,
    avg_spin_rate: null,
    strike_rate: null,
    total_pitches: 0,
    heat_map_data: null,
  },
  // 張三：有部分統計
  3: {
    player_id: 3,
    period: '2025-07-01 至今',
    avg_velocity: 125.8,
    avg_spin_rate: 2150,
    strike_rate: 58,
    total_pitches: 40,
    heat_map_data: [
      { x: 0.0, y: 0.5, density: 0.7 },
      { x: 0.1, y: 0.6, density: 0.5 },
    ],
  },
}
