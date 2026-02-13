import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockPlayers } from '~/server/mock/data/players'
import { mockTrainings } from '~/server/mock/data/trainings'

const handler = (await import('~/server/api/trainings/index.post')).default

const originalTrainings = JSON.parse(JSON.stringify(mockTrainings))
const originalPlayers = JSON.parse(JSON.stringify(mockPlayers))

describe('post /api/trainings', () => {
  beforeEach(() => {
    vi.mocked(readBody).mockReset()
    mockTrainings.length = 0
    mockTrainings.push(...JSON.parse(JSON.stringify(originalTrainings)))
    mockPlayers.length = 0
    mockPlayers.push(...JSON.parse(JSON.stringify(originalPlayers)))
  })

  it('缺少日期或選手時回傳 400', async () => {
    vi.mocked(readBody).mockResolvedValue({})

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 400,
      message: '請填寫日期和受測選手',
    })
  })

  it('球員不存在時回傳 404', async () => {
    vi.mocked(readBody).mockResolvedValue({ date: '2026-02-01', player_id: 999 })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 404,
      message: '找不到該球員',
    })
  })

  it('成功新增訓練', async () => {
    vi.mocked(readBody).mockResolvedValue({ date: '2026-02-01', player_id: 1 })

    const result = await handler({} as any)

    expect(result.status).toBe('success')
    expect(result.data.date).toBe('2026-02-01')
    expect(result.data.pitch_count).toBe(0)
    expect(result.data.ai_status).toBe('stopped')
    expect(result.data.status).toBe('active')
  })
})
