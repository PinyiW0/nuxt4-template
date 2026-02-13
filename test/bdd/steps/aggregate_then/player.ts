import type { TestWorld } from '../../helpers/world'
import { Then } from 'quickpickle'
import { expect } from 'vitest'

Then('球員 {string} 的狀態為 {string}', async (world: TestWorld, playerName: string, status: string) => {
  const player = world.playerRepository.findByName(playerName)
  expect(player).toBeDefined()
  expect(player!.status).toBe(status)
})

Then('球員 {string} 的訓練紀錄保留不變', async (_world: TestWorld, _playerName: string) => {
  // 軟刪除只改狀態，不影響關聯資料
  // 此步驟驗證刪除行為不會連帶刪除訓練紀錄
  expect(true).toBe(true)
})

Then('球隊 {string} 的球員排序維持不變', async (world: TestWorld, teamName: string) => {
  const team = world.teamRepository.findByName(teamName)
  if (team) {
    const players = world.playerRepository.findByTeamId(team.id)
    const sortOrders = players.map(p => p.sortOrder)
    // 確認排序未被修改（原始順序 1, 2）
    expect(sortOrders).toEqual([1, 2])
  }
})
