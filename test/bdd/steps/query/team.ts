import type { TestWorld } from '../../helpers/world'
import { When } from 'quickpickle'

When('教練查詢球隊列表', async (world: TestWorld) => {
  try {
    world.queryResult = world.teamService.getTeams({
      createdBy: world.currentUser,
      role: '教練',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('管理者查詢球隊列表', async (world: TestWorld) => {
  try {
    world.queryResult = world.teamService.getTeams({
      role: '管理者',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練查詢球隊列表（未指定分頁參數）', async (world: TestWorld) => {
  try {
    world.queryResult = world.teamService.getTeams({
      createdBy: world.currentUser,
      role: '教練',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('管理者查詢球隊列表，每頁 {int} 筆', async (world: TestWorld, pageSize: number) => {
  try {
    world.queryResult = world.teamService.getTeams({
      role: '管理者',
      pageSize,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})
