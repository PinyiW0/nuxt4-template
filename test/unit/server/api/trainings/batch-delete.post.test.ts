import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockTrainings } from '~/server/mock/data/trainings'

const handler = (await import('~/server/api/trainings/batch-delete.post')).default

const originalTrainings = JSON.parse(JSON.stringify(mockTrainings))

describe('post /api/trainings/batch-delete', () => {
  beforeEach(() => {
    vi.mocked(readBody).mockReset()
    mockTrainings.length = 0
    mockTrainings.push(...JSON.parse(JSON.stringify(originalTrainings)))
  })

  it('ids 為空陣列時回傳 400', async () => {
    vi.mocked(readBody).mockResolvedValue({ ids: [] })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 400,
      message: '請選擇要刪除的訓練紀錄',
    })
  })

  it('ids 非陣列時回傳 400', async () => {
    vi.mocked(readBody).mockResolvedValue({ ids: 'invalid' })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 400,
    })
  })

  it('批次軟刪除 active 訓練', async () => {
    vi.mocked(readBody).mockResolvedValue({ ids: [1, 2] })

    const result = await handler({} as any)

    expect(result.status).toBe('success')
    expect(result.message).toBe('已刪除 2 筆訓練紀錄')
    expect(mockTrainings.find(t => t.id === 1)!.status).toBe('deleted')
    expect(mockTrainings.find(t => t.id === 2)!.status).toBe('deleted')
  })

  it('已刪除的訓練不會再次被計入', async () => {
    vi.mocked(readBody).mockResolvedValue({ ids: [5] })

    const result = await handler({} as any)

    expect(result.message).toBe('已刪除 0 筆訓練紀錄')
  })
})
