import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockTeams } from '~/server/mock/data/teams'

const handler = (await import('~/server/api/teams/index.post')).default

const originalTeams = JSON.parse(JSON.stringify(mockTeams))

describe('post /api/teams', () => {
  beforeEach(() => {
    vi.mocked(readBody).mockReset()
    mockTeams.length = 0
    mockTeams.push(...JSON.parse(JSON.stringify(originalTeams)))
  })

  it('缺少名稱時回傳 400', async () => {
    vi.mocked(readBody).mockResolvedValue({})

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 400,
      message: '請輸入球隊名稱',
    })
  })

  it('名稱超過 50 字時回傳 400', async () => {
    vi.mocked(readBody).mockResolvedValue({ name: 'a'.repeat(51) })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 400,
      message: '球隊名稱不可超過 50 字元',
    })
  })

  it('名稱重複時回傳 409', async () => {
    vi.mocked(readBody).mockResolvedValue({ name: '藍鷹隊' })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 409,
      message: '球隊名稱已存在',
    })
  })

  it('成功新增球隊', async () => {
    vi.mocked(readBody).mockResolvedValue({ name: '新球隊' })

    const result = await handler({} as any)

    expect(result.status).toBe('success')
    expect(result.data.name).toBe('新球隊')
    expect(result.data.player_count).toBe(0)
    expect(result.data.status).toBe('active')
  })
})
