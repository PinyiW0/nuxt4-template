import { describe, expect, it } from 'vitest'

const handler = (await import('~/server/api/auth/logout.post')).default

describe('post /api/auth/logout', () => {
  it('回傳登出成功', () => {
    const result = handler()

    expect(result.status).toBe('success')
    expect(result.message).toBe('登出成功')
  })
})
