import type { MockUser } from './types'

export const mockUsers: MockUser[] = [
  {
    id: 1,
    account: 'admin',
    password: 'pass123',
    role: '管理者',
    status: 'active',
    failed_attempts: 0,
    locked_until: null,
  },
  {
    id: 2,
    account: 'coach1',
    password: 'pass123',
    role: '教練',
    status: 'active',
    failed_attempts: 0,
    locked_until: null,
  },
  {
    id: 3,
    account: 'coach2',
    password: 'pass123',
    role: '教練',
    status: 'active',
    failed_attempts: 0,
    locked_until: null,
  },
  {
    id: 4,
    account: 'locked1',
    password: 'pass123',
    role: '教練',
    status: 'active',
    failed_attempts: 5,
    locked_until: '2099-12-31T00:00:00Z',
  },
]
