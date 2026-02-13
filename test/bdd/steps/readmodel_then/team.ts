import type { DataTable } from 'quickpickle'
import type { TestWorld } from '../../helpers/world'
import { Then } from 'quickpickle'
import { expect } from 'vitest'

Then('回傳以下球隊：', async (world: TestWorld, dataTable: DataTable) => {
  const expected = dataTable.hashes()
  const items = world.queryResult.items

  expect(items).toHaveLength(expected.length)
  expected.forEach((row, index) => {
    expect(items[index].id).toBe(Number.parseInt(row.id))
    expect(items[index].name).toBe(row.name)
    expect(items[index].playerCount).toBe(Number.parseInt(row.player_count))
    expect(items[index].createdBy).toBe(row.created_by)
  })
})

Then('回傳所有 active 狀態的球隊（共 {int} 筆）', async (world: TestWorld, count: number) => {
  expect(world.queryResult.items).toHaveLength(count)
})

Then('第一筆為 {string}（較新建立）', async (world: TestWorld, name: string) => {
  expect(world.queryResult.items[0].name).toBe(name)
})

Then('第二筆為 {string}（較早建立）', async (world: TestWorld, name: string) => {
  expect(world.queryResult.items[1].name).toBe(name)
})

Then('每筆資料包含以下欄位：', async (world: TestWorld, dataTable: DataTable) => {
  const expectedFields = dataTable.hashes().map(row => row.field)
  const items = world.queryResult.items

  expect(items.length).toBeGreaterThan(0)

  const fieldMapping: Record<string, string> = {
    id: 'id',
    name: 'name',
    player_count: 'playerCount',
    created_at: 'createdAt',
    created_by: 'createdBy',
    number: 'number',
    height: 'height',
    position: 'position',
    team_name: 'teamName',
    sort_order: 'sortOrder',
    date: 'date',
    player_name: 'playerName',
    pitch_count: 'pitchCount',
    ai_status: 'aiStatus',
    training_count: 'trainingCount',
    total_pitches: 'totalPitches',
    last_training_date: 'lastTrainingDate',
    avg_velocity: 'avgVelocity',
  }

  items.forEach((item: any) => {
    expectedFields.forEach((field) => {
      const mappedField = fieldMapping[field] || field
      expect(item).toHaveProperty(mappedField)
    })
  })
})

Then('回傳第 {int} 頁', async (world: TestWorld, page: number) => {
  expect(world.queryResult.page).toBe(page)
})

Then('每頁筆數為 {int}', async (world: TestWorld, pageSize: number) => {
  expect(world.queryResult.pageSize).toBe(pageSize)
})

Then('結果不包含 {string}（已刪除）', async (world: TestWorld, name: string) => {
  const names = world.queryResult.items.map((item: any) => item.name)
  expect(names).not.toContain(name)
})
