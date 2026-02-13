import type { TestWorld } from '../../helpers/world'
import { Then } from 'quickpickle'
import { expect } from 'vitest'

Then('訓練 {string} 的狀態為 {string}', async (world: TestWorld, trainingId: string, status: string) => {
  const training = world.trainingRepository.findById(trainingId)
  expect(training).toBeDefined()
  expect(training!.status).toBe(status)
})

Then('投球 {string} 的狀態為 {string}', async (world: TestWorld, pitchId: string, status: string) => {
  const pitch = world.pitchRepository.findById(pitchId)
  expect(pitch).toBeDefined()
  expect(pitch!.status).toBe(status)
})

Then('訓練的好球帶身高預設為 {int} 公分', async (world: TestWorld, height: number) => {
  expect(world.lastCreatedTraining).toBeDefined()
  expect(world.lastCreatedTraining.strikeZoneHeight).toBe(height)
})

Then('訓練的好球帶身高為 {int} 公分', async (world: TestWorld, height: number) => {
  expect(world.lastCreatedTraining).toBeDefined()
  expect(world.lastCreatedTraining.strikeZoneHeight).toBe(height)
})

// Feature 19: 開啟單球儀表板
Then('開啟單球儀表板', async (world: TestWorld) => {
  expect(world.currentPitchDetail).toBeDefined()
  expect(world.currentPitchDetail.pitch).toBeDefined()
})

// Feature 19: 預設顯示九宮格視圖
Then('預設顯示九宮格視圖', async (world: TestWorld) => {
  expect(world.currentView).toBe('九宮格')
})

// Feature 19: 顯示好球帶框線
Then('顯示好球帶框線（上緣 {int}cm、下緣 {int}cm）', async (world: TestWorld, top: number, bottom: number) => {
  expect(world.currentPitchDetail).toBeDefined()
  expect(world.currentPitchDetail.strikeZoneTop).toBe(top)
  expect(world.currentPitchDetail.strikeZoneBottom).toBe(bottom)
})

// Feature 19: 顯示投球落點標記於位置
// 括號在 Cucumber Expression 中是 optional 語法，需要用 \( \) 轉義
Then('顯示投球落點標記於位置 \\({float}, {float}\\)', async (world: TestWorld, x: number, y: number) => {
  const pitch = world.currentPitchDetail.pitch
  expect(pitch.locationX).toBeCloseTo(x, 1)
  expect(pitch.locationY).toBeCloseTo(y, 1)
})

// Feature 19: 落點標記顏色為綠色（好球）
Then('落點標記顏色為綠色（好球）', async (world: TestWorld) => {
  const pitch = world.currentPitchDetail.pitch
  expect(pitch.isStrike).toBe(true)
})

// Feature 19: 落點標記顏色為紅色（壞球）
Then('落點標記顏色為紅色（壞球）', async (world: TestWorld) => {
  const pitch = world.currentPitchDetail.pitch
  expect(pitch.isStrike).toBe(false)
})

// Feature 19: 落點旁標註球速
Then('落點旁標註球速 {string}', async (world: TestWorld, speedLabel: string) => {
  const pitch = world.currentPitchDetail.pitch
  // speedLabel 格式: "125.5 km/h"
  const expectedSpeed = Number.parseFloat(speedLabel.replace(' km/h', ''))
  expect(pitch.speed).toBeCloseTo(expectedSpeed, 1)
})

// Feature 19: 切換顯示 3D 入壘軌跡視圖
Then('切換顯示 3D 入壘軌跡視圖', async (world: TestWorld) => {
  expect(world.currentView).toBe('3D軌跡')
})

// Feature 19: 隱藏九宮格視圖
Then('隱藏九宮格視圖', async (world: TestWorld) => {
  expect(world.currentView).not.toBe('九宮格')
})

// Feature 19: 切換顯示九宮格視圖
Then('切換顯示九宮格視圖', async (world: TestWorld) => {
  expect(world.currentView).toBe('九宮格')
})

// Feature 19: 隱藏 3D 軌跡視圖
Then('隱藏 3D 軌跡視圖', async (world: TestWorld) => {
  expect(world.currentView).not.toBe('3D軌跡')
})

// Feature 19: 顯示投球的 3D 入壘軌跡
Then('顯示投球的 3D 入壘軌跡', async (world: TestWorld) => {
  expect(world.currentView).toBe('3D軌跡')
  expect(world.currentPitchDetail).toBeDefined()
  expect(world.currentPitchDetail.pitch.trajectoryData).toBeDefined()
})

// Feature 19: 顯示好球帶立體框線
Then('顯示好球帶立體框線', async (world: TestWorld) => {
  expect(world.currentPitchDetail).toBeDefined()
  expect(world.currentPitchDetail.strikeZoneTop).toBeDefined()
  expect(world.currentPitchDetail.strikeZoneBottom).toBeDefined()
})

// Feature 19: 3D 軌跡視圖為隱藏狀態
Then('3D 軌跡視圖為隱藏狀態', async (world: TestWorld) => {
  expect(world.currentView).not.toBe('3D軌跡')
})
