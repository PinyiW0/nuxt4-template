<script setup lang="ts">
// TypeScript 介面定義
interface User {
  id: number
  name: string
  email: string
  age: number
}

interface Item {
  id: number
  name: string
  description: string
}

interface ApiResponse<T> {
  status: 'success' | 'error' | 'loading'
  message: string
  data: T[]
}

// 列舉定義
enum Status {
  PENDING = 'pending',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

// SEO 設定
useHead({
  title: 'Nuxt 4 + TypeScript + Tailwind 整合測試',
  meta: [
    { name: 'description', content: '測試 Nuxt 4、TypeScript 和 Tailwind CSS 的整合功能' },
  ],
})

// 響應式資料
const count = ref(0)
const currentTime = ref('')

// 避免 hydration mismatch 的標記
const isClient = ref(false)

// TypeScript 型別化的響應式資料
const user = reactive<User>({
  id: 1,
  name: '張小明',
  email: 'zhang@example.com',
  age: 28,
})

// 泛型陣列
const numbers = ref<number[]>([1, 2, 3])
const strings = ref<string[]>(['nuxt', 'typescript', 'tailwind'])

// API 回應
const apiResponse = ref<ApiResponse<Item>>({
  status: 'success',
  message: '尚未載入',
  data: [],
})

// 列舉狀態
const currentStatus = ref<Status>(Status.SUCCESS)
const currentTheme = ref<Theme>(Theme.LIGHT)

// 環境檢查 - 使用 computed 避免 hydration 問題
const environmentInfo = computed(() => {
  if (!isClient.value) {
    return {
      isDev: 'N/A',
      isServer: 'N/A',
    }
  }
  return {
    isDev: import.meta.dev ? '是' : '否',
    isServer: import.meta.server ? '是' : '否',
  }
})

// 泛型函式
function addToArray<T>(arr: T[], item: T): void {
  arr.push(item)
}

// 方法
function increment(): void {
  count.value++
}

function addNumber(): void {
  const randomNum = Math.floor(Math.random() * 100)
  addToArray(numbers.value, randomNum)
}

function addString(): void {
  const randomStrings = ['vue', 'vite', 'nitro', 'typescript', 'tailwind']
  const randomIndex = Math.floor(Math.random() * randomStrings.length)
  addToArray(strings.value, randomStrings[randomIndex])
}

async function mockApiCall(): Promise<void> {
  apiResponse.value.status = 'loading'
  apiResponse.value.message = '載入中...'
  apiResponse.value.data = []

  try {
    // 呼叫 Nuxt server API
    const data = await $fetch<ApiResponse<Item>>('/api/examples/items')

    apiResponse.value = {
      status: data.status,
      message: data.message,
      data: data.data,
    }
  }
  catch (error) {
    apiResponse.value = {
      status: 'error',
      message: `API 呼叫失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      data: [],
    }
  }
}

// 定時器更新時間
onMounted(() => {
  isClient.value = true
  currentTime.value = new Date().toLocaleString()

  setInterval(() => {
    currentTime.value = new Date().toLocaleString()
  }, 1000)
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
    <div class="container mx-auto px-4 py-8">
      <!-- 標題區塊 -->
      <div class="mb-12 text-center">
        <h1 class="mb-4 text-4xl font-bold text-gray-800">
          Nuxt 4 + TypeScript + Tailwind CSS
        </h1>
        <p class="mb-6 text-xl text-gray-600">
          整合功能測試頁面
        </p>
        <div class="flex justify-center space-x-3">
          <span class="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            Nuxt 4.2.1
          </span>
          <span class="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            TypeScript
          </span>
          <span class="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
            Tailwind CSS
          </span>
        </div>
      </div>

      <!-- 功能測試卡片 -->
      <div class="mb-8 grid gap-8 lg:grid-cols-2">
        <!-- Nuxt 響應式資料測試 -->
        <div class="rounded-xl border-l-4 border-green-500 bg-white p-6 shadow-lg">
          <h2 class="mb-4 flex items-center text-2xl font-semibold text-green-600">
            <svg class="mr-2 size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Nuxt 響應式資料
          </h2>
          <div class="space-y-4">
            <div class="rounded-lg bg-gray-50 p-4">
              <p class="mb-2 text-gray-700">
                點擊次數: <span class="font-mono text-lg text-green-600">{{ count }}</span>
              </p>
              <button
                class="rounded-lg bg-green-500 px-4 py-2 font-medium text-white transition-colors hover:bg-green-600"
                @click="increment"
              >
                增加計數器
              </button>
            </div>
            <div class="rounded-lg bg-yellow-50 p-4">
              <p class="mb-1 text-gray-700">
                即時時間:
              </p>
              <ClientOnly>
                <p class="font-mono text-sm text-yellow-700">
                  {{ currentTime || '載入中...' }}
                </p>
                <template #fallback>
                  <p class="font-mono text-sm text-gray-400">
                    載入中...
                  </p>
                </template>
              </ClientOnly>
            </div>
          </div>
        </div>

        <!-- TypeScript 型別安全測試 -->
        <div class="rounded-xl border-l-4 border-blue-500 bg-white p-6 shadow-lg">
          <h2 class="mb-4 flex items-center text-2xl font-semibold text-blue-600">
            <svg class="mr-2 size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            TypeScript 型別安全
          </h2>
          <div class="space-y-4">
            <div class="rounded-lg bg-blue-50 p-4">
              <p class="mb-1 text-gray-700">
                使用者資訊 (User 介面):
              </p>
              <p class="text-sm">
                <strong>姓名:</strong> {{ user.name }}
              </p>
              <p class="text-sm">
                <strong>年齡:</strong> {{ user.age }}
              </p>
              <p class="text-sm">
                <strong>信箱:</strong> {{ user.email }}
              </p>
            </div>
            <div class="rounded-lg bg-purple-50 p-4">
              <p class="mb-2 text-gray-700">
                狀態管理 (Enum):
              </p>
              <div class="flex space-x-2">
                <button
                  v-for="status in Object.values(Status)"
                  :key="status"
                  class="rounded px-3 py-1 text-sm font-medium transition-colors" :class="[
                    currentStatus === status
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                  ]"
                  @click="currentStatus = status"
                >
                  {{ status }}
                </button>
              </div>
              <p class="mt-2 text-sm text-gray-600">
                目前狀態: <span class="font-semibold">{{ currentStatus }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- 泛型函式測試 -->
        <div class="rounded-xl border-l-4 border-purple-500 bg-white p-6 shadow-lg">
          <h2 class="mb-4 flex items-center text-2xl font-semibold text-purple-600">
            <svg class="mr-2 size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
            泛型函式測試
          </h2>
          <div class="space-y-4">
            <div class="rounded-lg bg-indigo-50 p-4">
              <p class="mb-2 text-gray-700">
                數字陣列: <span class="font-mono">{{ numbers }}</span>
              </p>
              <button
                class="rounded bg-indigo-500 px-3 py-1 text-sm text-white transition-colors hover:bg-indigo-600"
                @click="addNumber"
              >
                新增隨機數字
              </button>
            </div>
            <div class="rounded-lg bg-pink-50 p-4">
              <p class="mb-2 text-gray-700">
                字串陣列: <span class="font-mono">{{ strings }}</span>
              </p>
              <button
                class="rounded bg-pink-500 px-3 py-1 text-sm text-white transition-colors hover:bg-pink-600"
                @click="addString"
              >
                新增技術名詞
              </button>
            </div>
          </div>
        </div>

        <!-- API 型別測試 -->
        <div class="rounded-xl border-l-4 border-orange-500 bg-white p-6 shadow-lg">
          <h2 class="mb-4 flex items-center text-2xl font-semibold text-orange-600">
            <svg class="mr-2 size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Nuxt Server API
          </h2>
          <div class="space-y-4">
            <div class="rounded-lg bg-orange-50 p-4">
              <div class="mb-2 flex items-center justify-between">
                <span class="text-gray-700">狀態:</span>
                <span
                  class="rounded-full px-2 py-1 text-xs font-medium" :class="[
                    apiResponse.status === 'success' ? 'bg-green-100 text-green-800'
                    : apiResponse.status === 'loading' ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{ apiResponse.status }}
                </span>
              </div>
              <p class="mb-2 text-gray-700">
                訊息: {{ apiResponse.message }}
              </p>
              <p class="mb-3 text-gray-700">
                資料筆數: {{ apiResponse.data.length }}
              </p>

              <!-- 顯示 API 資料 -->
              <div v-if="apiResponse.data.length > 0" class="mb-3 space-y-2">
                <div
                  v-for="item in apiResponse.data"
                  :key="item.id"
                  class="rounded border border-orange-200 bg-white p-3"
                >
                  <p class="font-semibold text-gray-800">
                    {{ item.name }}
                  </p>
                  <p class="text-sm text-gray-600">
                    {{ item.description }}
                  </p>
                </div>
              </div>

              <button
                :disabled="apiResponse.status === 'loading'"
                class="rounded-lg bg-orange-500 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                @click="mockApiCall"
              >
                {{ apiResponse.status === 'loading' ? '載入中...' : '呼叫 Server API' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 環境資訊 -->
      <div class="mb-8 rounded-xl bg-white p-6 shadow-lg">
        <h2 class="mb-4 flex items-center text-2xl font-semibold text-gray-800">
          <svg class="mr-2 size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          環境資訊
        </h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-lg bg-gray-50 p-4">
            <ClientOnly>
              <p class="text-gray-700">
                開發模式: <span class="font-semibold">{{ environmentInfo.isDev }}</span>
              </p>
              <p class="text-gray-700">
                伺服器端渲染: <span class="font-semibold">{{ environmentInfo.isServer }}</span>
              </p>
              <template #fallback>
                <p class="text-gray-700">
                  開發模式: <span class="font-semibold">載入中...</span>
                </p>
                <p class="text-gray-700">
                  伺服器端渲染: <span class="font-semibold">載入中...</span>
                </p>
              </template>
            </ClientOnly>
          </div>
          <div class="rounded-lg bg-gray-50 p-4">
            <p class="text-gray-700">
              主題設定: <span class="font-semibold">{{ currentTheme }}</span>
            </p>
            <p class="text-gray-700">
              頁面狀態: <span class="font-semibold text-green-600">正常運行</span>
            </p>
          </div>
        </div>
      </div>

      <!-- 其他測試頁面連結 -->
      <div class="mb-8 rounded-xl bg-white p-6 shadow-lg">
        <h2 class="mb-4 text-2xl font-semibold text-gray-800">
          其他測試頁面
        </h2>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            to="/examples/pinia"
            class="rounded-lg border border-purple-200 p-4 transition-colors hover:bg-purple-50"
          >
            <div class="flex items-center">
              <svg class="mr-2 size-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <div>
                <h3 class="font-semibold text-purple-600">
                  Pinia Store 測試
                </h3>
                <p class="text-sm text-gray-600">
                  狀態管理功能展示
                </p>
              </div>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/examples/vueuse"
            class="rounded-lg border border-blue-200 p-4 transition-colors hover:bg-blue-50"
          >
            <div class="flex items-center">
              <svg class="mr-2 size-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div>
                <h3 class="font-semibold text-blue-600">
                  VueUse 範例
                </h3>
                <p class="text-sm text-gray-600">
                  常用 Composables 展示
                </p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- 導航 -->
      <div class="text-center">
        <NuxtLink
          to="/"
          class="inline-flex items-center font-medium text-blue-600 hover:text-blue-800"
        >
          <svg class="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回首頁
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
