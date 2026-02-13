import type { DataTable } from 'quickpickle'
import type { TestWorld } from '../../helpers/world'
import { Given } from 'quickpickle'
import { createTeamRepository } from '../../helpers/teamRepository'
import { createTeamService } from '../../helpers/teamService'

Given('系統中有以下球隊：', async (world: TestWorld, dataTable: DataTable) => {
  const teams = dataTable.hashes()

  world.teamRepository = createTeamRepository()
  world.teamService = createTeamService({
    teamRepository: world.teamRepository,
    eventBus: world.eventBus,
    playerRepository: world.playerRepository,
  })

  teams.forEach((row) => {
    world.teamRepository.save({
      id: row.id ? Number.parseInt(row.id) : undefined,
      name: row.name || row['名稱'],
      createdBy: row.created_by || row['建立者'],
      playerCount: Number.parseInt(row.player_count || row['球員數量'] || '0'),
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
      status: row.status || row['狀態'] || 'active',
    })
  })
})

Given('系統中有球隊 {string} 由 {string} 建立', async (world: TestWorld, teamName: string, createdBy: string) => {
  world.teamRepository.save({
    name: teamName,
    createdBy,
    playerCount: 0,
    createdAt: new Date(),
    status: 'active',
  })
})

Given('球隊 {string} 已被刪除', async (world: TestWorld, teamName: string) => {
  const team = world.teamRepository.findByName(teamName)
  if (team) {
    world.teamRepository.update(team.id, { status: 'deleted' })
  }
})
