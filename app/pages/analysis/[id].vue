<script setup lang="ts">
import type { HeatMapPoint, PlayerStatistics } from '~/types/api/analysis'
import type { PlayerItem } from '~/types/api/players'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const playerId = computed(() => Number(route.params.id))

// 取得球員基本資訊
const { data: playerData } = await useFetch<{
  status: string
  data: PlayerItem[]
}>('/api/players')

const player = computed(() =>
  playerData.value?.data?.find(p => p.id === playerId.value),
)

// 取得選手統計
const { data: statsData } = await useFetch<{
  status: string
  data: PlayerStatistics
}>(() => `/api/players/${playerId.value}/statistics`)

const stats = computed(() => statsData.value?.data)
const heatMapPoints = computed<HeatMapPoint[]>(() => stats.value?.heat_map_data ?? [])
</script>

<template>
  <div data-testid="player-stats-page" class="flex h-full flex-col gap-6">
    <!-- 頂部 -->
    <div class="flex shrink-0 items-center gap-3">
      <UButton
        icon="i-heroicons-arrow-left"
        color="neutral"
        variant="ghost"
        @click="router.push('/analysis')"
      />
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
        選手統計
      </h1>
      <span v-if="player" class="text-neutral-500">
        {{ player.name }} (#{{ player.number }}) · {{ player.team_name }}
      </span>
    </div>

    <!-- 統計期間 -->
    <div v-if="player" data-testid="player-stats-period" class="text-sm text-neutral-500">
      統計期間：{{ player.created_at ? player.created_at.split('T')[0] : '-' }} 至今
    </div>

    <!-- 統計卡片 -->
    <div v-if="stats" class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <UCard>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            平均球速
          </p>
          <p data-testid="player-stats-avg-velocity" class="text-3xl font-bold text-neutral-900 dark:text-white">
            {{ stats.avg_velocity !== null ? stats.avg_velocity : '-' }}
          </p>
          <p v-if="stats.avg_velocity !== null" class="text-xs text-neutral-400">
            km/h
          </p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            平均轉速
          </p>
          <p data-testid="player-stats-avg-spin-rate" class="text-3xl font-bold text-neutral-900 dark:text-white">
            {{ stats.avg_spin_rate !== null ? stats.avg_spin_rate : '-' }}
          </p>
          <p v-if="stats.avg_spin_rate !== null" class="text-xs text-neutral-400">
            rpm
          </p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            好球率
          </p>
          <p data-testid="player-stats-strike-rate" class="text-3xl font-bold text-neutral-900 dark:text-white">
            {{ stats.strike_rate !== null ? `${stats.strike_rate}%` : '-' }}
          </p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            投球總數
          </p>
          <p data-testid="player-stats-total-pitches" class="text-3xl font-bold text-neutral-900 dark:text-white">
            {{ stats.total_pitches }}
          </p>
        </div>
      </UCard>
    </div>

    <!-- 熱區圖 -->
    <UCard v-if="stats" class="flex-1">
      <template #header>
        <h3 class="font-semibold text-neutral-900 dark:text-white">
          落點熱區圖
        </h3>
      </template>
      <div data-testid="player-stats-heat-map" class="flex items-center justify-center">
        <div v-if="heatMapPoints.length" class="relative" style="width: 300px; height: 400px;">
          <!-- 好球帶框線（預設） -->
          <div
            class="absolute left-1/2 w-[172px] -translate-x-1/2 border-2 border-primary-600 dark:border-primary-400"
            style="top: 40%; height: 35%;"
          />
          <!-- 熱區點 -->
          <div
            v-for="(point, idx) in heatMapPoints"
            :key="idx"
            class="absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
            :class="point.count > 2 ? 'bg-error-500' : point.count > 1 ? 'bg-warning-500' : 'bg-info-500'"
            :style="{
              left: `${50 + point.location_x * 28.67}%`,
              top: `${(1 - point.location_y / 200) * 100}%`,
            }"
          />
        </div>
        <div v-else class="py-12 text-center text-neutral-400">
          <UIcon name="i-heroicons-chart-bar" class="size-12" />
          <p class="mt-2">
            尚無投球數據
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>
