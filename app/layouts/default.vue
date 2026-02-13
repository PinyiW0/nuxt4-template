<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const colorMode = useColorMode()
const isMobileMenuOpen = ref(false)
const isCollapsed = ref(false)

const navigation = [
  { label: '首頁', icon: 'i-heroicons-home', to: '/' },
  { label: '球隊管理', icon: 'i-heroicons-user-group', to: '/teams' },
  { label: '球員管理', icon: 'i-heroicons-users', to: '/players' },
  { label: '訓練列表', icon: 'i-heroicons-clipboard-document-list', to: '/trainings' },
  { label: '歷史訓練', icon: 'i-heroicons-clock', to: '/trainings/history' },
  { label: '選手分析', icon: 'i-heroicons-chart-bar', to: '/analysis' },
]

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

async function handleLogout() {
  authStore.clearAuth()
  await router.push('/login')
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-neutral-100 dark:bg-neutral-950">
    <!-- Sidebar：lg 以上顯示，可收合 -->
    <aside
      class="hidden shrink-0 border-r border-neutral-200 bg-white transition-all duration-300 lg:flex lg:flex-col dark:border-neutral-800 dark:bg-neutral-900"
      :class="isCollapsed ? 'w-16' : 'w-64'"
    >
      <!-- Logo + 收合按鈕 -->
      <div
        class="flex h-16 shrink-0 items-center border-b border-neutral-200 dark:border-neutral-800"
        :class="isCollapsed ? 'justify-center px-2' : 'justify-between px-4'"
      >
        <span
          v-if="!isCollapsed"
          class="truncate text-lg font-bold text-neutral-900 dark:text-white"
        >
          鷹眼偵測系統
        </span>
        <UButton
          :icon="isCollapsed ? 'i-heroicons-chevron-right' : 'i-heroicons-chevron-left'"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="toggleSidebar"
        />
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1 overflow-y-auto p-2">
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="flex items-center rounded-lg px-3 py-2 text-neutral-700 transition-colors duration-300 hover:bg-primary-50 hover:text-primary-600 dark:text-neutral-300 dark:hover:bg-primary-950 dark:hover:text-primary-400"
          :class="isCollapsed ? 'justify-center' : 'gap-3'"
        >
          <UIcon :name="item.icon" class="size-5 shrink-0" />
          <span v-if="!isCollapsed" class="truncate">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- 底部功能區：深淺模式 + 會員名稱 + 登出 -->
      <div class="shrink-0 border-t border-neutral-200 p-2 dark:border-neutral-800">
        <!-- 深淺模式切換 -->
        <button
          class="flex w-full items-center rounded-lg px-3 py-2 text-neutral-700 transition-colors duration-300 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          :class="isCollapsed ? 'justify-center' : 'gap-3'"
          @click="toggleColorMode"
        >
          <UIcon
            :name="colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'"
            class="size-5 shrink-0"
          />
          <span v-if="!isCollapsed" class="truncate text-sm">
            {{ colorMode.value === 'dark' ? '淺色模式' : '深色模式' }}
          </span>
        </button>

        <!-- 會員名稱 + 登出 -->
        <div
          v-if="!isCollapsed"
          class="flex items-center gap-3 rounded-lg px-3 py-2"
        >
          <UIcon
            name="i-heroicons-user-circle"
            class="size-5 shrink-0 text-primary-600 dark:text-primary-400"
          />
          <span class="flex-1 truncate text-sm text-neutral-700 dark:text-neutral-300">
            {{ authStore.user?.account ?? '未登入' }}
          </span>
          <UButton
            data-testid="logout-button"
            icon="i-heroicons-arrow-right-on-rectangle"
            color="neutral"
            variant="ghost"
            size="xs"
            @click="handleLogout"
          />
        </div>
        <div v-else class="flex flex-col items-center gap-1">
          <UTooltip text="使用者">
            <UIcon
              name="i-heroicons-user-circle"
              class="size-5 text-primary-600 dark:text-primary-400"
            />
          </UTooltip>
          <UTooltip text="登出">
            <UButton
              icon="i-heroicons-arrow-right-on-rectangle"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="handleLogout"
            />
          </UTooltip>
        </div>
      </div>
    </aside>

    <!-- Mobile Drawer -->
    <USlideover v-model:open="isMobileMenuOpen" side="left">
      <template #content>
        <div class="flex h-full flex-col bg-white dark:bg-neutral-900">
          <!-- Mobile Header -->
          <div class="flex h-14 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-800">
            <span class="text-lg font-bold text-neutral-900 dark:text-white">鷹眼偵測系統</span>
            <UButton
              icon="i-heroicons-x-mark"
              color="neutral"
              variant="ghost"
              @click="isMobileMenuOpen = false"
            />
          </div>
          <!-- Mobile Navigation -->
          <nav class="flex-1 space-y-1 overflow-y-auto p-4">
            <NuxtLink
              v-for="item in navigation"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-700 transition-colors duration-300 hover:bg-primary-50 hover:text-primary-600 dark:text-neutral-300 dark:hover:bg-primary-950 dark:hover:text-primary-400"
              @click="isMobileMenuOpen = false"
            >
              <UIcon :name="item.icon" class="size-5" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </nav>
          <!-- Mobile 底部功能區 -->
          <div class="shrink-0 border-t border-neutral-200 p-4 dark:border-neutral-800">
            <button
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-neutral-700 transition-colors duration-300 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              @click="toggleColorMode"
            >
              <UIcon
                :name="colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'"
                class="size-5"
              />
              <span class="text-sm">{{ colorMode.value === 'dark' ? '淺色模式' : '深色模式' }}</span>
            </button>
            <div class="flex items-center gap-3 rounded-lg px-3 py-2">
              <UIcon
                name="i-heroicons-user-circle"
                class="size-5 text-primary-600 dark:text-primary-400"
              />
              <span class="flex-1 truncate text-sm text-neutral-700 dark:text-neutral-300">
                {{ authStore.user?.account ?? '未登入' }}
              </span>
              <UButton
                icon="i-heroicons-arrow-right-on-rectangle"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="handleLogout"
              />
            </div>
          </div>
        </div>
      </template>
    </USlideover>

    <!-- Main Content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Mobile Top Bar（in-flow，不會覆蓋內容） -->
      <div class="flex h-14 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4 lg:hidden dark:border-neutral-800 dark:bg-neutral-900">
        <button @click="isMobileMenuOpen = true">
          <UIcon name="i-heroicons-bars-3" class="size-6 text-neutral-900 dark:text-white" />
        </button>
        <span class="text-lg font-bold text-neutral-900 dark:text-white">鷹眼偵測系統</span>
      </div>
      <main class="flex min-h-0 flex-1 flex-col overflow-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
