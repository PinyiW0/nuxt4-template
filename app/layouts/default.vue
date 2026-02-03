<script setup lang="ts">
const route = useRoute()
const colorMode = useColorMode()
const { logout, user } = useAuth()

// Sidebar 狀態
const isSidebarCollapsed = ref(false)
const isMobileMenuOpen = ref(false)

// 導航項目
const navigationItems = [
  {
    label: '訓練管理',
    icon: 'i-heroicons-calendar',
    to: '/trainings',
    children: [
      { label: '訓練列表', to: '/trainings', icon: 'i-heroicons-list-bullet' },
      { label: '歷史紀錄', to: '/trainings/history', icon: 'i-heroicons-clock' },
    ],
  },
  {
    label: '球隊管理',
    icon: 'i-heroicons-user-group',
    to: '/teams',
  },
  {
    label: '球員管理',
    icon: 'i-heroicons-users',
    to: '/players',
  },
  {
    label: '選手分析',
    icon: 'i-heroicons-chart-bar',
    to: '/analysis',
  },
]

// 切換 sidebar
function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// 切換行動裝置選單
function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// 切換深淺模式
function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// 檢查是否為當前路徑
function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

// 關閉行動選單
function closeMobileMenu() {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-neutral-100 dark:bg-neutral-950">
    <!-- Desktop Sidebar -->
    <aside
      class="hidden lg:flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-all duration-300"
      :class="isSidebarCollapsed ? 'w-16' : 'w-64'"
    >
      <!-- Logo Area -->
      <div class="flex h-16 items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-4">
        <NuxtLink v-if="!isSidebarCollapsed" to="/" class="flex items-center gap-2">
          <UIcon name="i-heroicons-eye" class="size-8 text-primary-500" />
          <span class="font-bold text-lg text-neutral-900 dark:text-white">鷹眼偵測系統</span>
        </NuxtLink>
        <UIcon v-else name="i-heroicons-eye" class="size-8 text-primary-500 mx-auto" />
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-2">
        <ul class="space-y-1">
          <li v-for="item in navigationItems" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors"
              :class="{ 'bg-primary-500/10 text-primary-600 dark:text-primary-400': isActive(item.to) }"
            >
              <UIcon :name="item.icon" class="size-5 shrink-0" />
              <span v-if="!isSidebarCollapsed" class="truncate">{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Collapse Toggle -->
      <div class="border-t border-neutral-200 dark:border-neutral-800 p-2">
        <UButton
          :icon="isSidebarCollapsed ? 'i-heroicons-chevron-double-right' : 'i-heroicons-chevron-double-left'"
          variant="ghost"
          color="neutral"
          class="w-full justify-center"
          @click="toggleSidebar"
        />
      </div>
    </aside>

    <!-- Mobile Sidebar (Drawer) -->
    <USlideover v-model:open="isMobileMenuOpen" side="left" class="lg:hidden">
      <div class="flex h-full flex-col bg-white dark:bg-neutral-900">
        <!-- Header -->
        <div class="flex h-16 items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-4">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-eye" class="size-8 text-primary-500" />
            <span class="font-bold text-lg text-neutral-900 dark:text-white">鷹眼偵測系統</span>
          </div>
          <UButton
            icon="i-heroicons-x-mark"
            variant="ghost"
            color="neutral"
            @click="closeMobileMenu"
          />
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto p-4">
          <ul class="space-y-1">
            <li v-for="item in navigationItems" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors"
                :class="{ 'bg-primary-500/10 text-primary-600 dark:text-primary-400': isActive(item.to) }"
                @click="closeMobileMenu"
              >
                <UIcon :name="item.icon" class="size-5" />
                <span>{{ item.label }}</span>
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
    </USlideover>

    <!-- Main Content Area -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Header -->
      <header class="flex h-16 items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 lg:px-6">
        <!-- Left: Mobile menu button -->
        <div class="flex items-center gap-4">
          <UButton
            icon="i-heroicons-bars-3"
            variant="ghost"
            color="neutral"
            class="lg:hidden"
            @click="toggleMobileMenu"
          />
          <!-- Breadcrumb or page title can go here -->
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-2">
          <!-- Color Mode Toggle -->
          <UButton
            :icon="colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'"
            variant="ghost"
            color="neutral"
            @click="toggleColorMode"
          />

          <!-- User Menu -->
          <UDropdownMenu
            :items="[
              [{ label: user?.account || '使用者', icon: 'i-heroicons-user', disabled: true }],
              [{ label: '登出', icon: 'i-heroicons-arrow-right-on-rectangle', onSelect: logout }],
            ]"
          >
            <UButton
              icon="i-heroicons-user-circle"
              variant="ghost"
              color="neutral"
            />
          </UDropdownMenu>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-hidden">
        <div class="h-full overflow-auto p-4 lg:p-6">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
