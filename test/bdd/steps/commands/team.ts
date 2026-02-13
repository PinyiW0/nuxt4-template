import type { TestWorld } from '../../helpers/world'
import { When } from 'quickpickle'

When('教練建立球隊名稱為 {string}', async (world: TestWorld, name: string) => {
  try {
    world.teamService.createTeam({
      name,
      createdBy: world.currentUser!,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練將球隊 {string} 的名稱修改為 {string}', async (world: TestWorld, teamName: string, newName: string) => {
  try {
    world.teamService.updateTeam({
      teamName,
      newName,
      updatedBy: world.currentUser!,
      role: '教練',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('管理者將球隊 {string} 的名稱修改為 {string}', async (world: TestWorld, teamName: string, newName: string) => {
  try {
    world.teamService.updateTeam({
      teamName,
      newName,
      updatedBy: world.currentUser!,
      role: '管理者',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練刪除球隊 {string}', async (world: TestWorld, teamName: string) => {
  try {
    world.teamService.deleteTeam({
      teamName,
      deletedBy: world.currentUser!,
      role: '教練',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('管理者刪除球隊 {string}', async (world: TestWorld, teamName: string) => {
  try {
    world.teamService.deleteTeam({
      teamName,
      deletedBy: world.currentUser!,
      role: '管理者',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})
