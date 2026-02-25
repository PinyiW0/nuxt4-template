// 統一 re-export + 共用回傳型別

export type { AiSystemStatus, StartAiBody } from './ai'
export type {
  BatchDeletePlayerAnalysisBody,
  HeatMapPoint,
  PlayerAnalysisItem,
  PlayerStatistics,
  TrainingAnalysis,
} from './analysis'
export type { LoginData, LoginRequest, LoginUser, RefreshData, RefreshRequest } from './auth'
export type { PitchDetail, PitchItem } from './pitches'
export type { CreatePlayerBody, PlayerItem, Position, SortPlayersBody, UpdatePlayerBody } from './players'
export type { CreateTeamBody, TeamItem, UpdateTeamBody } from './teams'
export type {
  AiStatus,
  BatchDeleteBody,
  CreateTrainingBody,
  TrainingDetail,
  TrainingItem,
  UpdateStrikeZoneBody,
} from './trainings'

// 共用回傳型別
export interface ApiResponse<T> {
  status: 'success'
  data: T
}

export interface ApiMessage {
  status: 'success'
  message: string
}
