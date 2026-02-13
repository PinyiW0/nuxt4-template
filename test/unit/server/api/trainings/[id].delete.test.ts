import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockTrainings } from '~/server/mock/data/trainings'

const handler = (await import('~/server/api/trainings/[id].delete')).default

const originalTrainings = JSON.parse(JSON.stringify(mockTrainings))

describe('delete /api/trainings/:id', () => {
  beforeEach(() => {
    vi.mocked(getRouterParam).mockReset()
    mockTrainings.length = 0
    mockTrainings.push(...JSON.parse(JSON.stringify(originalTrainings)))
  })

  it('訓練不存在時回傳 404', () => {
    vi.mocked(getRouterParam).mockReturnValue('999')

    expect(() => handler({} as any)).toThrow()
  })

  it('成功軟刪除訓練', () => {
    vi.mocked(getRouterParam).mockReturnValue('1')

    const result = handler({} as any)

    expect(result.status).toBe('success')
    expect(result.message).toBe('訓練紀錄已刪除')
    expect(mockTrainings.find(t => t.id === 1)!.status).toBe('deleted')
  })
})
