// AI
export type { AiControlBody, AiStatusResponse } from './ai'

// Analysis
export type { BatchDeleteAnalysisBody, PlayerAnalysisItem, PlayerStatistics, TrainingAnalysis } from './analysis'

// Auth
export type { LoginData, LoginRequest, LoginUser, RefreshData, RefreshRequest } from './auth'

// Pitches
export type { PitchDetail, PitchItem } from './pitches'

// Players
export type { CreatePlayerBody, PlayerItem, SortPlayersBody, UpdatePlayerBody } from './players'

// Teams
export type { CreateTeamBody, TeamItem, UpdateTeamBody } from './teams'

// Trainings
export type { BatchDeleteBody, CreateTrainingBody, TrainingDetail, TrainingItem, UpdateStrikeZoneBody } from './trainings'

// Shared API Response wrapper
export interface ApiResponse<T> {
  status: 'success'
  data: T
}

export interface ApiMessageResponse {
  status: 'success'
  message: string
}
