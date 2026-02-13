import type { H3Event } from 'h3'

import { mockUsers } from '../../mock/data/users'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const { account, password } = body

  if (!account || !password) {
    throw createError({ statusCode: 400, message: '請輸入帳號和密碼' })
  }

  const user = mockUsers.find(u => u.account === account)

  if (!user) {
    throw createError({ statusCode: 401, message: '帳號或密碼錯誤' })
  }

  // 檢查帳號鎖定
  if (user.locked_until) {
    const lockTime = new Date(user.locked_until)
    if (lockTime > new Date()) {
      throw createError({ statusCode: 403, message: '帳號已鎖定，請稍後再試' })
    }
  }

  if (user.password !== password) {
    throw createError({ statusCode: 401, message: '帳號或密碼錯誤' })
  }

  return {
    status: 'success',
    data: {
      access_token: `mock-token-${user.id}-${Date.now()}`,
      refresh_token: `mock-refresh-${user.id}-${Date.now()}`,
      user: {
        id: user.id,
        account: user.account,
        role: user.role,
      },
    },
  }
})
