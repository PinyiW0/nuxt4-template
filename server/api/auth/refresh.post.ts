import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const { refresh_token } = body as { refresh_token: string }

  if (!refresh_token || !refresh_token.startsWith('mock-refresh-')) {
    throw createError({ statusCode: 401, message: '請重新登入' })
  }

  return {
    status: 'success' as const,
    data: {
      access_token: `mock-token-refreshed-${Date.now()}`,
    },
  }
})
