import { findUserByAccount, isUserLocked, users } from '../../mock/data/users'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { account, password } = body

  if (!account || !password) {
    throw createError({
      statusCode: 400,
      message: '帳號和密碼為必填',
    })
  }

  const user = findUserByAccount(account)

  // 帳號不存在
  if (!user) {
    throw createError({
      statusCode: 401,
      message: '帳號或密碼錯誤',
    })
  }

  // 帳號已鎖定
  if (isUserLocked(user)) {
    throw createError({
      statusCode: 403,
      message: '帳號已鎖定，請稍後再試',
    })
  }

  // 密碼錯誤
  if (user.password !== password) {
    // 增加失敗次數
    const userRecord = users.find(u => u.account === account)
    if (userRecord) {
      userRecord.failed_attempts++

      // 第5次失敗後鎖定
      if (userRecord.failed_attempts >= 5) {
        userRecord.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString()
        throw createError({
          statusCode: 403,
          message: '帳號已鎖定，請 15 分鐘後再試',
        })
      }
    }

    throw createError({
      statusCode: 401,
      message: '帳號或密碼錯誤',
    })
  }

  // 登入成功，重置失敗次數
  const userRecord = users.find(u => u.account === account)
  if (userRecord) {
    userRecord.failed_attempts = 0
    userRecord.locked_until = null
  }

  // 生成模擬 Token
  const accessToken = `mock-access-token-${account}-${Date.now()}`
  const refreshToken = `mock-refresh-token-${account}-${Date.now()}`

  return {
    status: 'success',
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        account: user.account,
        role: user.role,
      },
    },
  }
})
