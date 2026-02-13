import { beforeEach, describe, expect, it, vi } from 'vitest'

const handler = (await import('~/server/api/trainings/[id]/pitches/index.get')).default

describe('get /api/trainings/:id/pitches', () => {
  beforeEach(() => {
    vi.mocked(getRouterParam).mockReset()
  })

  it('回傳訓練的投球清單', () => {
    vi.mocked(getRouterParam).mockReturnValue('1')

    const result = handler({} as any)

    expect(result.status).toBe('success')
    expect(result.data.length).toBe(5)
  })

  it('訓練無投球資料時回傳空陣列', () => {
    vi.mocked(getRouterParam).mockReturnValue('999')

    const result = handler({} as any)

    expect(result.status).toBe('success')
    expect(result.data).toEqual([])
  })
})
