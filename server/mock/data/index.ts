import { mockPitches } from './pitches'
import { mockPlayerAnalysis, mockPlayerStatistics } from './playerAnalysis'
import { mockPlayers } from './players'
import { mockTeams } from './teams'
import { mockTrainings } from './trainings'
import { mockUsers } from './users'

export { mockPitches } from './pitches'
export { mockPlayerAnalysis, mockPlayerStatistics } from './playerAnalysis'
export { mockPlayers } from './players'
export { mockTeams } from './teams'
export { mockTrainings } from './trainings'
export { mockUsers } from './users'

// 儲存初始狀態（模組載入時深拷貝一次）
const initialUsers = structuredClone(mockUsers)
const initialTeams = structuredClone(mockTeams)
const initialPlayers = structuredClone(mockPlayers)
const initialTrainings = structuredClone(mockTrainings)
const initialPitches = structuredClone(mockPitches)
const initialPlayerAnalysis = structuredClone(mockPlayerAnalysis)
const initialPlayerStatistics = structuredClone(mockPlayerStatistics)

/** 重設所有 mock 資料為初始值（E2E test.beforeEach 用） */
export function resetMockData() {
  // 陣列：清空後填入初始資料的深拷貝
  mockUsers.length = 0
  mockUsers.push(...structuredClone(initialUsers))

  mockTeams.length = 0
  mockTeams.push(...structuredClone(initialTeams))

  mockPlayers.length = 0
  mockPlayers.push(...structuredClone(initialPlayers))

  mockTrainings.length = 0
  mockTrainings.push(...structuredClone(initialTrainings))

  mockPitches.length = 0
  mockPitches.push(...structuredClone(initialPitches))

  mockPlayerAnalysis.length = 0
  mockPlayerAnalysis.push(...structuredClone(initialPlayerAnalysis))

  // Record 物件：刪除所有 key 後重新填入
  for (const key of Object.keys(mockPlayerStatistics)) {
    delete mockPlayerStatistics[Number(key)]
  }
  Object.assign(mockPlayerStatistics, structuredClone(initialPlayerStatistics))
}
