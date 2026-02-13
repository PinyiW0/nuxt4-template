<script setup lang="ts">
import type { PitchDetail } from '~/types/api/pitches'
import type { TrainingDetail } from '~/types/api/trainings'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()

const trainingId = computed(() => route.params.id as string)
const pitchId = computed(() => route.params.pitchId as string)

// 取得訓練詳情（好球帶範圍）
const { data: trainingData } = await useFetch<{ status: string, data: TrainingDetail }>(
  () => `/api/trainings/${trainingId.value}`,
)
const training = computed(() => trainingData.value?.data)

// 取得單球詳情
const { data: pitchData } = await useFetch<{ status: string, data: PitchDetail }>(
  () => `/api/trainings/${trainingId.value}/pitches/${pitchId.value}`,
)
const pitch = computed(() => pitchData.value?.data)

// Tab 控制
const activeTab = ref('grid')
const tabs = [
  { label: '九宮格', value: 'grid', icon: 'i-heroicons-squares-2x2' },
  { label: '3D 軌跡', value: '3d', icon: 'i-heroicons-cube-transparent' },
]

// 好球帶尺寸設定（以 px 表示的視覺區域）
const ZONE_WIDTH = 300
const ZONE_HEIGHT = 300

// 計算落點位置（location_x/location_y 為 0~1 範圍的正規化值）
const markerStyle = computed(() => {
  if (!pitch.value)
    return {}
  const x = pitch.value.location_x * ZONE_WIDTH
  const y = (1 - pitch.value.location_y) * ZONE_HEIGHT // Y 軸反轉（0 在底部）
  return {
    left: `${x}px`,
    top: `${y}px`,
    transform: 'translate(-50%, -50%)',
  }
})

// 落點顏色
const markerColor = computed(() => {
  return pitch.value?.is_strike
    ? 'bg-success-500 border-success-600 dark:bg-success-400 dark:border-success-500'
    : 'bg-error-500 border-error-600 dark:bg-error-400 dark:border-error-500'
})

// 資訊卡片
const infoCards = computed(() => {
  if (!pitch.value)
    return []
  return [
    { label: '球速', value: `${pitch.value.velocity} km/h` },
    { label: '轉速', value: `${pitch.value.spin_rate} rpm` },
    { label: '好壞球', value: pitch.value.is_strike ? '好球' : '壞球', color: pitch.value.is_strike ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400' },
    { label: '時間', value: pitch.value.time },
    { label: '序號', value: `#${pitch.value.sequence}` },
  ]
})
</script>

<template>
  <div data-testid="pitch-dashboard-page" class="flex h-full flex-col gap-6 overflow-y-auto">
    <!-- 頂部：返回 + 標題 -->
    <div class="flex items-center gap-4">
      <UButton
        icon="i-heroicons-arrow-left"
        color="neutral"
        variant="ghost"
        @click="router.push(`/trainings/${trainingId}`)"
      />
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
        單球儀表板 #{{ pitch?.sequence }}
      </h1>
    </div>

    <!-- 投球資訊卡片 -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-5">
      <div
        v-for="card in infoCards"
        :key="card.label"
        class="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          {{ card.label }}
        </p>
        <p
          class="mt-1 text-xl font-bold"
          :class="card.color ?? 'text-neutral-900 dark:text-white'"
        >
          {{ card.value }}
        </p>
      </div>
    </div>

    <!-- Tab 切換 -->
    <div class="flex gap-2">
      <UButton
        v-for="tab in tabs"
        :key="tab.value"
        :data-testid="tab.value === 'grid' ? 'pitch-tab-grid' : 'pitch-tab-3d'"
        :label="tab.label"
        :icon="tab.icon"
        :color="activeTab === tab.value ? 'primary' : 'neutral'"
        :variant="activeTab === tab.value ? 'solid' : 'outline'"
        @click="activeTab = tab.value"
      />
    </div>

    <!-- 九宮格視圖 -->
    <div
      v-if="activeTab === 'grid'"
      data-testid="pitch-grid-view"
      class="flex flex-1 items-center justify-center rounded-lg border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div class="flex flex-col items-center gap-4">
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          好球帶：{{ training?.strike_zone_top ?? '-' }} ~ {{ training?.strike_zone_bottom ?? '-' }} cm
        </p>

        <!-- 好球帶視覺區域 -->
        <div
          data-testid="pitch-strike-zone"
          class="relative border-2 border-neutral-400 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800"
          :style="{ width: `${ZONE_WIDTH}px`, height: `${ZONE_HEIGHT}px` }"
        >
          <!-- 九宮格線 -->
          <div class="absolute inset-0">
            <!-- 垂直線 -->
            <div class="absolute left-1/3 top-0 h-full w-px bg-neutral-300 dark:bg-neutral-600" />
            <div class="absolute left-2/3 top-0 h-full w-px bg-neutral-300 dark:bg-neutral-600" />
            <!-- 水平線 -->
            <div class="absolute left-0 top-1/3 h-px w-full bg-neutral-300 dark:bg-neutral-600" />
            <div class="absolute left-0 top-2/3 h-px w-full bg-neutral-300 dark:bg-neutral-600" />
          </div>

          <!-- 落點標記 -->
          <div
            v-if="pitch"
            data-testid="pitch-location-marker"
            class="absolute size-5 rounded-full border-2"
            :class="markerColor"
            :style="markerStyle"
          />

          <!-- 球速標註 -->
          <div
            v-if="pitch"
            data-testid="pitch-velocity-label"
            class="absolute text-xs font-bold"
            :class="pitch.is_strike ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'"
            :style="{
              left: `${pitch.location_x * ZONE_WIDTH + 14}px`,
              top: `${(1 - pitch.location_y) * ZONE_HEIGHT - 10}px`,
            }"
          >
            {{ pitch.velocity }}
          </div>
        </div>
      </div>
    </div>

    <!-- 3D 軌跡視圖（placeholder） -->
    <div
      v-if="activeTab === '3d'"
      data-testid="pitch-3d-view"
      class="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <UIcon name="i-heroicons-cube-transparent" class="size-16 text-neutral-300 dark:text-neutral-600" />
      <p class="text-lg font-medium text-neutral-500 dark:text-neutral-400">
        3D 軌跡視圖（開發中）
      </p>
      <p class="text-sm text-neutral-400 dark:text-neutral-500">
        未來將使用 3D library 呈現投球軌跡
      </p>

      <!-- trajectory_data JSON 顯示 -->
      <div class="mt-4 w-full max-w-lg overflow-auto rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
        <p class="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
          trajectory_data
        </p>
        <pre class="text-xs text-neutral-700 dark:text-neutral-300">{{ JSON.stringify(pitch?.trajectory_data, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>
