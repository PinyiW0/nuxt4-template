<script setup lang="ts">
import type { PitchItem } from '~/types/api/pitches'
import type { TrainingDetail, UpdateStrikeZoneBody } from '~/types/api/trainings'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const toast = useToast()

const trainingId = computed(() => route.params.id as string)

// 取得訓練詳情
const { data: trainingData, refresh: refreshTraining } = await useFetch<{ status: string, data: TrainingDetail }>(
  () => `/api/trainings/${trainingId.value}`,
)
const training = computed(() => trainingData.value?.data)

// 取得投球清單
const { data: pitchesData } = await useFetch<{ status: string, data: PitchItem[] }>(
  () => `/api/trainings/${trainingId.value}/pitches`,
)
const pitches = computed(() => pitchesData.value?.data ?? [])

// 即時統計：從 pitches 計算
const totalPitches = computed(() => pitches.value.length)
const strikeCount = computed(() => pitches.value.filter(p => p.is_strike).length)
const ballCount = computed(() => pitches.value.filter(p => !p.is_strike).length)
const strikeRate = computed(() => {
  if (totalPitches.value === 0)
    return 0
  return Math.round((strikeCount.value / totalPitches.value) * 100)
})
const avgVelocity = computed(() => {
  if (totalPitches.value === 0)
    return 0
  const sum = pitches.value.reduce((acc, p) => acc + p.velocity, 0)
  return Number((sum / totalPitches.value).toFixed(1))
})

// AI 狀態
const aiStatus = computed(() => training.value?.ai_status ?? 'stopped')
const isAiLoading = ref(false)

async function startAi() {
  if (isAiLoading.value)
    return
  isAiLoading.value = true
  try {
    await $fetch('/api/ai/start', {
      method: 'POST',
      body: { training_id: Number(trainingId.value) },
    })
    toast.add({ title: 'AI 已啟動', color: 'success' })
    await refreshTraining()
  }
  catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message ?? '啟動失敗'
    toast.add({ title: message, color: 'error' })
  }
  finally {
    isAiLoading.value = false
  }
}

async function stopAi() {
  if (isAiLoading.value)
    return
  isAiLoading.value = true
  try {
    await $fetch('/api/ai/stop', { method: 'POST' })
    toast.add({ title: 'AI 已停止', color: 'success' })
    await refreshTraining()
  }
  catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message ?? '停止失敗'
    toast.add({ title: message, color: 'error' })
  }
  finally {
    isAiLoading.value = false
  }
}

// 投球清單表格欄位
const columns = [
  { accessorKey: 'sequence', header: '序號' },
  { accessorKey: 'time', header: '時間' },
  { accessorKey: 'velocity', header: '球速 (km/h)' },
  { accessorKey: 'spin_rate', header: '轉速 (rpm)' },
  { accessorKey: 'is_strike', header: '好壞球' },
  { accessorKey: 'location_x', header: '落點 X' },
  { accessorKey: 'location_y', header: '落點 Y' },
]

// 點擊投球列導航
function handlePitchClick(_e: Event, row: { original: PitchItem }) {
  router.push(`/trainings/${trainingId.value}/pitches/${row.original.id}`)
}

// 好球帶設定 Modal
const isStrikeZoneModalOpen = ref(false)
const strikeZoneTop = ref(0)
const strikeZoneBottom = ref(0)
const isSubmitting = ref(false)

function openStrikeZoneModal() {
  strikeZoneTop.value = training.value?.strike_zone_top ?? 120
  strikeZoneBottom.value = training.value?.strike_zone_bottom ?? 50
  isStrikeZoneModalOpen.value = true
}

async function saveStrikeZone() {
  if (isSubmitting.value)
    return
  isSubmitting.value = true

  try {
    const body: UpdateStrikeZoneBody = {
      strike_zone_top: strikeZoneTop.value,
      strike_zone_bottom: strikeZoneBottom.value,
    }
    await $fetch(`/api/trainings/${trainingId.value}/strike-zone`, {
      method: 'PUT',
      body,
    })
    toast.add({ title: '好球帶設定已更新', color: 'success' })
    isStrikeZoneModalOpen.value = false
    await refreshTraining()
  }
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : '更新失敗'
    toast.add({ title: message, color: 'error' })
  }
  finally {
    isSubmitting.value = false
  }
}

// 統計卡片資料
const statCards = computed(() => [
  { label: '總投球數', value: totalPitches.value, testid: 'training-detail-total-pitches', unit: '球' },
  { label: '好球數', value: strikeCount.value, testid: 'training-detail-strike-count', unit: '球' },
  { label: '壞球數', value: ballCount.value, testid: 'training-detail-ball-count', unit: '球' },
  { label: '好球率', value: `${strikeRate.value}%`, testid: 'training-detail-strike-rate', unit: '' },
  { label: '平均球速', value: avgVelocity.value, testid: 'training-detail-avg-velocity', unit: 'km/h' },
])
</script>

<template>
  <div data-testid="training-detail-page" class="flex h-full flex-col gap-6 overflow-y-auto">
    <!-- 頂部：返回 + 標題 -->
    <div class="flex items-center gap-4">
      <UButton
        icon="i-heroicons-arrow-left"
        color="neutral"
        variant="ghost"
        @click="router.push('/trainings')"
      />
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
        訓練詳情
      </h1>
      <!-- AI 狀態與操作 -->
      <div class="ml-auto flex items-center gap-2">
        <UBadge
          :color="aiStatus === 'running' ? 'success' : 'neutral'"
          variant="subtle"
        >
          AI {{ aiStatus === 'running' ? '運行中' : '已停止' }}
        </UBadge>
        <UButton
          data-testid="training-ai-start"
          label="啟動 AI"
          icon="i-heroicons-play"
          color="success"
          size="sm"
          :loading="isAiLoading"
          @click="startAi"
        />
        <UButton
          data-testid="training-ai-stop"
          label="停止 AI"
          icon="i-heroicons-stop"
          color="error"
          size="sm"
          :loading="isAiLoading"
          @click="stopAi"
        />
      </div>
    </div>

    <!-- 訓練基本資訊 -->
    <div class="grid grid-cols-2 gap-4 rounded-lg border border-neutral-200 bg-white p-4 md:grid-cols-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          日期
        </p>
        <p data-testid="training-detail-date" class="font-medium text-neutral-900 dark:text-white">
          {{ training?.date ?? '-' }}
        </p>
      </div>
      <div>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          球隊
        </p>
        <p data-testid="training-detail-team" class="font-medium text-neutral-900 dark:text-white">
          {{ training?.team_name ?? '-' }}
        </p>
      </div>
      <div>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          選手
        </p>
        <p data-testid="training-detail-player" class="font-medium text-neutral-900 dark:text-white">
          {{ training?.player_name ?? '-' }}
        </p>
      </div>
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            好球帶範圍
          </p>
          <p class="font-medium text-neutral-900 dark:text-white">
            <span data-testid="training-detail-strike-top">{{ training?.strike_zone_top ?? '-' }}</span>
            ~
            <span data-testid="training-detail-strike-bottom">{{ training?.strike_zone_bottom ?? '-' }}</span>
            cm
          </p>
        </div>
        <UButton
          data-testid="strike-zone-setting"
          icon="i-heroicons-cog-6-tooth"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="openStrikeZoneModal"
        />
      </div>
    </div>

    <!-- 即時統計卡片 -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-5">
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

    <!-- 投球清單表格 -->
    <div class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div class="flex shrink-0 items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <h2 class="font-semibold text-neutral-900 dark:text-white">
          投球清單
        </h2>
        <UButton
          label="訓練分析"
          icon="i-heroicons-chart-bar"
          color="primary"
          variant="soft"
          size="sm"
          @click="router.push(`/trainings/${trainingId}/analysis`)"
        />
      </div>
      <div data-testid="pitch-list" class="min-h-0 flex-1 overflow-auto">
        <UTable
          :data="pitches"
          :columns="columns"
          class="w-full"
          @select="handlePitchClick"
        >
          <template #is_strike-cell="{ row }">
            <UBadge
              :color="row.original.is_strike ? 'success' : 'error'"
              variant="subtle"
              size="sm"
            >
              {{ row.original.is_strike ? '好球' : '壞球' }}
            </UBadge>
          </template>
        </UTable>
      </div>
    </div>

    <!-- 好球帶設定 Modal -->
    <UModal v-model:open="isStrikeZoneModalOpen">
      <template #content>
        <div data-testid="strike-zone-modal" class="p-6">
          <h3 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            好球帶設定
          </h3>
          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                上緣 (cm)
              </label>
              <UInput
                v-model.number="strikeZoneTop"
                data-testid="strike-zone-top"
                type="number"
                placeholder="90-150"
                :min="90"
                :max="150"
              />
              <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                範圍：90 ~ 150 cm
              </p>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                下緣 (cm)
              </label>
              <UInput
                v-model.number="strikeZoneBottom"
                data-testid="strike-zone-bottom"
                type="number"
                placeholder="30-70"
                :min="30"
                :max="70"
              />
              <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                範圍：30 ~ 70 cm
              </p>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <UButton
              label="取消"
              color="neutral"
              variant="outline"
              @click="isStrikeZoneModalOpen = false"
            />
            <UButton
              data-testid="strike-zone-save"
              label="儲存"
              color="primary"
              :loading="isSubmitting"
              @click="saveStrikeZone"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
