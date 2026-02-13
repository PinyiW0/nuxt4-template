<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default' })

const authStore = useAuthStore()

const quickLinks = [
  { label: '球隊管理', description: '管理球隊資訊', icon: 'i-heroicons-user-group', to: '/teams' },
  { label: '球員管理', description: '管理球員資料', icon: 'i-heroicons-users', to: '/players' },
  { label: '訓練列表', description: '建立與管理訓練', icon: 'i-heroicons-clipboard-document-list', to: '/trainings' },
  { label: '歷史訓練', description: '查看過往訓練紀錄', icon: 'i-heroicons-clock', to: '/trainings/history' },
  { label: '選手分析', description: '查看選手統計數據', icon: 'i-heroicons-chart-bar', to: '/analysis' },
]
</script>

<template>
  <div data-testid="home-page" class="flex h-full flex-col">
    <CommonPageHeader
      title="首頁"
      :description="`歡迎回來，${authStore.user?.account ?? '使用者'}`"
    />

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="link in quickLinks"
        :key="link.to"
        :to="link.to"
        class="group"
      >
        <UCard class="transition-colors duration-300 group-hover:border-primary-400 dark:group-hover:border-primary-600">
          <div class="flex items-center gap-4">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-950">
              <UIcon :name="link.icon" class="size-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 class="font-semibold text-neutral-900 dark:text-white">
                {{ link.label }}
              </h3>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">
                {{ link.description }}
              </p>
            </div>
          </div>
        </UCard>
      </NuxtLink>
    </div>
  </div>
</template>
