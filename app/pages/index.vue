<script setup lang="ts">
import type { TeamItem } from '~/types/api/teams'
import type { TrainingItem } from '~/types/api/trainings'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default' })

const authStore = useAuthStore()
const router = useRouter()

// 取得今日訓練
const { data: trainingsData } = await useFetch<{
  status: string
  data: TrainingItem[]
}>('/api/trainings')

const todayTrainings = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return (trainingsData.value?.data ?? []).filter(t => t.date === today)
})

// 取得球隊數量
const { data: teamsData } = await useFetch<{
  status: string
  data: TeamItem[]
}>('/api/teams')

const teamCount = computed(() => teamsData.value?.data?.length ?? 0)

const quickLinks = [
  { label: '球隊管理', icon: 'i-heroicons-user-group', to: '/teams', description: '管理球隊資料' },
  { label: '球員管理', icon: 'i-heroicons-users', to: '/players', description: '管理球員資料' },
  { label: '開始訓練', icon: 'i-heroicons-clipboard-document-list', to: '/trainings', description: '建立與管理訓練' },
  { label: '歷史訓練', icon: 'i-heroicons-clock', to: '/trainings/history', description: '查看歷史訓練紀錄' },
  { label: '選手分析', icon: 'i-heroicons-chart-bar', to: '/analysis', description: '查看選手統計分析' },
]
</script>

<template>
  <div data-testid="home-page" class="flex h-full flex-col gap-6">
    <!-- 歡迎區 -->
    <div>
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
        歡迎回來，{{ authStore.user?.account ?? '使用者' }}
      </h1>
      <p class="mt-1 text-neutral-500">
        鷹眼偵測系統 — 智能訓練分析平台
      </p>
    </div>

    <!-- 摘要卡片 -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <UCard>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            球隊數
          </p>
          <p class="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {{ teamCount }}
          </p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            今日訓練
          </p>
          <p class="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {{ todayTrainings.length }}
          </p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            AI 運行中訓練
          </p>
          <p class="text-3xl font-bold text-success-600 dark:text-success-400">
            {{ todayTrainings.filter(t => t.ai_status === 'running').length }}
          </p>
        </div>
      </UCard>
    </div>

    <!-- 快速連結 -->
    <div>
      <h2 class="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
        快速前往
      </h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <UCard
          v-for="link in quickLinks"
          :key="link.to"
          class="cursor-pointer transition-shadow hover:shadow-md"
          @click="router.push(link.to)"
        >
          <div class="flex items-center gap-3">
            <UIcon :name="link.icon" class="size-8 text-primary-600 dark:text-primary-400" />
            <div>
              <p class="font-medium text-neutral-900 dark:text-white">
                {{ link.label }}
              </p>
              <p class="text-sm text-neutral-500">
                {{ link.description }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- 今日訓練列表 -->
    <div v-if="todayTrainings.length">
      <h2 class="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
        今日訓練
      </h2>
      <UCard :ui="{ body: 'p-0' }">
        <div v-for="t in todayTrainings" :key="t.id" class="flex cursor-pointer items-center justify-between border-b border-neutral-200 px-4 py-3 last:border-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800" @click="router.push(`/trainings/${t.id}`)">
          <div class="flex items-center gap-3">
            <span class="font-medium text-neutral-900 dark:text-white">{{ t.player_name }}</span>
            <span class="text-sm text-neutral-500">{{ t.team_name }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-neutral-500">{{ t.pitch_count }} 球</span>
            <UBadge
              :color="t.ai_status === 'running' ? 'success' : 'neutral'"
              variant="subtle"
              size="sm"
            >
              {{ t.ai_status === 'running' ? 'AI 運行中' : 'AI 停止' }}
            </UBadge>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
