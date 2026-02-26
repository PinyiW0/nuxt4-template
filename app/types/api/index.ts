// API 型別統一 re-export

// 共用回傳型別
export interface ApiResponse<T> {
  status: 'success'
  data: T
}

export interface ApiMessage {
  status: 'success'
  message: string
}

// Analysis
export type {
  BatchDeletePlayersAnalysisBody,
  HeatMapPoint,
  PlayerAnalyticsItem,
  PlayerStatsData,
  TrainingAnalysis,
} from './analysis'

// Auth
export type { LoginData, LoginRequest, LoginUser, RefreshData, RefreshRequest } from './auth'

// Pitches
export type { PitchDetail, PitchItem } from './pitches'

// Players
export type { CreatePlayerBody, PlayerItem, Position, SortPlayersBody, UpdatePlayerBody } from './players'

// Teams
export type { CreateTeamBody, TeamItem, UpdateTeamBody } from './teams'

// Trainings
export type { BatchDeleteBody, CreateTrainingBody, TrainingDetail, TrainingItem, UpdateStrikeZoneBody } from './trainings'
