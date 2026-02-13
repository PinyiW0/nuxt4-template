import type { H3Event } from 'h3'
import { resetMockData } from '../../mock/data'

export default defineEventHandler(async (_event: H3Event) => {
  resetMockData()
  return { ok: true }
})
