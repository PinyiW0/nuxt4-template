import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockPlayers } from '~/server/mock/data/players'

const handler = (await import('~/server/api/players/[id].delete')).default

const originalPlayers = JSON.parse(JSON.stringify(mockPlayers))

describe('delete /api/players/:id', () => {
  beforeEach(() => {
    vi.mocked(getRouterParam).mockReset()
    mockPlayers.length = 0
    mockPlayers.push(...JSON.parse(JSON.stringify(originalPlayers)))
  })

  it('球員不存在時回傳 404', () => {
    vi.mocked(getRouterParam).mockReturnValue('999')

    expect(() => handler({} as any)).toThrow()
  })

  it('成功軟刪除球員', () => {
    vi.mocked(getRouterParam).mockReturnValue('1')

    const result = handler({} as any)

    expect(result.status).toBe('success')
    expect(result.message).toBe('球員已刪除')
    expect(mockPlayers.find(p => p.id === 1)!.status).toBe('deleted')
  })
})
