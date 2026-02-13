import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockTeams } from '~/server/mock/data/teams'

const handler = (await import('~/server/api/teams/index.get')).default

const originalTeams = JSON.parse(JSON.stringify(mockTeams))

describe('get /api/teams', () => {
  beforeEach(() => {
    vi.mocked(getQuery).mockReset()
    mockTeams.length = 0
    mockTeams.push(...JSON.parse(JSON.stringify(originalTeams)))
  })

  it('回傳所有 active 球隊', () => {
    vi.mocked(getQuery).mockReturnValue({})

    const result = handler({} as any)

    expect(result.status).toBe('success')
    result.data.forEach((t: any) => {
      expect(t.status).toBe('active')
    })
  })

  it('以 created_by 篩選', () => {
    vi.mocked(getQuery).mockReturnValue({ created_by: 'coach2' })

    const result = handler({} as any)

    result.data.forEach((t: any) => {
      expect(t.created_by).toBe('coach2')
    })
  })

  it('依 created_at 倒序排列', () => {
    vi.mocked(getQuery).mockReturnValue({})

    const result = handler({} as any)

    for (let i = 0; i < result.data.length - 1; i++) {
      const curr = new Date(result.data[i].created_at).getTime()
      const next = new Date(result.data[i + 1].created_at).getTime()
      expect(curr >= next).toBe(true)
    }
  })
})
