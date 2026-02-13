import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockPlayerAnalysis } from '~/server/mock/data/playerAnalysis'

const handler = (await import('~/server/api/player-analysis/batch-delete.post')).default

const originalAnalysis = JSON.parse(JSON.stringify(mockPlayerAnalysis))

describe('post /api/player-analysis/batch-delete', () => {
  beforeEach(() => {
    vi.mocked(readBody).mockReset()
    mockPlayerAnalysis.length = 0
    mockPlayerAnalysis.push(...JSON.parse(JSON.stringify(originalAnalysis)))
  })

  it('player_ids 為空或非陣列時回傳 400', async () => {
    vi.mocked(readBody).mockResolvedValue({ player_ids: [] })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 400,
      message: '請選擇要刪除的選手分析',
    })
  })

  it('批次刪除選手分析', async () => {
    vi.mocked(readBody).mockResolvedValue({ player_ids: [1, 2] })

    const result = await handler({} as any)

    expect(result.status).toBe('success')
    expect(result.message).toBe('已刪除 2 筆選手分析')
    expect(mockPlayerAnalysis.length).toBe(1)
    expect(mockPlayerAnalysis[0].id).toBe(3)
  })

  it('刪除不存在的 id 不影響結果', async () => {
    vi.mocked(readBody).mockResolvedValue({ player_ids: [999] })

    const result = await handler({} as any)

    expect(result.message).toBe('已刪除 0 筆選手分析')
    expect(mockPlayerAnalysis.length).toBe(3)
  })
})
