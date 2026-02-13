import type { DataTable } from 'quickpickle'
import type { TestWorld } from '../../helpers/world'
import { When } from 'quickpickle'

When('教練在 {string} 新增球員：', async (world: TestWorld, teamName: string, dataTable: DataTable) => {
  try {
    const row = dataTable.hashes()[0]
    world.playerService.createPlayer({
      teamName,
      number: Number.parseInt(row['背號'] || row.number),
      name: row['姓名'] || row.name,
      height: Number.parseInt(row['身高'] || row.height),
      position: row['守備位置'] || row.position,
      createdBy: world.currentUser!,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練在 {string} 新增球員背號為 {int}', async (world: TestWorld, teamName: string, number: number) => {
  try {
    world.playerService.createPlayer({
      teamName,
      number,
      name: '測試球員',
      height: 175,
      position: '投手',
      createdBy: world.currentUser!,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練在 {string} 新增球員身高為 {int} 公分', async (world: TestWorld, teamName: string, height: number) => {
  try {
    world.playerService.createPlayer({
      teamName,
      number: 99,
      name: '測試球員',
      height,
      position: '投手',
      createdBy: world.currentUser!,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練在 {string} 新增球員守備位置為 {string}', async (world: TestWorld, teamName: string, position: string) => {
  try {
    world.playerService.createPlayer({
      teamName,
      number: 99,
      name: '測試球員',
      height: 175,
      position,
      createdBy: world.currentUser!,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練在 {string} 新增球員姓名為 {string}', async (world: TestWorld, teamName: string, name: string) => {
  try {
    world.playerService.createPlayer({
      teamName,
      number: 99,
      name,
      height: 175,
      position: '投手',
      createdBy: world.currentUser!,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練在 {string} 新增球員', async (world: TestWorld, teamName: string) => {
  try {
    world.playerService.createPlayer({
      teamName,
      number: 99,
      name: '測試球員',
      height: 175,
      position: '投手',
      createdBy: world.currentUser!,
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

// === 編輯球員 ===

When('教練將球員 {string} 的身高修改為 {int} 公分', async (world: TestWorld, playerName: string, height: number) => {
  try {
    world.playerService.updatePlayer({
      playerName,
      updates: { height },
      updatedBy: world.currentUser!,
      role: world.currentUserRole || '教練',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練將球員 {string} 的背號修改為 {int}', async (world: TestWorld, playerName: string, number: number) => {
  try {
    world.playerService.updatePlayer({
      playerName,
      updates: { number },
      updatedBy: world.currentUser!,
      role: '教練',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練將球員 {string} 的守備位置修改為 {string}', async (world: TestWorld, playerName: string, position: string) => {
  try {
    world.playerService.updatePlayer({
      playerName,
      updates: { position },
      updatedBy: world.currentUser!,
      role: '教練',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('管理者將球員 {string} 的身高修改為 {int} 公分', async (world: TestWorld, playerName: string, height: number) => {
  try {
    world.playerService.updatePlayer({
      playerName,
      updates: { height },
      updatedBy: world.currentUser!,
      role: '管理者',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

// === 刪除球員 ===

When('教練刪除球員 {string}', async (world: TestWorld, playerName: string) => {
  try {
    world.playerService.deletePlayer({
      playerName,
      deletedBy: world.currentUser!,
      role: '教練',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('管理者刪除球員 {string}', async (world: TestWorld, playerName: string) => {
  try {
    world.playerService.deletePlayer({
      playerName,
      deletedBy: world.currentUser!,
      role: '管理者',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

// === 調整排序 ===

When('教練將球隊 {string} 的球員排序調整為：', async (world: TestWorld, teamName: string, dataTable: DataTable) => {
  try {
    const rows = dataTable.hashes()
    const order = rows.map(row => ({
      name: row['姓名'] || row.name,
      sortOrder: Number.parseInt(row['排序'] || row.sort_order),
    }))
    world.playerService.reorderPlayers({
      teamName,
      order,
      reorderedBy: world.currentUser!,
      role: '教練',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('教練調整球隊 {string} 的球員排序', async (world: TestWorld, teamName: string) => {
  try {
    world.playerService.reorderPlayers({
      teamName,
      order: [],
      reorderedBy: world.currentUser!,
      role: '教練',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})

When('管理者調整球隊 {string} 的球員排序', async (world: TestWorld, teamName: string) => {
  try {
    world.playerService.reorderPlayers({
      teamName,
      order: [],
      reorderedBy: world.currentUser!,
      role: '管理者',
    })
    world.operationResult = { success: true }
  }
  catch (error: any) {
    world.operationResult = { success: false, message: error.message }
  }
})
