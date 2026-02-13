import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockPlayers } from '~/server/mock/data/players'

const handler = (await import('~/server/api/players/index.post')).default

const originalPlayers = JSON.parse(JSON.stringify(mockPlayers))

describe('post /api/players', () => {
  beforeEach(() => {
    vi.mocked(readBody).mockReset()
    mockPlayers.length = 0
    mockPlayers.push(...JSON.parse(JSON.stringify(originalPlayers)))
  })

  it('缺少必填欄位時回傳 400', async () => {
    vi.mocked(readBody).mockResolvedValue({ name: '測試' })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 400,
      message: '請填寫所有必填欄位',
    })
  })

  it('背號超出 0-99 範圍時回傳 400', async () => {
    vi.mocked(readBody).mockResolvedValue({
      name: '測試',
      position: '投手',
      number: 100,
      height: 175,
      team_id: 1,
    })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 400,
      message: '背號必須在 0-99 之間',
    })
  })

  it('球隊不存在時回傳 404', async () => {
    vi.mocked(readBody).mockResolvedValue({
      name: '測試',
      position: '投手',
      number: 50,
      height: 175,
      team_id: 999,
    })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 404,
      message: '找不到該球隊',
    })
  })

  it('同球隊背號重複時回傳 409', async () => {
    vi.mocked(readBody).mockResolvedValue({
      name: '新球員',
      position: '捕手',
      number: 1,
      height: 180,
      team_id: 1,
    })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 409,
      message: '該球隊已有此背號的球員',
    })
  })

  it('成功新增球員', async () => {
    vi.mocked(readBody).mockResolvedValue({
      name: '新球員',
      position: '投手',
      number: 50,
      height: 175,
      team_id: 1,
    })

    const result = await handler({} as any)

    expect(result.status).toBe('success')
    expect(result.data.name).toBe('新球員')
    expect(result.data.number).toBe(50)
    expect(result.data.team_id).toBe(1)
    expect(result.data.status).toBe('active')
    expect(result.data.sort_order).toBeGreaterThan(0)
  })
})
