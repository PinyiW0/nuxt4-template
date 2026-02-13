import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockPlayers } from '~/server/mock/data/players'

const handler = (await import('~/server/api/players/index.get')).default

const originalPlayers = JSON.parse(JSON.stringify(mockPlayers))

describe('get /api/players', () => {
  beforeEach(() => {
    vi.mocked(getQuery).mockReset()
    mockPlayers.length = 0
    mockPlayers.push(...JSON.parse(JSON.stringify(originalPlayers)))
  })

  it('回傳所有 active 球員', () => {
    vi.mocked(getQuery).mockReturnValue({})

    const result = handler({} as any)

    expect(result.status).toBe('success')
    result.data.forEach((p: any) => {
      expect(p.status).toBe('active')
    })
  })

  it('以 team_id 篩選', () => {
    vi.mocked(getQuery).mockReturnValue({ team_id: '1' })

    const result = handler({} as any)

    result.data.forEach((p: any) => {
      expect(p.team_id).toBe(1)
    })
  })

  it('依 sort_order 排序', () => {
    vi.mocked(getQuery).mockReturnValue({})

    const result = handler({} as any)

    for (let i = 0; i < result.data.length - 1; i++) {
      expect(result.data[i].sort_order <= result.data[i + 1].sort_order).toBe(true)
    }
  })
})
