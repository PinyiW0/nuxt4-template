import type { User } from './types'

export const users: User[] = [
  {
    id: 1,
    account: 'admin',
    password: 'admin123',
    role: '管理者',
    status: 'active',
    failed_attempts: 0,
    locked_until: null,
    created_at: '2025-01-01T00:00:00',
  },
  {
    id: 2,
    account: 'user',
    password: 'user123',
    role: '教練',
    status: 'active',
    failed_attempts: 0,
    locked_until: null,
    created_at: '2025-01-01T00:00:00',
  },
  {
    id: 3,
    account: 'coach1',
    password: 'pass123',
    role: '教練',
    status: 'active',
    failed_attempts: 0,
    locked_until: null,
    created_at: '2025-06-01T00:00:00',
  },
  {
    id: 4,
    account: 'coach2',
    password: 'pass123',
    role: '教練',
    status: 'active',
    failed_attempts: 0,
    locked_until: null,
    created_at: '2025-06-01T00:00:00',
  },
  {
    id: 5,
    account: 'locked1',
    password: 'pass123',
    role: '教練',
    status: 'active',
    failed_attempts: 5,
    locked_until: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    created_at: '2025-06-01T00:00:00',
  },
]

export function findUserByAccount(account: string): User | undefined {
  return users.find(u => u.account === account && u.status === 'active')
}

export function isUserLocked(user: User): boolean {
  if (!user.locked_until)
    return false
  return new Date(user.locked_until) > new Date()
}
