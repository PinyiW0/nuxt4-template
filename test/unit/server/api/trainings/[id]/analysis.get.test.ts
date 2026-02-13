import { beforeEach, describe, expect, it, vi } from 'vitest'

const handler = (await import('~/server/api/trainings/[id]/analysis.get')).default

describe('get /api/trainings/:id/analysis', () => {
  beforeEach(() => {
    vi.mocked(getRouterParam).mockReset()
  })

  it('分析不存在時回傳 404', () => {
    vi.mocked(getRouterParam).mockReturnValue('999')

    expect(() => handler({} as any)).toThrow()
  })

  it('成功回傳訓練分析', () => {
    vi.mocked(getRouterParam).mockReturnValue('1')

    const result = handler({} as any)

    expect(result.status).toBe('success')
    expect(result.data.training_id).toBe(1)
    expect(result.data.total_pitches).toBe(5)
    expect(result.data.strike_count).toBe(3)
  })
})
