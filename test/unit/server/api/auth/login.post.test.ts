import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockUsers } from '~/server/mock/data/users'

const handler = (await import('~/server/api/auth/login.post')).default

describe('post /api/auth/login', () => {
  beforeEach(() => {
    vi.mocked(readBody).mockReset()
    // 重置用戶狀態
    mockUsers.forEach((u) => {
      if (u.account === 'locked1') {
        u.failed_attempts = 5
        u.locked_until = '2099-12-31T23:59:59'
      }
      else if (u.account === 'nearlock1') {
        u.failed_attempts = 4
        u.locked_until = null
      }
      else {
        u.failed_attempts = 0
        u.locked_until = null
      }
    })
  })

  it('缺少帳號或密碼時回傳 400', async () => {
    vi.mocked(readBody).mockResolvedValue({ account: '', password: '' })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 400,
      message: '請輸入帳號和密碼',
    })
  })

  it('帳號不存在時回傳 401', async () => {
    vi.mocked(readBody).mockResolvedValue({ account: 'unknown', password: 'pass123' })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 401,
      message: '帳號或密碼錯誤',
    })
  })

  it('帳號鎖定中回傳 423', async () => {
    vi.mocked(readBody).mockResolvedValue({ account: 'locked1', password: 'pass123' })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 423,
      message: '帳號已鎖定，請稍後再試',
    })
  })

  it('鎖定過期後重置並可登入', async () => {
    const user = mockUsers.find(u => u.account === 'locked1')!
    user.locked_until = '2020-01-01T00:00:00'

    vi.mocked(readBody).mockResolvedValue({ account: 'locked1', password: 'pass123' })

    const result = await handler({} as any)
    expect(result.status).toBe('success')
    expect(result.data.user.account).toBe('locked1')
    expect(user.failed_attempts).toBe(0)
    expect(user.locked_until).toBeNull()
  })

  it('密碼錯誤時回傳 401 並累計失敗次數', async () => {
    vi.mocked(readBody).mockResolvedValue({ account: 'coach1', password: 'wrong' })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 401,
      message: '帳號或密碼錯誤',
    })

    const user = mockUsers.find(u => u.account === 'coach1')!
    expect(user.failed_attempts).toBe(1)
  })

  it('第 5 次失敗時鎖定帳號並回傳 423', async () => {
    vi.mocked(readBody).mockResolvedValue({ account: 'nearlock1', password: 'wrong' })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 423,
      message: '帳號已鎖定，請 15 分鐘後再試',
    })

    const user = mockUsers.find(u => u.account === 'nearlock1')!
    expect(user.failed_attempts).toBe(5)
    expect(user.locked_until).not.toBeNull()
  })

  it('登入成功回傳 token 和用戶資訊', async () => {
    vi.mocked(readBody).mockResolvedValue({ account: 'admin', password: 'pass123' })

    const result = await handler({} as any)

    expect(result.status).toBe('success')
    expect(result.data.access_token).toContain('mock-token-1')
    expect(result.data.refresh_token).toContain('mock-refresh-1')
    expect(result.data.user).toEqual({
      id: 1,
      account: 'admin',
      role: '管理者',
    })
  })

  it('登入成功後重置失敗次數', async () => {
    const user = mockUsers.find(u => u.account === 'coach1')!
    user.failed_attempts = 3

    vi.mocked(readBody).mockResolvedValue({ account: 'coach1', password: 'pass123' })

    await handler({} as any)

    expect(user.failed_attempts).toBe(0)
    expect(user.locked_until).toBeNull()
  })
})
