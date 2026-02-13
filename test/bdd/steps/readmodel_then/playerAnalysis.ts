import type { DataTable } from 'quickpickle'
import type { TestWorld } from '../../helpers/world'
import { Then } from 'quickpickle'
import { expect } from 'vitest'

// Feature 24: 回傳以下選手分析
Then('回傳以下選手分析：', async (world: TestWorld, dataTable: DataTable) => {
  const expected = dataTable.hashes()
  const items = world.queryResult.items

  expect(items).toHaveLength(expected.length)
  expected.forEach((row, index) => {
    expect(items[index].id).toBe(Number.parseInt(row.id))
    expect(items[index].name).toBe(row.name)
    expect(items[index].number).toBe(Number.parseInt(row.number))
    expect(items[index].teamName).toBe(row.team_name)
    expect(items[index].trainingCount).toBe(Number.parseInt(row.training_count))
    expect(items[index].totalPitches).toBe(Number.parseInt(row.total_pitches))
    expect(items[index].lastTrainingDate).toBe(row.last_training_date)
    expect(items[index].avgVelocity).toBeCloseTo(Number.parseFloat(row.avg_velocity), 1)
  })
})

Then('回傳所有選手分析（共 {int} 筆）', async (world: TestWorld, count: number) => {
  expect(world.queryResult.items).toHaveLength(count)
})

Then('只回傳藍鷹隊的選手分析（共 {int} 筆）', async (world: TestWorld, count: number) => {
  const items = world.queryResult.items
  expect(items).toHaveLength(count)
  items.forEach((item: any) => {
    expect(item.teamName).toBe('藍鷹隊')
  })
})

Then('只回傳姓名包含 {string} 的選手', async (world: TestWorld, keyword: string) => {
  const items = world.queryResult.items
  expect(items.length).toBeGreaterThan(0)
  items.forEach((item: any) => {
    expect(item.name).toContain(keyword)
  })
})

Then('結果不包含已刪除的球員', async (world: TestWorld) => {
  const items = world.queryResult.items
  // 所有回傳的球員都應該是 active 的
  items.forEach((item: any) => {
    const player = world.playerRepository.findById(item.id)
    expect(player?.status).toBe('active')
  })
})

// Feature 25: 球員的基本資料保留
Then('球員 {string} 的基本資料保留', async (world: TestWorld, playerName: string) => {
  const player = world.playerRepository.findByName(playerName)
  expect(player).toBeDefined()
  expect(player!.status).toBe('active')
})

// Feature 25: 球員的訓練紀錄被清除
Then('球員 {string} 的訓練紀錄被清除', async (world: TestWorld, playerName: string) => {
  const player = world.playerRepository.findByName(playerName)
  expect(player).toBeDefined()

  const trainings = world.trainingRepository.findAll().filter((t: any) => t.playerId === player!.id)
  trainings.forEach((t: any) => {
    expect(t.status).toBe('deleted')
  })
})

// Feature 25: 球員的投球數據被清除
Then('球員 {string} 的投球數據被清除', async (world: TestWorld, playerName: string) => {
  const player = world.playerRepository.findByName(playerName)
  expect(player).toBeDefined()

  const trainings = world.trainingRepository.findAll().filter((t: any) => t.playerId === player!.id)
  trainings.forEach((t: any) => {
    const pitches = world.pitchRepository.findByTrainingId(t.id)
    pitches.forEach((p: any) => {
      expect(p.status).toBe('deleted')
    })
  })
})

// Feature 26: 系統回傳統計資料
Then('系統回傳統計資料：', async (world: TestWorld, dataTable: DataTable) => {
  const stats = world.currentPlayerStats
  expect(stats).toBeDefined()

  const row = dataTable.hashes()[0]
  if (row['統計期間']) {
    expect(stats.period).toBeDefined()
  }
  if (row['平均球速']) {
    expect(stats.avgVelocity).toBeCloseTo(Number.parseFloat(row['平均球速']), 1)
  }
  if (row['平均轉速']) {
    expect(stats.avgSpinRate).toBe(Number.parseInt(row['平均轉速']))
  }
  if (row['好球率']) {
    expect(stats.strikeRate).toBe(row['好球率'])
  }
  if (row['投球總數']) {
    expect(stats.totalPitches).toBe(Number.parseInt(row['投球總數']))
  }
})

// Feature 26: 系統回傳以下統計指標
Then('系統回傳以下統計指標：', async (world: TestWorld, dataTable: DataTable) => {
  const stats = world.currentPlayerStats
  expect(stats).toBeDefined()

  const rows = dataTable.hashes()
  rows.forEach((row) => {
    const name = row['指標']
    const value = row['數值']

    switch (name) {
      case '平均球速':
        expect(stats.avgVelocity).toBeCloseTo(Number.parseFloat(value), 1)
        break
      case '平均轉速':
        expect(stats.avgSpinRate).toBe(Number.parseInt(value))
        break
      case '好球率':
        expect(stats.strikeRate).toBe(value)
        break
      case '投球總數':
        expect(stats.totalPitches).toBe(Number.parseInt(value))
        break
    }
  })
})

// Feature 26: 系統顯示投球落點密度分布圖
Then('系統顯示投球落點密度分布圖', async (world: TestWorld) => {
  expect(world.heatMapData).toBeDefined()
  expect(world.heatMapData.heatMap).toBeDefined()
})

Then('高密度區域以暖色（紅\\/橘）顯示', async (world: TestWorld) => {
  expect(world.heatMapData.warmColors).toBe(true)
})

Then('低密度區域以冷色（藍\\/綠）顯示', async (world: TestWorld) => {
  expect(world.heatMapData.coldColors).toBe(true)
})

// Feature 26: 系統回傳空統計
Then('系統回傳空統計：', async (world: TestWorld, dataTable: DataTable) => {
  const stats = world.currentPlayerStats
  expect(stats).toBeDefined()

  const row = dataTable.hashes()[0]
  if (row['平均球速'] === '-') {
    expect(stats.avgVelocity).toBe('-')
  }
  if (row['平均轉速'] === '-') {
    expect(stats.avgSpinRate).toBe('-')
  }
  if (row['好球率'] === '-') {
    expect(stats.strikeRate).toBe('-')
  }
  if (row['投球總數']) {
    expect(stats.totalPitches).toBe(Number.parseInt(row['投球總數']))
  }
})
