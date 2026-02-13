import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockTrainings } from '~/server/mock/data/trainings'

const handler = (await import('~/server/api/ai/stop.post')).default

describe('post /api/ai/stop', () => {
  beforeEach(() => {
    vi.mocked(readBody).mockReset()
    const t1 = mockTrainings.find(t => t.id === 1)!
    t1.ai_status = 'stopped'
    t1.status = 'active'
    const t2 = mockTrainings.find(t => t.id === 2)!
    t2.ai_status = 'running'
    t2.status = 'active'
  })

  it('缺少 training_id 時回傳 400', async () => {
    vi.mocked(readBody).mockResolvedValue({})

    await expect(handler()).rejects.toMatchObject({
      statusCode: 400,
      message: '請提供訓練 ID',
    })
  })

  it('訓練不存在時回傳 404', async () => {
    vi.mocked(readBody).mockResolvedValue({ training_id: 999 })

    await expect(handler()).rejects.toMatchObject({
      statusCode: 404,
      message: '找不到該訓練紀錄',
    })
  })

  it('已停止的 AI 應回傳 409', async () => {
    vi.mocked(readBody).mockResolvedValue({ training_id: 1 })

    await expect(handler()).rejects.toMatchObject({
      statusCode: 409,
      message: 'AI 系統已停止',
    })
  })

  it('成功停止 AI', async () => {
    vi.mocked(readBody).mockResolvedValue({ training_id: 2 })

    const result = await handler()

    expect(result).toEqual({
      status: 'success',
      data: { ai_status: 'stopped' },
    })
    expect(mockTrainings.find(t => t.id === 2)!.ai_status).toBe('stopped')
  })
})
