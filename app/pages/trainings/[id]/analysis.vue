<script setup lang="ts">
import type { HeatMapPoint, TrainingAnalysis } from '~/types/api/analysis'
import type { TrainingDetail } from '~/types/api/trainings'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const trainingId = computed(() => Number(route.params.id))

// 取得訓練詳情
const { data: trainingData } = await useFetch<{
  status: string
  data: TrainingDetail
}>(() => `/api/trainings/${trainingId.value}`)

const training = computed(() => trainingData.value?.data)

// 取得分析資料
const { data: analysisData } = await useFetch<{
  status: string
  data: TrainingAnalysis
}>(() => `/api/trainings/${trainingId.value}/analysis`)

const analysis = computed(() => analysisData.value?.data)
const heatMapPoints = computed<HeatMapPoint[]>(() => analysis.value?.heat_map_data ?? [])
</script>

<template>
  <div data-testid="training-analysis-page" class="flex h-full flex-col gap-6">
    <!-- 頂部 -->
    <div class="flex shrink-0 items-center gap-3">
      <UButton
        icon="i-heroicons-arrow-left"
        color="neutral"
        variant="ghost"
        @click="router.push(`/trainings/${trainingId}`)"
      />
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
        訓練分析
      </h1>
      <span v-if="training" class="text-neutral-500">
        {{ training.date }} · {{ training.player_name }} · {{ training.team_name }}
      </span>
    </div>

    <!-- 統計卡片 -->
    <div v-if="analysis" class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <UCard>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            總投球數
          </p>
          <p data-testid="analysis-total-pitches" class="text-3xl font-bold text-neutral-900 dark:text-white">
            {{ analysis.total_pitches }}
          </p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            好球數
          </p>
          <p data-testid="analysis-strike-count" class="text-3xl font-bold text-success-600 dark:text-success-400">
            {{ analysis.strike_count }}
          </p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            壞球數
          </p>
          <p data-testid="analysis-ball-count" class="text-3xl font-bold text-error-600 dark:text-error-400">
            {{ analysis.ball_count }}
          </p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            好球率
          </p>
          <p data-testid="analysis-strike-rate" class="text-3xl font-bold text-neutral-900 dark:text-white">
            {{ analysis.strike_rate }}%
          </p>
        </div>
      </UCard>
    </div>

    <!-- 球速 + 轉速統計 -->
    <div v-if="analysis" class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <UCard>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            平均球速
          </p>
          <p data-testid="analysis-avg-velocity" class="text-2xl font-bold text-neutral-900 dark:text-white">
            {{ analysis.avg_velocity }}
          </p>
          <p class="text-xs text-neutral-400">
            km/h
          </p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            最快球速
          </p>
          <p data-testid="analysis-max-velocity" class="text-2xl font-bold text-neutral-900 dark:text-white">
            {{ analysis.max_velocity }}
          </p>
          <p class="text-xs text-neutral-400">
            km/h
          </p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            最慢球速
          </p>
          <p data-testid="analysis-min-velocity" class="text-2xl font-bold text-neutral-900 dark:text-white">
            {{ analysis.min_velocity }}
          </p>
          <p class="text-xs text-neutral-400">
            km/h
          </p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            平均轉速
          </p>
          <p data-testid="analysis-avg-spin-rate" class="text-2xl font-bold text-neutral-900 dark:text-white">
            {{ analysis.avg_spin_rate }}
          </p>
          <p class="text-xs text-neutral-400">
            rpm
          </p>
        </div>
      </UCard>
    </div>

    <!-- 熱區圖 -->
    <UCard v-if="analysis" class="flex-1">
      <template #header>
        <h3 class="font-semibold text-neutral-900 dark:text-white">
          落點熱區圖
        </h3>
      </template>
      <div data-testid="analysis-heat-map" class="flex items-center justify-center">
        <div class="relative" style="width: 300px; height: 400px;">
          <!-- 好球帶框線 -->
          <div
            class="absolute left-1/2 w-[172px] -translate-x-1/2 border-2 border-primary-600 dark:border-primary-400"
            :style="{
              top: `${(1 - (training?.strike_zone_top ?? 120) / 200) * 100}%`,
              height: `${((training?.strike_zone_top ?? 120) - (training?.strike_zone_bottom ?? 50)) / 200 * 100}%`,
            }"
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
      </div>
    </UCard>
  </div>
</template>
