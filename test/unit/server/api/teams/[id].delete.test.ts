import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockTeams } from '~/server/mock/data/teams'

const handler = (await import('~/server/api/teams/[id].delete')).default

const originalTeams = JSON.parse(JSON.stringify(mockTeams))

describe('delete /api/teams/:id', () => {
  beforeEach(() => {
    vi.mocked(getRouterParam).mockReset()
    mockTeams.length = 0
    mockTeams.push(...JSON.parse(JSON.stringify(originalTeams)))
  })

  it('球隊不存在時回傳 404', () => {
    vi.mocked(getRouterParam).mockReturnValue('999')

    expect(() => handler({} as any)).toThrow()
  })

  it('成功軟刪除球隊', () => {
    vi.mocked(getRouterParam).mockReturnValue('1')

    const result = handler({} as any)

    expect(result.status).toBe('success')
    expect(result.message).toBe('球隊已刪除')
    expect(mockTeams.find(t => t.id === 1)!.status).toBe('deleted')
  })
})
