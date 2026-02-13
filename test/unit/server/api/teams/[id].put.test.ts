import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockTeams } from '~/server/mock/data/teams'

const handler = (await import('~/server/api/teams/[id].put')).default

const originalTeams = JSON.parse(JSON.stringify(mockTeams))

describe('put /api/teams/:id', () => {
  beforeEach(() => {
    vi.mocked(readBody).mockReset()
    vi.mocked(getRouterParam).mockReset()
    mockTeams.length = 0
    mockTeams.push(...JSON.parse(JSON.stringify(originalTeams)))
  })

  it('球隊不存在時回傳 404', async () => {
    vi.mocked(getRouterParam).mockReturnValue('999')
    vi.mocked(readBody).mockResolvedValue({ name: '新名稱' })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 404,
      message: '找不到該球隊',
    })
  })

  it('缺少名稱時回傳 400', async () => {
    vi.mocked(getRouterParam).mockReturnValue('1')
    vi.mocked(readBody).mockResolvedValue({})

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 400,
      message: '請輸入球隊名稱',
    })
  })

  it('名稱超過 50 字時回傳 400', async () => {
    vi.mocked(getRouterParam).mockReturnValue('1')
    vi.mocked(readBody).mockResolvedValue({ name: 'a'.repeat(51) })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 400,
      message: '球隊名稱不可超過 50 字元',
    })
  })

  it('名稱與其他球隊重複時回傳 409', async () => {
    vi.mocked(getRouterParam).mockReturnValue('1')
    vi.mocked(readBody).mockResolvedValue({ name: '紅龍隊' })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 409,
      message: '球隊名稱已存在',
    })
  })

  it('成功更新球隊名稱', async () => {
    vi.mocked(getRouterParam).mockReturnValue('1')
    vi.mocked(readBody).mockResolvedValue({ name: '新藍鷹隊' })

    const result = await handler({} as any)

    expect(result.status).toBe('success')
    expect(result.data.name).toBe('新藍鷹隊')
  })
})
