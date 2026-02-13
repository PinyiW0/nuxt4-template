export interface User {
  id: number
  account: string
  password: string
  role: string
  status: string
  failedAttempts: number
  lockedUntil: Date | null
}

export function createUserRepository() {
  const users = new Map<string, User>()
  let nextId = 1

  return {
    save(user: Omit<User, 'id'> & { id?: number }): User {
      const id = user.id ?? nextId++
      const savedUser: User = { ...user, id }
      users.set(savedUser.account, savedUser)
      return savedUser
    },

    findByAccount(account: string): User | undefined {
      return users.get(account)
    },

    update(account: string, data: Partial<User>): User | undefined {
      const user = users.get(account)
      if (!user)
        return undefined
      const updated = { ...user, ...data }
      users.set(account, updated)
      return updated
    },

    clear(): void {
      users.clear()
      nextId = 1
    },
  }
}

export type UserRepository = ReturnType<typeof createUserRepository>
