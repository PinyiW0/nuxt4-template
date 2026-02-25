import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)

  if (!body.refresh_token || !body.refresh_token.startsWith('mock-refresh-')) {
    throw createError({ statusCode: 401, message: '請重新登入' })
  }

  return {
    status: 'success',
    data: {
      access_token: `mock-token-refreshed-${Date.now()}`,
    },
  }
})
