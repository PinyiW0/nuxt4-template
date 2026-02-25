import type { H3Event } from 'h3'

import { mockUsers } from '../../mock/data/users'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const user = mockUsers.find(u => u.account === body.account)

  if (!user) {
    throw createError({ statusCode: 401, message: '帳號或密碼錯誤' })
  }

  // 檢查帳號鎖定
  if (user.locked_until) {
    const lockTime = new Date(user.locked_until)
    if (lockTime > new Date()) {
      throw createError({ statusCode: 423, message: '帳號已鎖定，請稍後再試' })
    }
    // 鎖定已過期，重置
    user.locked_until = null
    user.failed_attempts = 0
  }

  if (user.password !== body.password) {
    user.failed_attempts++
    if (user.failed_attempts >= 5) {
      user.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString()
      throw createError({ statusCode: 423, message: '帳號已鎖定，請 15 分鐘後再試' })
    }
    throw createError({ statusCode: 401, message: '帳號或密碼錯誤' })
  }

  // 登入成功，重置失敗次數
  user.failed_attempts = 0

  return {
    status: 'success',
    data: {
      access_token: `mock-token-${user.id}-${Date.now()}`,
      refresh_token: `mock-refresh-${user.id}-${Date.now()}`,
      user: { id: user.id, account: user.account, role: user.role },
    },
  }
})
