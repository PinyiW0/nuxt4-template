import type { H3Event } from 'h3'

export default defineEventHandler((_event: H3Event) => {
  return { status: 'success', message: '登出成功' }
})
