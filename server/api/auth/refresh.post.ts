import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const { refresh_token } = body

  if (!refresh_token) {
    throw createError({ statusCode: 401, message: 'refresh token 無效' })
  }

  return {
    status: 'success',
    data: {
      access_token: `mock-token-refreshed-${Date.now()}`,
      refresh_token: `mock-refresh-new-${Date.now()}`,
    },
  }
})
