import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockPlayers } from '~/server/mock/data/players'

const handler = (await import('~/server/api/players/sort.put')).default

const originalPlayers = JSON.parse(JSON.stringify(mockPlayers))

describe('put /api/players/sort', () => {
  beforeEach(() => {
    vi.mocked(readBody).mockReset()
    mockPlayers.length = 0
    mockPlayers.push(...JSON.parse(JSON.stringify(originalPlayers)))
  })

  it('缺少必要參數時回傳 400', async () => {
    vi.mocked(readBody).mockResolvedValue({})

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 400,
      message: '請提供球隊 ID 和球員排序',
    })
  })

  it('成功更新球員排序', async () => {
    vi.mocked(readBody).mockResolvedValue({
      team_id: 1,
      player_ids: [2, 1],
    })

    const result = await handler({} as any)

    expect(result.status).toBe('success')
    expect(result.message).toBe('排序已更新')

    const p1 = mockPlayers.find(p => p.id === 1)!
    const p2 = mockPlayers.find(p => p.id === 2)!
    expect(p2.sort_order).toBe(1)
    expect(p1.sort_order).toBe(2)
  })
})
