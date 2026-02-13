<script setup lang="ts">
import type { TrainingAnalysis } from '~/types/api/analysis'
import type { PitchItem } from '~/types/api/pitches'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()

const trainingId = computed(() => route.params.id as string)

// 取得訓練分析數據
const { data: analysisData } = await useFetch<{ status: string, data: TrainingAnalysis }>(
  () => `/api/trainings/${trainingId.value}/analysis`,
)
const analysis = computed(() => analysisData.value?.data)

// 取得投球清單（用於熱區圖）
const { data: pitchesData } = await useFetch<{ status: string, data: PitchItem[] }>(
  () => `/api/trainings/${trainingId.value}/pitches`,
)
const pitches = computed(() => pitchesData.value?.data ?? [])

// 好球帶視覺區域尺寸
const ZONE_WIDTH = 350
const ZONE_HEIGHT = 350

// 統計卡片（4x2 grid）
const statCards = computed(() => {
  if (!analysis.value)
    return []
  return [
    { label: '總投球數', value: analysis.value.total_pitches, testid: 'analysis-total-pitches', unit: '球' },
    { label: '好球數', value: analysis.value.strike_count, testid: 'analysis-strike-count', unit: '球' },
    { label: '壞球數', value: analysis.value.ball_count, testid: 'analysis-ball-count', unit: '球' },
    { label: '好球率', value: `${analysis.value.strike_rate}%`, testid: 'analysis-strike-rate', unit: '' },
    { label: '平均球速', value: analysis.value.avg_velocity, testid: 'analysis-avg-velocity', unit: 'km/h' },
    { label: '最高球速', value: analysis.value.max_velocity, testid: 'analysis-max-velocity', unit: 'km/h' },
    { label: '最低球速', value: analysis.value.min_velocity, testid: 'analysis-min-velocity', unit: 'km/h' },
    { label: '平均轉速', value: analysis.value.avg_spin_rate, testid: 'analysis-avg-spin-rate', unit: 'rpm' },
  ]
})
</script>

<template>
  <div data-testid="training-analysis-page" class="flex h-full flex-col gap-6 overflow-y-auto">
    <!-- 頂部：返回 + 標題 -->
    <div class="flex items-center gap-4">
      <UButton
        icon="i-heroicons-arrow-left"
        color="neutral"
        variant="ghost"
        @click="router.push(`/trainings/${trainingId}`)"
      />
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
        訓練分析
      </h1>
    </div>

    <!-- 統計數據卡片（4x2 grid） -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div
        v-for="stat in statCards"
        :key="stat.testid"
        :data-testid="stat.testid"
        class="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          {{ stat.label }}
        </p>
        <p class="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
          {{ stat.value }}
          <span v-if="stat.unit" class="text-sm font-normal text-neutral-500 dark:text-neutral-400">{{ stat.unit }}</span>
        </p>
      </div>
    </div>

    <!-- 落點熱區圖 -->
    <div class="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 class="mb-4 font-semibold text-neutral-900 dark:text-white">
        落點熱區圖
      </h2>
      <div class="flex justify-center">
        <div
          data-testid="analysis-heat-map"
          class="relative border-2 border-neutral-400 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800"
          :style="{ width: `${ZONE_WIDTH}px`, height: `${ZONE_HEIGHT}px` }"
        >
          <!-- 九宮格線 -->
          <div class="absolute inset-0">
            <div class="absolute left-1/3 top-0 h-full w-px bg-neutral-300 dark:bg-neutral-600" />
            <div class="absolute left-2/3 top-0 h-full w-px bg-neutral-300 dark:bg-neutral-600" />
            <div class="absolute left-0 top-1/3 h-px w-full bg-neutral-300 dark:bg-neutral-600" />
            <div class="absolute left-0 top-2/3 h-px w-full bg-neutral-300 dark:bg-neutral-600" />
          </div>

          <!-- 投球落點標記 -->
          <div
            v-for="p in pitches"
            :key="p.id"
            class="absolute size-3 rounded-full border opacity-80"
            :class="p.is_strike
              ? 'bg-success-500 border-success-600 dark:bg-success-400 dark:border-success-500'
              : 'bg-error-500 border-error-600 dark:bg-error-400 dark:border-error-500'
            "
            :style="{
              left: `${p.location_x * ZONE_WIDTH}px`,
              top: `${(1 - p.location_y) * ZONE_HEIGHT}px`,
              transform: 'translate(-50%, -50%)',
            }"
          />

          <!-- 無投球時提示 -->
          <div
            v-if="pitches.length === 0"
            class="absolute inset-0 flex items-center justify-center"
          >
            <p class="text-sm text-neutral-400 dark:text-neutral-500">
              尚無投球資料
            </p>
          </div>
        </div>
      </div>

      <!-- 圖例 -->
      <div class="mt-4 flex items-center justify-center gap-6">
        <div class="flex items-center gap-2">
          <div class="size-3 rounded-full bg-success-500 dark:bg-success-400" />
          <span class="text-sm text-neutral-600 dark:text-neutral-400">好球</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="size-3 rounded-full bg-error-500 dark:bg-error-400" />
          <span class="text-sm text-neutral-600 dark:text-neutral-400">壞球</span>
        </div>
      </div>
    </div>
  </div>
</template>
