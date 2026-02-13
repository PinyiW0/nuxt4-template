// 模擬 Nitro auto-import 的全域函式
// 在 unit test 環境中，h3 的 defineEventHandler / readBody / getQuery / createError
// 是 Nitro 自動注入的全域變數，需要手動提供

import { vi } from 'vitest'

// readBody mock（各測試檔案會用 vi.mocked 覆蓋）
const readBody = vi.fn()

// getQuery mock
const getQuery = vi.fn()

// getRouterParam mock
const getRouterParam = vi.fn()

// createError：建立帶 statusCode 的 Error
function createError(opts: any) {
  const err = new Error(opts.message) as any
  err.statusCode = opts.statusCode
  return err
}

// defineEventHandler：直接回傳 handler function
const defineEventHandler = (handler: any) => handler

// 注入全域
Object.assign(globalThis, {
  defineEventHandler,
  readBody,
  getQuery,
  getRouterParam,
  createError,
})
