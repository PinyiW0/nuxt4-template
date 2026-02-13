import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockPlayerAnalysis } from '~/server/mock/data/playerAnalysis'

const handler = (await import('~/server/api/player-analysis/index.get')).default

const originalAnalysis = JSON.parse(JSON.stringify(mockPlayerAnalysis))

describe('get /api/player-analysis', () => {
  beforeEach(() => {
    vi.mocked(getQuery).mockReset()
    mockPlayerAnalysis.length = 0
    mockPlayerAnalysis.push(...JSON.parse(JSON.stringify(originalAnalysis)))
  })

  it('回傳所有選手分析', () => {
    vi.mocked(getQuery).mockReturnValue({})

    const result = handler({} as any)

    expect(result.status).toBe('success')
    expect(result.data.length).toBe(3)
  })

  it('以 team_id 篩選', () => {
    vi.mocked(getQuery).mockReturnValue({ team_id: '1' })

    const result = handler({} as any)

    result.data.forEach((a: any) => {
      expect(a.team_name).toBe('藍鷹隊')
    })
  })

  it('以 keyword 搜尋姓名', () => {
    vi.mocked(getQuery).mockReturnValue({ keyword: '王' })

    const result = handler({} as any)

    expect(result.data.length).toBe(1)
    expect(result.data[0].name).toBe('王小明')
  })

  it('以 keyword 搜尋背號', () => {
    vi.mocked(getQuery).mockReturnValue({ keyword: '10' })

    const result = handler({} as any)

    expect(result.data.length).toBe(1)
    expect(result.data[0].name).toBe('李大華')
  })
})
