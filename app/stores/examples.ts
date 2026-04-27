interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

// Counter Store
export const useCounterStore = defineStore('counter', () => {
  // 狀態
  const count = ref(0)
  const name = ref('Counter')

  // Getters (computed)
  const doubleCount = computed(() => count.value * 2)
  const isEven = computed(() => count.value % 2 === 0)

  // Actions (methods)
  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = 0
  }

  function setCount(newCount: number) {
    count.value = newCount
  }

  // 回傳狀態和方法
  return {
    // 狀態
    count,
    name,
    // Getters
    doubleCount,
    isEven,
    // Actions
    increment,
    decrement,
    reset,
    setCount,
  }
})

// User Store
export const useUserStore = defineStore('user', () => {
  // 狀態
  const currentUser = ref<User | null>(null)
  const users = ref<User[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isLoggedIn = computed(() => !!currentUser.value)
  const userCount = computed(() => users.value.length)
  const hasError = computed(() => !!error.value)

  // Actions
  async function login(email: string, _password: string) {
    isLoading.value = true
    error.value = null

    try {
      // 模擬 API 呼叫
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 模擬登入成功
      currentUser.value = {
        id: 1,
        name: '測試使用者',
        email,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
      }
    }
    catch {
      error.value = '登入失敗'
    }
    finally {
      isLoading.value = false
    }
  }

  function logout() {
    currentUser.value = null
    error.value = null
  }

  async function fetchUsers() {
    isLoading.value = true
    error.value = null

    try {
      // 模擬 API 呼叫
      await new Promise(resolve => setTimeout(resolve, 800))

      users.value = [
        { id: 1, name: '張小明', email: 'zhang@example.com' },
        { id: 2, name: '李小華', email: 'li@example.com' },
        { id: 3, name: '王小美', email: 'wang@example.com' },
      ]
    }
    catch {
      error.value = '獲取使用者列表失敗'
    }
    finally {
      isLoading.value = false
    }
  }

  function addUser(user: Omit<User, 'id'>) {
    const newUser: User = {
      ...user,
      id: Math.max(...users.value.map((u: User) => u.id), 0) + 1,
    }
    users.value.push(newUser)
  }

  function removeUser(id: number) {
    const index = users.value.findIndex((user: User) => user.id === id)
    if (index > -1) {
      users.value.splice(index, 1)
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // 狀態
    currentUser: readonly(currentUser),
    users: readonly(users),
    isLoading: readonly(isLoading),
    error: readonly(error),
    // Getters
    isLoggedIn,
    userCount,
    hasError,
    // Actions
    login,
    logout,
    fetchUsers,
    addUser,
    removeUser,
    clearError,
  }
})
