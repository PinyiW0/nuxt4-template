import { beforeEach, describe, expect, it, vi } from 'vitest'

const handler = (await import('~/server/api/players/[id]/statistics.get')).default

describe('get /api/players/:id/statistics', () => {
  beforeEach(() => {
    vi.mocked(getRouterParam).mockReset()
  })

  it('統計不存在時回傳 404', () => {
    vi.mocked(getRouterParam).mockReturnValue('999')

    expect(() => handler({} as any)).toThrow()
  })

  it('成功回傳選手統計', () => {
    vi.mocked(getRouterParam).mockReturnValue('1')

    const result = handler({} as any)

    expect(result.status).toBe('success')
    expect(result.data.player_id).toBe(1)
    expect(result.data.avg_velocity).toBe(118.5)
  })
})
