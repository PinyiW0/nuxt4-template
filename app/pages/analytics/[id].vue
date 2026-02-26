<script setup lang="ts">
import type { HeatMapPoint, PlayerStatsData } from '~/types/api/analysis'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const playerId = computed(() => route.params.id as string)

// 取得選手統計資料
const { data: result } = await useFetch<{ data: PlayerStatsData }>(`/api/analytics/players/${playerId.value}`)
const stats = computed<PlayerStatsData | null>(() => result.value?.data ?? null)

// 統計卡片定義
const statCards = computed(() => {
  if (!stats.value)
    return []
  const hasData = stats.value.total_pitches > 0
  return [
    { testid: 'player-stats-avg-velocity', label: '平均球速', value: hasData ? stats.value.avg_velocity : '-', unit: hasData ? 'km/h' : '' },
    { testid: 'player-stats-avg-spin-rate', label: '平均轉速', value: hasData ? stats.value.avg_spin_rate : '-', unit: hasData ? 'rpm' : '' },
    { testid: 'player-stats-strike-rate', label: '好球率', value: hasData ? `${stats.value.strike_rate}%` : '-', unit: '' },
    { testid: 'player-stats-total-pitches', label: '投球總數', value: stats.value.total_pitches, unit: '球' },
  ]
})

// 熱區圖資料
const heatMapPoints = computed<HeatMapPoint[]>(() => stats.value?.heat_map ?? [])

// 計算熱區圖點的位置
function getPointStyle(point: HeatMapPoint) {
  return {
    left: `${point.x}%`,
    bottom: `${point.y}%`,
  }
}

// 密度顏色（暖色=高密度，冷色=低密度）
function getDensityColor(density: number): string {
  if (density >= 3)
    return 'bg-red-500/80'
  if (density >= 2)
    return 'bg-orange-500/70'
  return 'bg-blue-500/60'
}
</script>

<template>
  <div data-testid="player-stats-page" class="flex h-full flex-col">
    <!-- Header -->
    <div class="mb-6 flex shrink-0 items-center gap-4">
      <UButton
        icon="i-heroicons-arrow-left"
        color="neutral"
        variant="ghost"
        @click="router.push('/analytics')"
      />
      <CommonPageHeader title="選手統計" :description="`選手 #${playerId}`" />
    </div>

    <!-- 統計期間 -->
    <div v-if="stats" data-testid="player-stats-period" class="mb-4 shrink-0 text-sm text-neutral-500 dark:text-neutral-400">
      統計期間：{{ stats.period_start }} ~ {{ stats.period_end }}
    </div>

    <!-- 統計卡片 -->
    <div class="mb-6 grid shrink-0 grid-cols-2 gap-4 sm:grid-cols-4">
      <UCard v-for="stat in statCards" :key="stat.testid" :data-testid="stat.testid">
        <div class="text-center">
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            {{ stat.label }}
          </p>
          <p class="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
            {{ stat.value }}
          </p>
          <p v-if="stat.unit" class="text-xs text-neutral-400 dark:text-neutral-500">
            {{ stat.unit }}
          </p>
        </div>
      </UCard>
    </div>

    <!-- 熱區圖 -->
    <UCard class="min-h-0 flex-1" :ui="{ body: 'flex-1 min-h-0', root: 'flex flex-col min-h-0' }">
      <h3 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
        投球熱區圖
      </h3>
      <div
        data-testid="player-stats-heat-map"
        class="relative mx-auto aspect-square w-full max-w-md rounded-lg border-2 border-neutral-300 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800"
      >
        <!-- 好球帶框線 -->
        <div class="absolute inset-[15%] border-2 border-dashed border-primary-400 dark:border-primary-500" />

        <!-- 九宮格線 -->
        <div class="absolute inset-[15%]">
          <div class="absolute left-1/3 top-0 h-full w-px bg-neutral-300 dark:bg-neutral-600" />
          <div class="absolute left-2/3 top-0 h-full w-px bg-neutral-300 dark:bg-neutral-600" />
          <div class="absolute left-0 top-1/3 h-px w-full bg-neutral-300 dark:bg-neutral-600" />
          <div class="absolute left-0 top-2/3 h-px w-full bg-neutral-300 dark:bg-neutral-600" />
        </div>

        <!-- 投球落點 -->
        <div
          v-for="(point, idx) in heatMapPoints"
          :key="idx"
          class="absolute size-3 -translate-x-1/2 translate-y-1/2 rounded-full"
          :class="getDensityColor(point.density)"
          :style="getPointStyle(point)"
        />

        <!-- 空資料提示 -->
        <div
          v-if="heatMapPoints.length === 0"
          class="absolute inset-0 flex items-center justify-center"
        >
          <span class="text-neutral-400 dark:text-neutral-500">暫無投球資料</span>
        </div>
      </div>
    </UCard>
  </div>
</template>
