<script setup lang="ts">
useHead({
  title: 'Pinia Store 測試',
  meta: [
    { name: 'description', content: '測試 Pinia 狀態管理功能' },
  ],
})

// 使用 stores
const counter = useCounterStore()
const user = useUserStore()

// 本地狀態
const loginEmail = ref('test@example.com')
const loginPassword = ref('123456')
const newUserName = ref('')
const newUserEmail = ref('')
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
    <div class="container mx-auto px-4 py-8">
      <!-- 標題區塊 -->
      <div class="mb-12 text-center">
        <h1 class="mb-4 text-4xl font-bold text-gray-800">
          Pinia Store 測試
        </h1>
        <p class="mb-6 text-xl text-gray-600">
          狀態管理功能展示
        </p>
        <div class="flex justify-center space-x-3">
          <span class="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
            Pinia
          </span>
          <span class="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            State Management
          </span>
          <span class="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            Composition API
          </span>
        </div>
      </div>

      <!-- 測試卡片 -->
      <div class="mb-8 grid gap-8 lg:grid-cols-2">
        <!-- 計數器 Store 測試 -->
        <div class="rounded-xl border-l-4 border-purple-500 bg-white p-6 shadow-lg">
          <h2 class="mb-4 flex items-center text-2xl font-semibold text-purple-600">
            <svg class="mr-2 size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            計數器 Store
          </h2>
          <div class="space-y-4">
            <div class="rounded-lg bg-purple-50 p-4">
              <div class="mb-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-600">目前計數:</span>
                  <span class="ml-2 font-mono text-lg font-bold text-purple-600">{{ counter.count }}</span>
                </div>
                <div>
                  <span class="text-gray-600">雙倍:</span>
                  <span class="ml-2 font-mono text-lg font-bold text-purple-600">{{ counter.doubleCount }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Store 名稱:</span>
                  <span class="ml-2 font-semibold text-purple-600">{{ counter.name }}</span>
                </div>
                <div>
                  <span class="text-gray-600">是否為偶數:</span>
                  <span class="ml-2 font-semibold" :class="counter.isEven ? 'text-green-600' : 'text-red-600'">
                    {{ counter.isEven ? '是' : '否' }}
                  </span>
                </div>
              </div>
              <div class="flex space-x-2">
                <button
                  class="rounded bg-purple-500 px-3 py-1 text-sm text-white transition-colors hover:bg-purple-600"
                  @click="counter.increment"
                >
                  +1
                </button>
                <button
                  class="rounded bg-purple-500 px-3 py-1 text-sm text-white transition-colors hover:bg-purple-600"
                  @click="counter.decrement"
                >
                  -1
                </button>
                <button
                  class="rounded bg-gray-500 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-600"
                  @click="counter.reset"
                >
                  重置
                </button>
                <button
                  class="rounded bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600"
                  @click="counter.setCount(Math.floor(Math.random() * 100))"
                >
                  隨機數
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 使用者 Store 測試 -->
        <div class="rounded-xl border-l-4 border-blue-500 bg-white p-6 shadow-lg">
          <h2 class="mb-4 flex items-center text-2xl font-semibold text-blue-600">
            <svg class="mr-2 size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            使用者 Store
          </h2>
          <div class="space-y-4">
            <!-- 使用者狀態 -->
            <div class="rounded-lg bg-blue-50 p-4">
              <div class="mb-3">
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-gray-600">登入狀態:</span>
                  <span class="rounded-full px-2 py-1 text-xs font-medium" :class="user.isLoggedIn ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ user.isLoggedIn ? '已登入' : '未登入' }}
                  </span>
                </div>
                <div v-if="user.currentUser" class="text-sm">
                  <p><strong>姓名:</strong> {{ user.currentUser.name }}</p>
                  <p><strong>信箱:</strong> {{ user.currentUser.email }}</p>
                </div>
              </div>

              <!-- 登入表單 -->
              <div v-if="!user.isLoggedIn" class="space-y-2">
                <input
                  v-model="loginEmail"
                  type="email"
                  placeholder="信箱"
                  class="w-full rounded border px-3 py-1 text-sm focus:border-blue-500 focus:outline-none"
                >
                <input
                  v-model="loginPassword"
                  type="password"
                  placeholder="密碼"
                  class="w-full rounded border px-3 py-1 text-sm focus:border-blue-500 focus:outline-none"
                >
                <button
                  :disabled="user.isLoading"
                  class="w-full rounded bg-blue-500 py-2 text-sm text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  @click="user.login(loginEmail, loginPassword)"
                >
                  {{ user.isLoading ? '登入中...' : '登入' }}
                </button>
              </div>

              <!-- 登出按鈕 -->
              <div v-else>
                <button
                  class="w-full rounded bg-red-500 py-2 text-sm text-white transition-colors hover:bg-red-600"
                  @click="user.logout"
                >
                  登出
                </button>
              </div>

              <!-- 錯誤訊息 -->
              <div v-if="user.hasError" class="mt-2 rounded bg-red-100 p-2 text-sm text-red-700">
                {{ user.error }}
                <button
                  class="ml-2 text-red-500 underline"
                  @click="user.clearError"
                >
                  清除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用者列表管理 -->
      <div class="mb-8 rounded-xl bg-white p-6 shadow-lg">
        <h2 class="mb-4 flex items-center text-2xl font-semibold text-green-600">
          <svg class="mr-2 size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          使用者列表管理
          <span class="ml-2 rounded-full bg-green-100 px-2 py-1 text-sm text-green-800">
            {{ user.userCount }} 位使用者
          </span>
        </h2>

        <div class="grid gap-6 lg:grid-cols-2">
          <!-- 載入使用者列表 -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-700">
                使用者列表
              </h3>
              <button
                :disabled="user.isLoading"
                class="rounded bg-green-500 px-4 py-2 text-sm text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                @click="user.fetchUsers"
              >
                {{ user.isLoading ? '載入中...' : '載入使用者' }}
              </button>
            </div>

            <!-- 使用者清單 -->
            <div v-if="user.users.length > 0" class="space-y-2">
              <div
                v-for="userData in user.users"
                :key="userData.id"
                class="flex items-center justify-between rounded border p-3"
              >
                <div>
                  <p class="font-semibold">
                    {{ userData.name }}
                  </p>
                  <p class="text-sm text-gray-600">
                    {{ userData.email }}
                  </p>
                </div>
                <button
                  class="rounded bg-red-500 px-2 py-1 text-xs text-white transition-colors hover:bg-red-600"
                  @click="user.removeUser(userData.id)"
                >
                  刪除
                </button>
              </div>
            </div>

            <div v-else-if="!user.isLoading" class="rounded bg-gray-50 p-4 text-center text-gray-500">
              暫無使用者資料，點擊「載入使用者」獲取測試資料
            </div>
          </div>

          <!-- 新增使用者 -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-700">
              新增使用者
            </h3>
            <div class="space-y-3">
              <input
                v-model="newUserName"
                type="text"
                placeholder="姓名"
                class="w-full rounded border px-3 py-2 focus:border-green-500 focus:outline-none"
              >
              <input
                v-model="newUserEmail"
                type="email"
                placeholder="信箱"
                class="w-full rounded border px-3 py-2 focus:border-green-500 focus:outline-none"
              >
              <button
                :disabled="!newUserName || !newUserEmail"
                class="w-full rounded bg-green-500 py-2 text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                @click="() => {
                  user.addUser({ name: newUserName, email: newUserEmail })
                  newUserName = ''
                  newUserEmail = ''
                }"
              >
                新增使用者
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Store 狀態檢視 -->
      <div class="mb-8 rounded-xl bg-white p-6 shadow-lg">
        <h2 class="mb-4 text-2xl font-semibold text-gray-800">
          Store 狀態檢視 (開發用)
        </h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded border p-4">
            <h3 class="mb-2 font-semibold text-purple-600">
              Counter Store
            </h3>
            <pre class="overflow-x-auto text-xs"><code>{{ {
              count: counter.count,
              name: counter.name,
              doubleCount: counter.doubleCount,
              isEven: counter.isEven,
            } }}</code></pre>
          </div>
          <div class="rounded border p-4">
            <h3 class="mb-2 font-semibold text-blue-600">
              User Store
            </h3>
            <pre class="overflow-x-auto text-xs"><code>{{ {
              isLoggedIn: user.isLoggedIn,
              userCount: user.userCount,
              hasError: user.hasError,
              isLoading: user.isLoading,
              currentUser: user.currentUser,
            } }}</code></pre>
          </div>
        </div>
      </div>

      <!-- 導航 -->
      <div class="text-center">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center font-medium text-blue-600 hover:text-blue-800"
        >
          <svg class="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回範例頁面
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
