import { beforeEach, describe, expect, it, vi } from 'vitest'

const handler = (await import('~/server/api/trainings/[id].get')).default

describe('get /api/trainings/:id', () => {
  beforeEach(() => {
    vi.mocked(getRouterParam).mockReset()
  })

  it('訓練不存在時回傳 404', () => {
    vi.mocked(getRouterParam).mockReturnValue('999')

    expect(() => handler({} as any)).toThrow()
  })

  it('成功回傳訓練詳情', () => {
    vi.mocked(getRouterParam).mockReturnValue('1')

    const result = handler({} as any)

    expect(result.status).toBe('success')
    expect(result.data.id).toBe(1)
    expect(result.data.player_name).toBe('王小明')
  })
})
