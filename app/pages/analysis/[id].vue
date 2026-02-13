<script setup lang="ts">
import type { PlayerStatistics } from '~/types/api/analysis'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const playerId = computed(() => route.params.id as string)

// 取得選手統計
const { data: statsResponse } = useFetch(() => `/api/players/${playerId.value}/statistics`)

const stats = computed(() => (statsResponse.value?.data ?? null) as PlayerStatistics | null)

// 是否有投球數據
const hasData = computed(() => stats.value && stats.value.total_pitches > 0)

// 熱區圖數據點
interface HeatMapPoint { x: number, y: number, density: number }

const heatMapPoints = computed(() => {
  if (!stats.value?.heat_map_data)
    return []
  return stats.value.heat_map_data as unknown as HeatMapPoint[]
})

// 將 x, y 座標轉換為 SVG 座標
// x: -0.5 ~ 0.5 → 好球帶寬度範圍
// y: 0 ~ 1 → 好球帶高度範圍
function toSvgX(x: number): number {
  // 好球帶中心在 150, 寬度 200
  return 150 + x * 200
}

function toSvgY(y: number): number {
  // 好球帶 y: 50~250, 反轉（y=1 在上方）
  return 250 - y * 200
}

function dotSize(density: number): number {
  return 6 + density * 14
}
</script>

<template>
  <div data-testid="player-stats-page" class="flex h-full flex-col">
    <!-- 返回按鈕 + 標題 -->
    <div class="mb-6 flex items-center gap-3">
      <UButton
        icon="i-heroicons-arrow-left"
        color="neutral"
        variant="ghost"
        @click="router.push('/analysis')"
      />
      <CommonPageHeader title="選手統計" />
    </div>

    <!-- 無數據時顯示空狀態 -->
    <template v-if="!hasData">
      <CommonEmptyState title="尚無投球數據" description="此選手目前沒有訓練投球紀錄" />
    </template>

    <!-- 有數據時顯示統計 -->
    <template v-else-if="stats">
      <!-- 統計數據卡片 -->
      <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <!-- 期間 -->
        <div data-testid="player-stats-period" class="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            統計期間
          </p>
          <p class="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">
            {{ stats.period || '-' }}
          </p>
        </div>

        <!-- 平均球速 -->
        <div data-testid="player-stats-avg-velocity" class="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            平均球速
          </p>
          <p class="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">
            {{ stats.avg_velocity != null ? `${stats.avg_velocity} km/h` : '-' }}
          </p>
        </div>

        <!-- 平均轉速 -->
        <div data-testid="player-stats-avg-spin-rate" class="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            平均轉速
          </p>
          <p class="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">
            {{ stats.avg_spin_rate != null ? `${stats.avg_spin_rate} rpm` : '-' }}
          </p>
        </div>

        <!-- 好球率 -->
        <div data-testid="player-stats-strike-rate" class="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            好球率
          </p>
          <p class="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">
            {{ stats.strike_rate != null ? `${stats.strike_rate}%` : '-' }}
          </p>
        </div>

        <!-- 總投球數 -->
        <div data-testid="player-stats-total-pitches" class="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            總投球數
          </p>
          <p class="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">
            {{ stats.total_pitches }}
          </p>
        </div>
      </div>

      <!-- 落點熱區圖 -->
      <div data-testid="player-stats-heat-map" class="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
          落點熱區圖
        </h3>

        <template v-if="heatMapPoints.length > 0">
          <div class="flex justify-center">
            <svg
              viewBox="0 0 300 300"
              class="h-72 w-72"
            >
              <!-- 背景 -->
              <rect
                x="0"
                y="0"
                width="300"
                height="300"
                fill="none"
              />

              <!-- 好球帶框線 -->
              <rect
                x="50"
                y="50"
                width="200"
                height="200"
                fill="none"
                class="stroke-neutral-400 dark:stroke-neutral-500"
                stroke-width="2"
              />

              <!-- 數據點 -->
              <circle
                v-for="(point, index) in heatMapPoints"
                :key="index"
                :cx="toSvgX(point.x)"
                :cy="toSvgY(point.y)"
                :r="dotSize(point.density)"
                class="fill-primary-500/70"
              />
            </svg>
          </div>
        </template>

        <template v-else>
          <CommonEmptyState title="尚無落點數據" />
        </template>
      </div>
    </template>
  </div>
</template>
