import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockPlayers } from '~/server/mock/data/players'

const handler = (await import('~/server/api/players/[id].put')).default

const originalPlayers = JSON.parse(JSON.stringify(mockPlayers))

describe('put /api/players/:id', () => {
  beforeEach(() => {
    vi.mocked(readBody).mockReset()
    vi.mocked(getRouterParam).mockReset()
    mockPlayers.length = 0
    mockPlayers.push(...JSON.parse(JSON.stringify(originalPlayers)))
  })

  it('球員不存在時回傳 404', async () => {
    vi.mocked(getRouterParam).mockReturnValue('999')
    vi.mocked(readBody).mockResolvedValue({ name: '新名' })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 404,
      message: '找不到該球員',
    })
  })

  it('背號超出範圍時回傳 400', async () => {
    vi.mocked(getRouterParam).mockReturnValue('1')
    vi.mocked(readBody).mockResolvedValue({ number: 100 })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 400,
      message: '背號必須在 0-99 之間',
    })
  })

  it('背號與同隊球員重複時回傳 409', async () => {
    vi.mocked(getRouterParam).mockReturnValue('1')
    vi.mocked(readBody).mockResolvedValue({ number: 10 }) // id=2 已使用 10 號

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 409,
      message: '該球隊已有此背號的球員',
    })
  })

  it('成功更新球員資料', async () => {
    vi.mocked(getRouterParam).mockReturnValue('1')
    vi.mocked(readBody).mockResolvedValue({ name: '新名字', height: 180 })

    const result = await handler({} as any)

    expect(result.status).toBe('success')
    expect(result.data.name).toBe('新名字')
    expect(result.data.height).toBe(180)
  })
})
