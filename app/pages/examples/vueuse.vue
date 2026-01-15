<script setup lang="ts">
useHead({
  title: 'VueUse 範例',
  meta: [
    { name: 'description', content: '展示 VueUse composables 的使用範例' },
  ],
})

// State
const { x, y } = useMouse()
const { width, height } = useWindowSize()
const isDark = useDark()
const toggleDark = useToggle(isDark)

// Network
const online = useOnline()

// Clipboard
const { text, copy, copied, isSupported: clipboardSupported } = useClipboard()

// LocalStorage
const storageValue = useLocalStorage('vueuse-demo', 'Hello VueUse')

// Counter with useCounter
const { count, inc, dec, set, reset } = useCounter(0, { min: 0, max: 10 })

// Battery
const { charging, level } = useBattery()

// Idle
const { idle } = useIdle(3000) // 3 seconds

// Page visibility
const isVisible = usePageLeave()

async function handleCopy() {
  await copy('這是複製的文字內容！')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div class="container mx-auto px-4 py-8">
      <!-- 標題區塊 -->
      <div class="mb-12 text-center">
        <h1 class="mb-4 text-4xl font-bold text-gray-800">
          VueUse 範例
        </h1>
        <p class="mb-6 text-xl text-gray-600">
          常用 Composables 展示
        </p>
        <div class="flex justify-center space-x-3">
          <span class="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            VueUse
          </span>
          <span class="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
            Composables
          </span>
          <span class="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
            Utilities
          </span>
        </div>
      </div>

      <!-- 範例卡片網格 -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- 滑鼠位置 -->
        <div class="rounded-xl border-l-4 border-blue-500 bg-white p-6 shadow-lg">
          <h2 class="mb-4 flex items-center text-xl font-semibold text-blue-600">
            <svg class="mr-2 size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            useMouse
          </h2>
          <div class="space-y-2">
            <p class="text-gray-700">
              <span class="font-medium">X:</span> {{ x }}px
            </p>
            <p class="text-gray-700">
              <span class="font-medium">Y:</span> {{ y }}px
            </p>
          </div>
        </div>

        <!-- 視窗大小 -->
        <div class="rounded-xl border-l-4 border-green-500 bg-white p-6 shadow-lg">
          <h2 class="mb-4 flex items-center text-xl font-semibold text-green-600">
            <svg class="mr-2 size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
            </svg>
            useWindowSize
          </h2>
          <div class="space-y-2">
            <p class="text-gray-700">
              <span class="font-medium">寬度:</span> {{ width }}px
            </p>
            <p class="text-gray-700">
              <span class="font-medium">高度:</span> {{ height }}px
            </p>
          </div>
        </div>

        <!-- 深色模式 -->
        <div class="rounded-xl border-l-4 border-purple-500 bg-white p-6 shadow-lg">
          <h2 class="mb-4 flex items-center text-xl font-semibold text-purple-600">
            <svg class="mr-2 size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            useDark
          </h2>
          <div class="space-y-3">
            <p class="text-gray-700">
              <span class="font-medium">狀態:</span>
              <span :class="isDark ? 'text-purple-600' : 'text-yellow-600'">
                {{ isDark ? '深色模式' : '淺色模式' }}
              </span>
            </p>
            <button
              class="w-full rounded-lg bg-purple-500 px-4 py-2 font-medium text-white transition hover:bg-purple-600"
              @click="toggleDark()"
            >
              切換模式
            </button>
          </div>
        </div>

        <!-- 網路狀態 -->
        <div class="rounded-xl border-l-4 border-yellow-500 bg-white p-6 shadow-lg">
          <h2 class="mb-4 flex items-center text-xl font-semibold text-yellow-600">
            <svg class="mr-2 size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
            useOnline
          </h2>
          <div class="flex items-center space-x-3">
            <div
              class="size-4 rounded-full"
              :class="online ? 'bg-green-500' : 'bg-red-500'"
            />
            <span class="text-lg font-medium text-gray-700">
              {{ online ? '線上' : '離線' }}
            </span>
          </div>
        </div>

        <!-- 剪貼簿 -->
        <div class="rounded-xl border-l-4 border-pink-500 bg-white p-6 shadow-lg">
          <h2 class="mb-4 flex items-center text-xl font-semibold text-pink-600">
            <svg class="mr-2 size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            useClipboard
          </h2>
          <div class="space-y-3">
            <button
              :disabled="!clipboardSupported"
              class="w-full rounded-lg bg-pink-500 px-4 py-2 font-medium text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
              @click="handleCopy"
            >
              {{ copied ? '✓ 已複製!' : '複製文字' }}
            </button>
            <p v-if="text" class="text-sm text-gray-600">
              剪貼簿: {{ text }}
            </p>
          </div>
        </div>

        <!-- LocalStorage -->
        <div class="rounded-xl border-l-4 border-indigo-500 bg-white p-6 shadow-lg">
          <h2 class="mb-4 flex items-center text-xl font-semibold text-indigo-600">
            <svg class="mr-2 size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            useLocalStorage
          </h2>
          <div class="space-y-3">
            <input
              v-model="storageValue"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="輸入文字..."
            >
            <p class="text-sm text-gray-600">
              值會自動儲存到 LocalStorage
            </p>
          </div>
        </div>

        <!-- Counter -->
        <div class="rounded-xl border-l-4 border-red-500 bg-white p-6 shadow-lg">
          <h2 class="mb-4 flex items-center text-xl font-semibold text-red-600">
            <svg class="mr-2 size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            useCounter
          </h2>
          <div class="space-y-3">
            <div class="text-center text-3xl font-bold text-gray-800">
              {{ count }}
            </div>
            <div class="flex space-x-2">
              <button
                class="flex-1 rounded-lg bg-red-500 px-3 py-2 font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                @click="dec()"
              >
                -
              </button>
              <button
                class="flex-1 rounded-lg bg-green-500 px-3 py-2 font-medium text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                @click="inc()"
              >
                +
              </button>
            </div>
            <div class="flex space-x-2">
              <button
                class="flex-1 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
                @click="set(5)"
              >
                設為 5
              </button>
              <button
                class="flex-1 rounded-lg bg-gray-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-600"
                @click="reset()"
              >
                重置
              </button>
            </div>
            <p class="text-center text-xs text-gray-500">
              範圍: 0-10
            </p>
          </div>
        </div>

        <!-- Battery -->
        <div class="rounded-xl border-l-4 border-emerald-500 bg-white p-6 shadow-lg">
          <h2 class="mb-4 flex items-center text-xl font-semibold text-emerald-600">
            <svg class="mr-2 size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            useBattery
          </h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-gray-700">電量:</span>
              <span class="text-lg font-bold text-gray-800">
                {{ level !== undefined ? Math.round(level * 100) : '--' }}%
              </span>
            </div>
            <div class="h-4 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                class="h-full transition-all duration-300"
                :class="charging ? 'bg-green-500' : 'bg-blue-500'"
                :style="{ width: `${(level ?? 0) * 100}%` }"
              />
            </div>
            <div class="flex items-center space-x-2">
              <div
                class="size-3 rounded-full"
                :class="charging ? 'bg-green-500' : 'bg-gray-400'"
              />
              <span class="text-sm text-gray-600">
                {{ charging ? '充電中' : '未充電' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Idle -->
        <div class="rounded-xl border-l-4 border-orange-500 bg-white p-6 shadow-lg">
          <h2 class="mb-4 flex items-center text-xl font-semibold text-orange-600">
            <svg class="mr-2 size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            useIdle
          </h2>
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <div
                class="size-4 rounded-full"
                :class="idle ? 'bg-orange-500' : 'bg-green-500'"
              />
              <span class="text-lg font-medium text-gray-700">
                {{ idle ? '閒置中' : '活動中' }}
              </span>
            </div>
            <p class="text-sm text-gray-600">
              3 秒無操作即為閒置
            </p>
          </div>
        </div>

        <!-- Page Leave -->
        <div class="rounded-xl border-l-4 border-cyan-500 bg-white p-6 shadow-lg">
          <h2 class="mb-4 flex items-center text-xl font-semibold text-cyan-600">
            <svg class="mr-2 size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            usePageLeave
          </h2>
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <div
                class="size-4 rounded-full"
                :class="isVisible ? 'bg-red-500' : 'bg-green-500'"
              />
              <span class="text-lg font-medium text-gray-700">
                {{ isVisible ? '滑鼠離開' : '滑鼠在頁面內' }}
              </span>
            </div>
            <p class="text-sm text-gray-600">
              偵測滑鼠是否離開頁面
            </p>
          </div>
        </div>
      </div>

      <!-- 返回按鈕 -->
      <div class="mt-12 text-center">
        <NuxtLink
          to="/examples"
          class="inline-flex items-center rounded-lg bg-gray-800 px-6 py-3 font-medium text-white transition hover:bg-gray-700"
        >
          <svg class="mr-2 size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回範例列表
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
