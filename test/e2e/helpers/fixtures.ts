// 測試帳號（與 server/mock/data/users.ts 一致）
export const TestUsers = {
  admin: { account: 'admin', password: 'admin123', role: '管理者' },
  coach: { account: 'coach1', password: 'coach123', role: '教練' },
  locked: { account: 'locked1', password: 'locked123', role: '教練' },
} as const

// 頁面路由（與 _common.flow.md 一致）
export const Routes = {
  analysis: '/analytics',
  home: '/',
  login: '/login',
  players: '/players',
  teams: '/teams',
  trainingHistory: '/history',
} as const
