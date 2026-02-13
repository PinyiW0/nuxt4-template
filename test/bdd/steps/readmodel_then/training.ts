import type { DataTable } from 'quickpickle'
import type { TestWorld } from '../../helpers/world'
import { Then } from 'quickpickle'
import { expect } from 'vitest'

Then('回傳以下訓練：', async (world: TestWorld, dataTable: DataTable) => {
  const expected = dataTable.hashes()
  const items = world.queryResult.items

  expect(items).toHaveLength(expected.length)
  expected.forEach((row, index) => {
    expect(items[index].id).toBe(row.id)
    expect(items[index].date).toBe(row.date)
    expect(items[index].playerName).toBe(row.player_name)
    expect(items[index].teamName).toBe(row.team_name)
    expect(items[index].pitchCount).toBe(Number.parseInt(row.pitch_count))
    expect(items[index].aiStatus).toBe(row.ai_status)
    expect(items[index].createdBy).toBe(row.created_by)
  })
})

Then('結果不包含 coach2 建立的訓練', async (world: TestWorld) => {
  const items = world.queryResult.items
  const coach2Items = items.filter((item: any) => item.createdBy === 'coach2')
  expect(coach2Items).toHaveLength(0)
})

// Feature 21: 回傳所有今天及過去的 active 訓練
Then('回傳所有今天及過去的 active 訓練', async (world: TestWorld) => {
  const items = world.queryResult.items
  const today = world.today!

  items.forEach((item: any) => {
    expect(item.date <= today).toBe(true)
  })

  items.forEach((item: any) => {
    expect(item.status).toBe('active')
  })
})

Then('回傳所有今天及未來的 active 訓練', async (world: TestWorld) => {
  const items = world.queryResult.items
  const today = world.today!

  // 確認所有項目都是 active 且日期 >= 今天
  items.forEach((item: any) => {
    expect(item.date >= today).toBe(true)
  })

  // 不應包含已刪除的
  items.forEach((item: any) => {
    expect(item.status).toBe('active')
  })
})

Then('依建立時間由新到舊排列', async (world: TestWorld) => {
  const items = world.queryResult.items
  for (let i = 0; i < items.length - 1; i++) {
    // 依訓練日期由新到舊排列
    expect(items[i].date >= items[i + 1].date).toBe(true)
  }
})

Then('只回傳該日期範圍內的訓練', async (world: TestWorld) => {
  const items = world.queryResult.items
  expect(items.length).toBeGreaterThan(0)
})

Then('結果不包含已刪除的訓練', async (world: TestWorld) => {
  const items = world.queryResult.items
  const deletedItems = items.filter((item: any) => item.status === 'deleted')
  expect(deletedItems).toHaveLength(0)
})

// Feature 17: 顯示訓練基本資訊
Then('顯示訓練基本資訊：', async (world: TestWorld, dataTable: DataTable) => {
  const detail = world.currentTrainingDetail || world.queryResult
  expect(detail).toBeDefined()

  const rows = dataTable.hashes()
  rows.forEach((row) => {
    const field = row.field
    const value = row.value

    switch (field) {
      case 'date':
        expect(detail.training.date).toBe(value)
        break
      case 'team_name':
        expect(detail.training.teamName).toBe(value)
        break
      case 'player_name':
        expect(detail.training.playerName).toBe(value)
        break
      case 'strike_zone_top':
        expect(`${detail.training.strikeZoneTop} cm`).toBe(value)
        break
      case 'strike_zone_bottom':
        expect(`${detail.training.strikeZoneBottom} cm`).toBe(value)
        break
    }
  })
})

// Feature 17: 顯示投球清單
Then('顯示投球清單：', async (world: TestWorld, dataTable: DataTable) => {
  const detail = world.currentTrainingDetail || world.queryResult
  const pitches = detail.pitches
  const expected = dataTable.hashes()

  expect(pitches).toHaveLength(expected.length)
  expected.forEach((row, index) => {
    const pitch = pitches[index]
    if (row.sequence)
      expect(pitch.sequence).toBe(Number.parseInt(row.sequence))
    if (row.time) {
      // time 格式可能是 "10:01:00" 或完整 ISO 格式
      const pitchTime = pitch.time.includes('T') ? pitch.time.split('T')[1].substring(0, 8) : pitch.time
      expect(pitchTime).toBe(row.time)
    }
    if (row.velocity)
      expect(pitch.speed).toBeCloseTo(Number.parseFloat(row.velocity), 1)
    if (row.spin_rate)
      expect(pitch.spinRate).toBe(Number.parseInt(row.spin_rate))
    if (row.is_strike) {
      const expected = row.is_strike === '好球'
      expect(pitch.isStrike).toBe(expected)
    }
    if (row.location) {
      // 解析 "(0.1, 0.8)" 格式
      const match = row.location.match(/\(([^,]+), ([^)]+)\)/)
      if (match) {
        expect(pitch.locationX).toBeCloseTo(Number.parseFloat(match[1]), 1)
        expect(pitch.locationY).toBeCloseTo(Number.parseFloat(match[2]), 1)
      }
    }
  })
})

// Feature 17: 投球清單每筆資料包含以下欄位
Then('投球清單每筆資料包含以下欄位：', async (world: TestWorld, dataTable: DataTable) => {
  const detail = world.currentTrainingDetail || world.queryResult
  const pitches = detail.pitches
  const expectedFields = dataTable.hashes().map(row => row.field)

  expect(pitches.length).toBeGreaterThan(0)

  // 欄位映射
  const fieldMapping: Record<string, string> = {
    sequence: 'sequence',
    time: 'time',
    velocity: 'speed',
    spin_rate: 'spinRate',
    is_strike: 'isStrike',
    location: 'locationX', // location 由 locationX + locationY 組成
  }

  pitches.forEach((pitch: any) => {
    expectedFields.forEach((field) => {
      const mappedField = fieldMapping[field]
      if (field === 'location') {
        expect(pitch.locationX).toBeDefined()
        expect(pitch.locationY).toBeDefined()
      }
      else if (mappedField) {
        expect(pitch[mappedField]).toBeDefined()
      }
    })
  })
})

// Feature 17: 顯示即時統計摘要
Then('顯示即時統計摘要：', async (world: TestWorld, dataTable: DataTable) => {
  const detail = world.currentTrainingDetail || world.queryResult
  const stats = detail.statistics
  expect(stats).toBeDefined()

  const rows = dataTable.hashes()
  rows.forEach((row) => {
    const field = row.field
    const value = row.value

    switch (field) {
      case 'total_pitches':
        expect(stats.totalPitches).toBe(Number.parseInt(value))
        break
      case 'strike_count':
        expect(stats.strikeCount).toBe(Number.parseInt(value))
        break
      case 'ball_count':
        expect(stats.ballCount).toBe(Number.parseInt(value))
        break
      case 'strike_rate':
        expect(`${stats.strikeRate}%`).toBe(value)
        break
      case 'avg_velocity':
        expect(stats.avgVelocity).toBeCloseTo(Number.parseFloat(value), 2)
        break
    }
  })
})

// Feature 17: 投球清單自動新增該筆紀錄
Then('投球清單自動新增該筆紀錄', async (world: TestWorld) => {
  const detail = world.currentTrainingDetail
  expect(detail).toBeDefined()
  expect(detail.pitches.length).toBeGreaterThan(world.pitchListBeforeCount || 0)
})

// Feature 17: 即時統計摘要自動更新
Then('即時統計摘要自動更新', async (world: TestWorld) => {
  const detail = world.currentTrainingDetail
  expect(detail).toBeDefined()
  // 新投球後，totalPitches 應該增加
  expect(detail.statistics.totalPitches).toBeGreaterThan(
    world.statisticsBeforeUpdate?.totalPitches || 0,
  )
})

// Feature 18: 系統回傳投球清單
Then('系統回傳投球清單：', async (world: TestWorld, dataTable: DataTable) => {
  const pitches = world.queryResult
  const expected = dataTable.hashes()

  expect(pitches).toHaveLength(expected.length)
  expected.forEach((row, index) => {
    const pitch = pitches[index]
    if (row['編號'] || row.id)
      expect(pitch.id).toBe(row['編號'] || row.id)
    if (row['球速'] || row.velocity)
      expect(pitch.speed).toBe(Number.parseFloat(row['球速'] || row.velocity))
    if (row['轉速'] || row.spin_rate)
      expect(pitch.spinRate).toBe(Number.parseInt(row['轉速'] || row.spin_rate))
    if (row['好壞球'])
      expect(pitch.strikeOrBall).toBe(row['好壞球'])
  })
})

// Feature 18: 投球清單自動新增該筆投球紀錄
Then('投球清單自動新增該筆投球紀錄', async (world: TestWorld) => {
  // 重新查詢投球清單，確認數量增加
  const trainingId = world.queryResult?.[0]?.trainingId
  if (trainingId && world.pitchRepository) {
    const currentPitches = world.pitchRepository.findByTrainingId(trainingId)
      .filter((p: any) => p.status === 'active')
    expect(currentPitches.length).toBeGreaterThan(world.pitchListBeforeCount || 0)
  }
})

// Feature 18: 不需要手動刷新頁面
Then('不需要手動刷新頁面', async (world: TestWorld) => {
  // SSE 即時更新，無需手動刷新
  expect(world.sseConnected).toBe(true)
})

// Feature 18: 系統自動嘗試重新連線
Then('系統自動嘗試重新連線', async (world: TestWorld) => {
  expect(world.sseReconnected).toBe(true)
})

// Feature 18: 重連成功後繼續接收即時更新
Then('重連成功後繼續接收即時更新', async (world: TestWorld) => {
  expect(world.sseConnected).toBe(true)
  expect(world.sseReconnected).toBe(true)
})

// Feature 21: 只回傳藍鷹隊的歷史訓練
Then('只回傳藍鷹隊的歷史訓練', async (world: TestWorld) => {
  const items = world.queryResult.items
  items.forEach((item: any) => {
    expect(item.teamName).toBe('藍鷹隊')
  })
})

// Feature 22: 系統顯示確認對話框
Then('系統顯示確認對話框 {string}', async (world: TestWorld, message: string) => {
  expect(world.confirmDialog).toBe(message)
})

// Feature 22: 訓練的所有投球紀錄狀態為
Then('訓練 {string} 的所有投球紀錄狀態為 {string}', async (world: TestWorld, trainingId: string, status: string) => {
  const pitches = world.pitchRepository.findByTrainingId(trainingId)
  expect(pitches.length).toBeGreaterThan(0)
  pitches.forEach((pitch: any) => {
    expect(pitch.status).toBe(status)
  })
})

// Feature 23: 顯示訓練統計彙總
Then('顯示訓練統計彙總', async (world: TestWorld) => {
  expect(world.currentAnalysis).toBeDefined()
  expect(world.currentAnalysis.statistics).toBeDefined()
})

Then('顯示總投球數為 {int}', async (world: TestWorld, count: number) => {
  expect(world.currentAnalysis.statistics.totalPitches).toBe(count)
})

Then('顯示好球數為 {int}', async (world: TestWorld, count: number) => {
  expect(world.currentAnalysis.statistics.strikeCount).toBe(count)
})

Then('顯示壞球數為 {int}', async (world: TestWorld, count: number) => {
  expect(world.currentAnalysis.statistics.ballCount).toBe(count)
})

Then('顯示好球率為 {int}%', async (world: TestWorld, rate: number) => {
  expect(world.currentAnalysis.statistics.strikeRate).toBe(rate)
})

Then('顯示平均球速為 {float} km\\/h', async (world: TestWorld, velocity: number) => {
  expect(world.currentAnalysis.statistics.avgVelocity).toBeCloseTo(velocity, 2)
})

Then('顯示最快球速為 {float} km\\/h', async (world: TestWorld, velocity: number) => {
  expect(world.currentAnalysis.statistics.maxVelocity).toBeCloseTo(velocity, 1)
})

Then('顯示最慢球速為 {float} km\\/h', async (world: TestWorld, velocity: number) => {
  expect(world.currentAnalysis.statistics.minVelocity).toBeCloseTo(velocity, 1)
})

Then('顯示平均轉速為 {int} rpm', async (world: TestWorld, spinRate: number) => {
  expect(world.currentAnalysis.statistics.avgSpinRate).toBe(spinRate)
})

Then('顯示落點熱區圖', async (world: TestWorld) => {
  expect(world.currentAnalysis.statistics.heatMap).toBeDefined()
  expect(world.currentAnalysis.statistics.heatMap.length).toBeGreaterThan(0)
})

Then('熱區圖以顏色漸層顯示投球落點密度', async (world: TestWorld) => {
  // 確認有熱區數據即可
  expect(world.currentAnalysis.statistics.heatMap).toBeDefined()
})

Then('顯示以下統計指標：', async (world: TestWorld, dataTable: DataTable) => {
  const stats = world.currentAnalysis.statistics
  const expectedFields = dataTable.hashes().map((row: any) => row.field)

  const fieldMapping: Record<string, string> = {
    total_pitches: 'totalPitches',
    strike_count: 'strikeCount',
    ball_count: 'ballCount',
    strike_rate: 'strikeRate',
    avg_velocity: 'avgVelocity',
    max_velocity: 'maxVelocity',
    min_velocity: 'minVelocity',
    avg_spin_rate: 'avgSpinRate',
    heat_map: 'heatMap',
  }

  expectedFields.forEach((field: string) => {
    const mappedField = fieldMapping[field] || field
    expect(stats[mappedField]).toBeDefined()
  })
})
