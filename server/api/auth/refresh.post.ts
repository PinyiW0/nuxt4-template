export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { refreshToken } = body

  if (!refreshToken) {
    throw createError({
      statusCode: 400,
      message: 'Refresh Token 為必填',
    })
  }

  // Mock: 檢查 refresh token 格式
  if (!refreshToken.startsWith('mock-refresh-token-')) {
    throw createError({
      statusCode: 401,
      message: '請重新登入',
    })
  }

  // 從 token 提取帳號
  const parts = refreshToken.split('-')
  const account = parts[3]

  // 生成新的 access token
  const newAccessToken = `mock-access-token-${account}-${Date.now()}`

  return {
    status: 'success',
    data: {
      accessToken: newAccessToken,
    },
  }
})
