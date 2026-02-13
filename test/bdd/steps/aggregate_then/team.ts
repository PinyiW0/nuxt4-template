import type { TestWorld } from '../../helpers/world'
import { Then } from 'quickpickle'
import { expect } from 'vitest'

Then('球隊 {string} 的建立者為 {string}', async (world: TestWorld, teamName: string, createdBy: string) => {
  const team = world.teamRepository.findByName(teamName)
  expect(team).toBeDefined()
  expect(team!.createdBy).toBe(createdBy)
})

Then('球隊 {string} 的狀態為 {string}', async (world: TestWorld, teamName: string, status: string) => {
  const team = world.teamRepository.findByName(teamName)
  expect(team).toBeDefined()
  expect(team!.status).toBe(status)
})
