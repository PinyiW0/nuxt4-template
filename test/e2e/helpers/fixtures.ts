// 從 _common.flow.md 和 feature Background 提取的測試資料

export const TestUsers = {
  admin: { account: 'admin', password: 'pass123', role: '管理者' },
  coach: { account: 'coach1', password: 'pass123', role: '教練' },
  coach2: { account: 'coach2', password: 'pass123', role: '教練' },
  locked: { account: 'locked1', password: 'pass123', role: '教練' },
} as const

export const Routes = {
  analysis: '/analysis',
  home: '/',
  login: '/login',
  players: '/players',
  teams: '/teams',
  trainingHistory: '/trainings/history',
  trainings: '/trainings',
} as const
