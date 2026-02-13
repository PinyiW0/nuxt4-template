import type { TestWorld } from '../../helpers/world'
import { When } from 'quickpickle'

When('教練查詢球員列表', async (world: TestWorld) => {
  try {
    world.queryResult = world.playerService.getPlayers({
      createdBy: world.currentUser,
      role: '教練',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('管理者查詢球員列表', async (world: TestWorld) => {
  try {
    world.queryResult = world.playerService.getPlayers({
      role: '管理者',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('管理者查詢球員列表，篩選球隊 {string}', async (world: TestWorld, teamName: string) => {
  try {
    world.queryResult = world.playerService.getPlayers({
      role: '管理者',
      teamName,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練查詢球員列表（未指定分頁參數）', async (world: TestWorld) => {
  try {
    world.queryResult = world.playerService.getPlayers({
      createdBy: world.currentUser,
      role: '教練',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})
