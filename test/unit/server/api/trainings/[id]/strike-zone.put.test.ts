import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockTrainings } from '~/server/mock/data/trainings'

const handler = (await import('~/server/api/trainings/[id]/strike-zone.put')).default

const originalDetails = JSON.parse(JSON.stringify(mockTrainings))

describe('put /api/trainings/:id/strike-zone', () => {
  beforeEach(() => {
    vi.mocked(readBody).mockReset()
    vi.mocked(getRouterParam).mockReset()
    mockTrainings.length = 0
    mockTrainings.push(...JSON.parse(JSON.stringify(originalDetails)))
  })

  it('缺少好球帶參數時回傳 400', async () => {
    vi.mocked(getRouterParam).mockReturnValue('1')
    vi.mocked(readBody).mockResolvedValue({})

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 400,
      message: '請提供好球帶上下邊界',
    })
  })

  it('訓練不存在時回傳 404', async () => {
    vi.mocked(getRouterParam).mockReturnValue('999')
    vi.mocked(readBody).mockResolvedValue({ strike_zone_top: 120, strike_zone_bottom: 50 })

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 404,
      message: '找不到該訓練紀錄',
    })
  })

  it('成功更新好球帶', async () => {
    vi.mocked(getRouterParam).mockReturnValue('1')
    vi.mocked(readBody).mockResolvedValue({ strike_zone_top: 130, strike_zone_bottom: 55 })

    const result = await handler({} as any)

    expect(result.status).toBe('success')
    expect(result.message).toBe('好球帶已更新')

    const training = mockTrainings.find(t => t.id === 1)!
    expect(training.strike_zone_top).toBe(130)
    expect(training.strike_zone_bottom).toBe(55)
  })
})
