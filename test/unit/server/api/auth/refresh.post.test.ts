import { beforeEach, describe, expect, it, vi } from 'vitest'

const handler = (await import('~/server/api/auth/refresh.post')).default

describe('post /api/auth/refresh', () => {
  beforeEach(() => {
    vi.mocked(readBody).mockReset()
  })

  it('缺少 refresh_token 時回傳 400', async () => {
    vi.mocked(readBody).mockResolvedValue({})

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 400,
      message: '缺少 refresh token',
    })
  })

  it('無效的 refresh_token 回傳 401', async () => {
    vi.mocked(readBody).mockResolvedValue({ refresh_token: 'invalid-token' })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 401,
      message: 'refresh token 無效',
    })
  })

  it('成功刷新 token', async () => {
    vi.mocked(readBody).mockResolvedValue({ refresh_token: 'mock-refresh-123' })

    const result = await handler({} as any)

    expect(result.status).toBe('success')
    expect(result.data.access_token).toContain('mock-token-refreshed')
    expect(result.data.refresh_token).toContain('mock-refresh-refreshed')
  })
})
