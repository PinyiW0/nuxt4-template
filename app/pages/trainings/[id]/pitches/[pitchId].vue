<script setup lang="ts">
import type { PitchDetail } from '~/types/api/pitches'
import type { TrainingDetail } from '~/types/api/trainings'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const trainingId = computed(() => Number(route.params.id))
const pitchId = computed(() => Number(route.params.pitchId))

// 取得訓練詳情（好球帶資訊）
const { data: trainingData } = await useFetch<{
  status: string
  data: TrainingDetail
}>(() => `/api/trainings/${trainingId.value}`)

const training = computed(() => trainingData.value?.data)

// 取得單球資料
const { data: pitchData } = await useFetch<{
  status: string
  data: PitchDetail
}>(() => `/api/trainings/${trainingId.value}/pitches/${pitchId.value}`)

const pitch = computed(() => pitchData.value?.data)

// Tab 切換
const activeTab = ref<'grid' | '3d'>('grid')
</script>

<template>
  <div data-testid="pitch-dashboard-page" class="flex h-full flex-col gap-6">
    <!-- 頂部：返回 + 標題 -->
    <div class="flex shrink-0 items-center gap-3">
      <UButton
        icon="i-heroicons-arrow-left"
        color="neutral"
        variant="ghost"
        @click="router.push(`/trainings/${trainingId}`)"
      />
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
        單球儀表板 — 第 {{ pitch?.sequence }} 球
      </h1>
    </div>

    <!-- 球資訊卡片 -->
    <UCard v-if="pitch">
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            球速
          </p>
          <p class="text-lg font-bold text-neutral-900 dark:text-white">
            {{ pitch.velocity }} km/h
          </p>
        </div>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            轉速
          </p>
          <p class="text-lg font-bold text-neutral-900 dark:text-white">
            {{ pitch.spin_rate }} rpm
          </p>
        </div>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            判定
          </p>
          <UBadge :color="pitch.is_strike ? 'success' : 'error'" variant="subtle">
            {{ pitch.is_strike ? '好球' : '壞球' }}
          </UBadge>
        </div>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            落點
          </p>
          <p class="text-lg font-bold text-neutral-900 dark:text-white">
            ({{ pitch.location_x }}, {{ pitch.location_y }})
          </p>
        </div>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            投球時間
          </p>
          <p class="text-lg font-bold text-neutral-900 dark:text-white">
            {{ pitch.time }}
          </p>
        </div>
      </div>
    </UCard>

    <!-- Tab 切換 -->
    <div class="flex gap-2">
      <UButton
        data-testid="pitch-grid-tab"
        :color="activeTab === 'grid' ? 'primary' : 'neutral'"
        :variant="activeTab === 'grid' ? 'solid' : 'outline'"
        @click="activeTab = 'grid'"
      >
        九宮格
      </UButton>
      <UButton
        data-testid="pitch-3d-tab"
        :color="activeTab === '3d' ? 'primary' : 'neutral'"
        :variant="activeTab === '3d' ? 'solid' : 'outline'"
        @click="activeTab = '3d'"
      >
        3D 軌跡
      </UButton>
    </div>

    <!-- 九宮格視圖 -->
    <UCard v-if="activeTab === 'grid'" class="flex-1">
      <div data-testid="pitch-grid-view" class="flex flex-col items-center gap-4">
        <!-- 好球帶 + 落點 -->
        <div class="relative" style="width: 300px; height: 400px;">
          <!-- 好球帶框線 -->
          <div
            data-testid="pitch-strike-zone"
            class="absolute left-1/2 w-[172px] -translate-x-1/2 border-2 border-primary-600 dark:border-primary-400"
            :style="{
              top: `${(1 - (training?.strike_zone_top ?? 120) / 200) * 100}%`,
              height: `${((training?.strike_zone_top ?? 120) - (training?.strike_zone_bottom ?? 50)) / 200 * 100}%`,
            }"
          >
            <span class="absolute -top-5 left-0 text-xs text-neutral-500">
              {{ training?.strike_zone_top ?? 120 }}cm
            </span>
            <span class="absolute -bottom-5 left-0 text-xs text-neutral-500">
              {{ training?.strike_zone_bottom ?? 50 }}cm
            </span>
          </div>

          <!-- 九宮格線 -->
          <div
            class="absolute left-1/2 w-[172px] -translate-x-1/2"
            :style="{
              top: `${(1 - (training?.strike_zone_top ?? 120) / 200) * 100}%`,
              height: `${((training?.strike_zone_top ?? 120) - (training?.strike_zone_bottom ?? 50)) / 200 * 100}%`,
            }"
          >
            <div class="absolute left-1/3 top-0 h-full w-px bg-neutral-300 dark:bg-neutral-600" />
            <div class="absolute left-2/3 top-0 h-full w-px bg-neutral-300 dark:bg-neutral-600" />
            <div class="absolute left-0 top-1/3 h-px w-full bg-neutral-300 dark:bg-neutral-600" />
            <div class="absolute left-0 top-2/3 h-px w-full bg-neutral-300 dark:bg-neutral-600" />
          </div>

          <!-- 落點標記 -->
          <div
            v-if="pitch"
            data-testid="pitch-location-marker"
            class="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
            :class="pitch.is_strike
              ? 'border-success-600 bg-success-500 dark:border-success-400 dark:bg-success-400'
              : 'border-error-600 bg-error-500 dark:border-error-400 dark:bg-error-400'"
            :style="{
              left: `${50 + pitch.location_x * 28.67}%`,
              top: `${(1 - pitch.location_y / 200) * 100}%`,
            }"
          />

          <!-- 球速標籤 -->
          <div
            v-if="pitch"
            data-testid="pitch-velocity-label"
            class="absolute -translate-x-1/2 text-sm font-bold"
            :class="pitch.is_strike
              ? 'text-success-600 dark:text-success-400'
              : 'text-error-600 dark:text-error-400'"
            :style="{
              left: `${50 + pitch.location_x * 28.67}%`,
              top: `${(1 - pitch.location_y / 200) * 100 - 8}%`,
            }"
          >
            {{ pitch.velocity }} km/h
          </div>
        </div>
      </div>
    </UCard>

    <!-- 3D 軌跡視圖 -->
    <UCard v-if="activeTab === '3d'" class="flex-1">
      <div data-testid="pitch-3d-view" class="flex flex-col items-center gap-4">
        <div class="flex h-[400px] w-full items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
          <div class="text-center">
            <UIcon name="i-heroicons-cube-transparent" class="size-16 text-neutral-400" />
            <p class="mt-2 text-neutral-500">
              3D 入壘軌跡視圖
            </p>
            <p class="text-sm text-neutral-400">
              好球帶立體框線
            </p>
            <p v-if="pitch" class="mt-2 text-sm text-neutral-500">
              球速 {{ pitch.velocity }} km/h · 轉速 {{ pitch.spin_rate }} rpm
            </p>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
