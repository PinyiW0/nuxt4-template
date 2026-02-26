import type { H3Event } from 'h3'

import { mockUsers } from '../../mock/data/users'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const { account, password } = body as { account: string, password: string }

  const user = mockUsers.find(u => u.account === account)

  if (!user) {
    throw createError({ statusCode: 401, message: '帳號或密碼錯誤' })
  }

  // 帳號鎖定檢查
  if (user.locked_until) {
    const lockedUntil = new Date(user.locked_until)
    if (lockedUntil > new Date()) {
      throw createError({ statusCode: 403, message: '帳號已鎖定，請稍後再試' })
    }
  }

  if (user.password !== password) {
    user.failed_attempts += 1
    if (user.failed_attempts >= 5) {
      user.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString()
      throw createError({ statusCode: 403, message: '帳號已鎖定，請 15 分鐘後再試' })
    }
    throw createError({ statusCode: 401, message: '帳號或密碼錯誤' })
  }

  // 登入成功，重置失敗次數
  user.failed_attempts = 0
  user.locked_until = null

  return {
    status: 'success' as const,
    data: {
      access_token: `mock-token-${user.id}-${Date.now()}`,
      refresh_token: `mock-refresh-${user.id}-${Date.now()}`,
      user: { id: user.id, account: user.account, role: user.role },
    },
  }
})
