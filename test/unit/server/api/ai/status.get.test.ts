import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockTrainings } from '~/server/mock/data/trainings'

const handler = (await import('~/server/api/ai/status.get')).default

const originalTrainings = JSON.parse(JSON.stringify(mockTrainings))

describe('get /api/ai/status', () => {
  beforeEach(() => {
    vi.mocked(getQuery).mockReset()
    mockTrainings.length = 0
    mockTrainings.push(...JSON.parse(JSON.stringify(originalTrainings)))
  })

  it('缺少 training_id 時回傳 400', () => {
    vi.mocked(getQuery).mockReturnValue({})

    expect(() => handler()).toThrow()
  })

  it('訓練不存在時回傳 404', () => {
    vi.mocked(getQuery).mockReturnValue({ training_id: '999' })

    expect(() => handler()).toThrow()
  })

  it('成功回傳 AI 狀態', () => {
    vi.mocked(getQuery).mockReturnValue({ training_id: '1' })

    const result = handler()

    expect(result.status).toBe('success')
    expect(result.data.ai_status).toBe('stopped')
  })
})
