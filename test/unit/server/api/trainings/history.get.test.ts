import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockTrainings } from '~/server/mock/data/trainings'

const handler = (await import('~/server/api/trainings/history.get')).default

const originalTrainings = JSON.parse(JSON.stringify(mockTrainings))

describe('get /api/trainings/history', () => {
  beforeEach(() => {
    vi.mocked(getQuery).mockReset()
    mockTrainings.length = 0
    mockTrainings.push(...JSON.parse(JSON.stringify(originalTrainings)))
  })

  it('只回傳 active 且今天及過去的訓練', () => {
    vi.mocked(getQuery).mockReturnValue({})

    const result = handler({} as any)

    expect(result.status).toBe('success')
    const today = new Date().toISOString().split('T')[0]!
    result.data.forEach((t: any) => {
      expect(t.status).toBe('active')
      expect(t.date <= today).toBe(true)
    })
  })

  it('以 created_by 篩選', () => {
    vi.mocked(getQuery).mockReturnValue({ created_by: 'coach1' })

    const result = handler({} as any)

    result.data.forEach((t: any) => {
      expect(t.created_by).toBe('coach1')
    })
  })

  it('以日期範圍篩選', () => {
    vi.mocked(getQuery).mockReturnValue({ date_from: '2026-01-20', date_to: '2026-01-25' })

    const result = handler({} as any)

    result.data.forEach((t: any) => {
      expect(t.date >= '2026-01-20').toBe(true)
      expect(t.date <= '2026-01-25').toBe(true)
    })
  })

  it('以 team_id 篩選', () => {
    vi.mocked(getQuery).mockReturnValue({ team_id: '2' })

    const result = handler({} as any)

    result.data.forEach((t: any) => {
      expect(t.team_id).toBe(2)
    })
  })

  it('依 date 倒序排列', () => {
    vi.mocked(getQuery).mockReturnValue({})

    const result = handler({} as any)

    for (let i = 0; i < result.data.length - 1; i++) {
      expect(result.data[i].date >= result.data[i + 1].date).toBe(true)
    }
  })
})
