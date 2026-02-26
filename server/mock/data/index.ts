// Mock 資料統一 re-export

// --- Reset 機制（E2E 測試用）---

import { mockPitches } from './pitches'
import { mockPlayers } from './players'
import { mockTeams } from './teams'
import { mockTrainings } from './trainings'
import { mockUsers } from './users'

export { mockPitches } from './pitches'
export type { MockPitch } from './pitches'

export { getNextPlayerId, mockPlayers } from './players'
export type { MockPlayer } from './players'

export { getNextTeamId, mockTeams } from './teams'
export type { MockTeam } from './teams'

export { getNextTrainingId, mockTrainings } from './trainings'
export type { MockTraining } from './trainings'

export { mockUsers } from './users'
export type { MockUser } from './users'

// 保存初始快照（深拷貝）
const initialUsers = structuredClone(mockUsers)
const initialTeams = structuredClone(mockTeams)
const initialPlayers = structuredClone(mockPlayers)
const initialTrainings = structuredClone(mockTrainings)
const initialPitches = structuredClone(mockPitches)

/** 重設所有 mock 資料為初始值（E2E beforeEach 呼叫） */
export function resetMockData() {
  mockUsers.splice(0, mockUsers.length, ...structuredClone(initialUsers))
  mockTeams.splice(0, mockTeams.length, ...structuredClone(initialTeams))
  mockPlayers.splice(0, mockPlayers.length, ...structuredClone(initialPlayers))
  mockTrainings.splice(0, mockTrainings.length, ...structuredClone(initialTrainings))
  mockPitches.splice(0, mockPitches.length, ...structuredClone(initialPitches))
}
