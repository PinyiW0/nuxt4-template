// Mock 使用者資料

export interface MockUser {
  id: number
  account: string
  password: string
  role: string
  status: 'active' | 'locked'
  failed_attempts: number
  locked_until: string | null
}

export const mockUsers: MockUser[] = [
  { id: 1, account: 'admin', password: 'admin123', role: '管理者', status: 'active', failed_attempts: 0, locked_until: null },
  { id: 2, account: 'coach1', password: 'coach123', role: '教練', status: 'active', failed_attempts: 0, locked_until: null },
  { id: 3, account: 'locked1', password: 'locked123', role: '教練', status: 'active', failed_attempts: 5, locked_until: '2026-03-01T12:00:00' },
]
