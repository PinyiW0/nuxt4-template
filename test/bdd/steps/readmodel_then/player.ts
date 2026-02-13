import type { DataTable } from 'quickpickle'
import type { TestWorld } from '../../helpers/world'
import { Then } from 'quickpickle'
import { expect } from 'vitest'

Then('回傳以下球員：', async (world: TestWorld, dataTable: DataTable) => {
  const expected = dataTable.hashes()
  const items = world.queryResult.items

  expect(items).toHaveLength(expected.length)
  expected.forEach((row, index) => {
    expect(items[index].id).toBe(Number.parseInt(row.id))
    expect(items[index].number).toBe(Number.parseInt(row.number))
    expect(items[index].name).toBe(row.name)
    expect(items[index].height).toBe(Number.parseInt(row.height))
    expect(items[index].position).toBe(row.position)
    expect(items[index].teamName).toBe(row.team_name)
    expect(items[index].sortOrder).toBe(Number.parseInt(row.sort_order))
  })
})

Then('回傳所有 active 狀態的球員（共 {int} 筆）', async (world: TestWorld, count: number) => {
  expect(world.queryResult.items).toHaveLength(count)
})

Then('只回傳藍鷹隊的球員（共 {int} 筆）', async (world: TestWorld, count: number) => {
  const items = world.queryResult.items
  expect(items).toHaveLength(count)
  items.forEach((item: any) => {
    expect(item.teamName).toBe('藍鷹隊')
  })
})
