<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import type { PitchItem } from '~/types/api/pitches'
import type { TrainingDetail } from '~/types/api/trainings'
import { z } from 'zod'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const trainingId = computed(() => route.params.id as string)

// 取得訓練詳情
const { data: trainingResult, refresh: refreshTraining } = await useFetch<{ data: TrainingDetail }>(
  computed(() => `/api/trainings/${trainingId.value}`),
)
const training = computed<TrainingDetail | null>(() => trainingResult.value?.data ?? null)

// 取得投球清單
const { data: pitchesResult, refresh: refreshPitches } = await useFetch<{ data: PitchItem[] }>(
  computed(() => `/api/trainings/${trainingId.value}/pitches`),
)
const pitches = computed<PitchItem[]>(() => pitchesResult.value?.data ?? [])

// 即時統計
const totalPitches = computed(() => pitches.value.length)
const strikeCount = computed(() => pitches.value.filter(p => p.is_strike).length)
const ballCount = computed(() => pitches.value.filter(p => !p.is_strike).length)
const strikeRate = computed(() => {
  if (totalPitches.value === 0)
    return '0%'
  return `${((strikeCount.value / totalPitches.value) * 100).toFixed(1)}%`
})
const avgVelocity = computed(() => {
  if (totalPitches.value === 0)
    return '0'
  const sum = pitches.value.reduce((acc, p) => acc + p.velocity, 0)
  return (sum / totalPitches.value).toFixed(2)
})

// 投球清單欄位
const pitchColumns: TableColumn<PitchItem>[] = [
  { accessorKey: 'sequence', header: '球序' },
  { accessorKey: 'time', header: '時間' },
  { accessorKey: 'velocity', header: '球速 (km/h)' },
  { accessorKey: 'spin_rate', header: '轉速 (rpm)' },
  { accessorKey: 'is_strike', header: '好壞球' },
  { accessorKey: 'location_x', header: '落點' },
]

// AI 控制
const aiLoading = ref(false)

async function startAI() {
  aiLoading.value = true
  try {
    await $fetch(`/api/trainings/${trainingId.value}/ai/start`, { method: 'POST' })
    toast.add({ title: 'AI 系統已啟動', color: 'success' })
    await refreshTraining()
  }
  catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message
      || (err as { message?: string })?.message
      || '啟動失敗'
    toast.add({ title: message, color: 'error' })
  }
  finally {
    aiLoading.value = false
  }
}

async function stopAI() {
  aiLoading.value = true
  try {
    await $fetch(`/api/trainings/${trainingId.value}/ai/stop`, { method: 'POST' })
    toast.add({ title: 'AI 系統已關閉', color: 'success' })
    await refreshTraining()
  }
  catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message
      || (err as { message?: string })?.message
      || '關閉失敗'
    toast.add({ title: message, color: 'error' })
  }
  finally {
    aiLoading.value = false
  }
}

// SSE 即時更新（AI 運行中時）
let eventSource: EventSource | null = null

function connectSSE() {
  if (!import.meta.client)
    return
  if (eventSource) {
    eventSource.close()
  }
  eventSource = new EventSource(`/api/trainings/${trainingId.value}/pitches/stream`)
  eventSource.onmessage = () => {
    refreshPitches()
  }
  eventSource.onerror = () => {
    // 自動重連由 EventSource 內建處理
  }
}

function disconnectSSE() {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
}

onMounted(() => {
  // 初始連線（僅限 client-side）
  if (training.value?.ai_status === 'running') {
    connectSSE()
  }

  // 監聽 AI 狀態變更
  watch(() => training.value?.ai_status, (status) => {
    if (status === 'running') {
      connectSSE()
    }
    else {
      disconnectSSE()
    }
  })
})

onUnmounted(() => {
  disconnectSSE()
})

// 好球帶設定彈窗
const isStrikeZoneOpen = ref(false)
const strikeZoneLoading = ref(false)

const strikeZoneSchema = z.object({
  top: z.number({ error: '請輸入上緣' }).min(90, '上緣必須為 90-150 公分').max(150, '上緣必須為 90-150 公分'),
  bottom: z.number({ error: '請輸入下緣' }).min(30, '下緣必須為 30-70 公分').max(70, '下緣必須為 30-70 公分'),
}).refine(data => data.top > data.bottom, {
  message: '上緣必須大於下緣',
  path: ['top'],
})

type StrikeZoneSchema = z.infer<typeof strikeZoneSchema>

const strikeZoneState = reactive<StrikeZoneSchema>({
  top: 120,
  bottom: 50,
})

function openStrikeZone() {
  strikeZoneState.top = training.value?.strike_zone_top ?? 120
  strikeZoneState.bottom = training.value?.strike_zone_bottom ?? 50
  isStrikeZoneOpen.value = true
}

async function onStrikeZoneSubmit(event: FormSubmitEvent<StrikeZoneSchema>) {
  strikeZoneLoading.value = true
  try {
    await $fetch(`/api/trainings/${trainingId.value}/strike-zone`, {
      method: 'PUT',
      body: { top: event.data.top, bottom: event.data.bottom },
    })
    toast.add({ title: '好球帶範圍已更新', color: 'success' })
    isStrikeZoneOpen.value = false
    await refreshTraining()
  }
  catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message
      || (err as { message?: string })?.message
      || '更新失敗'
    toast.add({ title: message, color: 'error' })
  }
  finally {
    strikeZoneLoading.value = false
  }
}

// 單球儀表板（Modal）
const selectedPitch = ref<PitchItem | null>(null)
const isPitchModalOpen = ref(false)
const pitchViewTab = ref('grid')

function openPitchDashboard(_e: Event, row: { original: PitchItem }) {
  selectedPitch.value = row.original
  pitchViewTab.value = 'grid'
  isPitchModalOpen.value = true
}

function formatTime(timeStr: string) {
  return timeStr.split('T')[1]?.substring(0, 8) ?? timeStr
}
</script>

<template>
  <div data-testid="training-detail-page" class="flex h-full flex-col">
    <template v-if="training">
      <!-- Header -->
      <div class="mb-6 flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div>
          <div class="mb-2 flex items-center gap-2">
            <UButton
              icon="i-heroicons-arrow-left"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="router.push('/trainings')"
            />
            <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
              訓練詳情
            </h1>
          </div>
        </div>

        <!-- AI 控制 -->
        <div class="flex items-center gap-3">
          <UBadge
            data-testid="training-ai-status"
            :color="training.ai_status === 'running' ? 'success' : 'neutral'"
            variant="subtle"
            size="lg"
          >
            {{ training.ai_status === 'running' ? '運行中' : '已停止' }}
          </UBadge>
          <UButton
            v-if="training.ai_status !== 'running'"
            data-testid="training-ai-start"
            icon="i-heroicons-play"
            color="primary"
            :loading="aiLoading"
            @click="startAI"
          >
            啟動 AI
          </UButton>
          <UButton
            v-else
            data-testid="training-ai-stop"
            icon="i-heroicons-stop"
            color="error"
            :loading="aiLoading"
            @click="stopAI"
          >
            關閉 AI
          </UButton>
        </div>
      </div>

      <!-- 訓練基本資訊 + 統計 -->
      <div class="mb-6 grid shrink-0 grid-cols-1 gap-4 lg:grid-cols-2">
        <!-- 基本資訊 -->
        <UCard>
          <div data-testid="training-info" class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-neutral-900 dark:text-white">
                訓練資訊
              </h3>
              <UButton
                data-testid="strike-zone-edit"
                icon="i-heroicons-pencil"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="openStrikeZone"
              />
            </div>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span class="text-neutral-500 dark:text-neutral-400">日期</span>
                <p class="font-medium text-neutral-900 dark:text-white">
                  {{ training.date }}
                </p>
              </div>
              <div>
                <span class="text-neutral-500 dark:text-neutral-400">受測選手</span>
                <p class="font-medium text-neutral-900 dark:text-white">
                  {{ training.player_name }}
                </p>
              </div>
              <div>
                <span class="text-neutral-500 dark:text-neutral-400">所屬球隊</span>
                <p class="font-medium text-neutral-900 dark:text-white">
                  {{ training.team_name }}
                </p>
              </div>
              <div>
                <span class="text-neutral-500 dark:text-neutral-400">好球帶</span>
                <p class="font-medium text-neutral-900 dark:text-white">
                  {{ training.strike_zone_top }}cm - {{ training.strike_zone_bottom }}cm
                </p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- 即時統計 -->
        <UCard>
          <div data-testid="training-stats">
            <h3 class="mb-3 font-semibold text-neutral-900 dark:text-white">
              即時統計
            </h3>
            <div class="grid grid-cols-3 gap-3 text-center sm:grid-cols-5">
              <div>
                <p data-testid="training-total-pitches" class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {{ totalPitches }}
                </p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                  總投球數
                </p>
              </div>
              <div>
                <p data-testid="training-strike-count" class="text-2xl font-bold text-success-600 dark:text-success-400">
                  {{ strikeCount }}
                </p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                  好球
                </p>
              </div>
              <div>
                <p data-testid="training-ball-count" class="text-2xl font-bold text-error-600 dark:text-error-400">
                  {{ ballCount }}
                </p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                  壞球
                </p>
              </div>
              <div>
                <p data-testid="training-strike-rate" class="text-2xl font-bold text-neutral-900 dark:text-white">
                  {{ strikeRate }}
                </p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                  好球率
                </p>
              </div>
              <div>
                <p data-testid="training-avg-velocity" class="text-2xl font-bold text-neutral-900 dark:text-white">
                  {{ avgVelocity }}
                </p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                  平均球速
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- 投球清單 -->
      <UCard class="min-h-0 flex-1" :ui="{ body: 'p-0 overflow-auto flex-1 min-h-0', root: 'flex flex-col min-h-0' }">
        <div class="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h3 class="font-semibold text-neutral-900 dark:text-white">
            投球清單
          </h3>
        </div>
        <div class="min-h-0 flex-1 overflow-auto">
          <UTable
            data-testid="pitch-list"
            :data="pitches"
            :columns="pitchColumns"
            class="w-full"
            @select="openPitchDashboard"
          >
            <template #sequence-cell="{ row }">
              <span data-testid="pitch-row" class="font-medium text-neutral-900 dark:text-white">{{ row.original.sequence }}</span>
            </template>
            <template #time-cell="{ row }">
              {{ formatTime(row.original.time) }}
            </template>
            <template #is_strike-cell="{ row }">
              <UBadge
                :color="row.original.is_strike ? 'success' : 'error'"
                variant="subtle"
              >
                {{ row.original.is_strike ? '好球' : '壞球' }}
              </UBadge>
            </template>
            <template #location_x-cell="{ row }">
              ({{ row.original.location_x }}, {{ row.original.location_y }})
            </template>
          </UTable>

          <CommonEmptyState v-if="pitches.length === 0" title="尚無投球紀錄" description="啟動 AI 系統開始記錄投球" />
        </div>
      </UCard>
    </template>

    <!-- 好球帶設定彈窗 -->
    <UModal v-model:open="isStrikeZoneOpen">
      <template #content>
        <div data-testid="strike-zone-form-modal" class="p-6">
          <h3 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            好球帶設定
          </h3>
          <UForm :schema="strikeZoneSchema" :state="strikeZoneState" @submit="onStrikeZoneSubmit">
            <div class="space-y-2">
              <UFormField label="上緣 (cm)" name="top" required class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }">
                <UInput
                  v-model.number="strikeZoneState.top"
                  data-testid="strike-zone-upper"
                  type="number"
                  placeholder="90-150"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="下緣 (cm)" name="bottom" required class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }">
                <UInput
                  v-model.number="strikeZoneState.bottom"
                  data-testid="strike-zone-lower"
                  type="number"
                  placeholder="30-70"
                  class="w-full"
                />
              </UFormField>
            </div>
            <div class="mt-6 flex justify-end gap-3">
              <UButton
                color="neutral"
                variant="outline"
                :disabled="strikeZoneLoading"
                @click="isStrikeZoneOpen = false"
              >
                取消
              </UButton>
              <UButton
                data-testid="strike-zone-save"
                type="submit"
                color="primary"
                :loading="strikeZoneLoading"
              >
                儲存
              </UButton>
            </div>
          </UForm>
        </div>
      </template>
    </UModal>

    <!-- 單球儀表板 Modal -->
    <UModal v-model:open="isPitchModalOpen" :ui="{ content: 'sm:max-w-2xl' }">
      <template #content>
        <div v-if="selectedPitch" data-testid="pitch-dashboard-page" class="p-6">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
              第 {{ selectedPitch.sequence }} 球詳情
            </h3>
            <UButton
              icon="i-heroicons-x-mark"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="isPitchModalOpen = false"
            />
          </div>

          <!-- 數據摘要 -->
          <div class="mb-4 grid grid-cols-4 gap-3 text-center">
            <div>
              <p data-testid="pitch-velocity-label" class="text-lg font-bold text-primary-600 dark:text-primary-400">
                {{ selectedPitch.velocity }} km/h
              </p>
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                球速
              </p>
            </div>
            <div>
              <p class="text-lg font-bold text-neutral-900 dark:text-white">
                {{ selectedPitch.spin_rate }}
              </p>
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                轉速 (rpm)
              </p>
            </div>
            <div>
              <UBadge :color="selectedPitch.is_strike ? 'success' : 'error'" variant="subtle">
                {{ selectedPitch.is_strike ? '好球' : '壞球' }}
              </UBadge>
            </div>
            <div>
              <p data-testid="pitch-location-marker" class="text-lg font-bold text-neutral-900 dark:text-white">
                ({{ selectedPitch.location_x }}, {{ selectedPitch.location_y }})
              </p>
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                落點
              </p>
            </div>
          </div>

          <!-- Tab 切換 -->
          <div class="mb-4 flex gap-2">
            <UButton
              data-testid="pitch-grid-tab"
              :color="pitchViewTab === 'grid' ? 'primary' : 'neutral'"
              :variant="pitchViewTab === 'grid' ? 'solid' : 'outline'"
              size="sm"
              @click="pitchViewTab = 'grid'"
            >
              九宮格
            </UButton>
            <UButton
              data-testid="pitch-3d-tab"
              :color="pitchViewTab === '3d' ? 'primary' : 'neutral'"
              :variant="pitchViewTab === '3d' ? 'solid' : 'outline'"
              size="sm"
              @click="pitchViewTab = '3d'"
            >
              3D 軌跡
            </UButton>
          </div>

          <!-- 九宮格視圖 -->
          <div v-if="pitchViewTab === 'grid'" data-testid="pitch-grid-view">
            <div data-testid="pitch-strike-zone" class="relative mx-auto aspect-square w-64 rounded border-2 border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
              <!-- 好球帶框線 -->
              <div class="absolute inset-x-4 border-2 border-dashed border-primary-400" :style="{ top: '10%', bottom: '30%' }">
                <span class="absolute -top-5 left-0 text-xs text-neutral-500 dark:text-neutral-400">
                  {{ training?.strike_zone_top }}cm
                </span>
                <span class="absolute -bottom-5 left-0 text-xs text-neutral-500 dark:text-neutral-400">
                  {{ training?.strike_zone_bottom }}cm
                </span>
              </div>
              <!-- 九宮格線 -->
              <div class="absolute inset-x-4" :style="{ top: '10%', bottom: '30%' }">
                <div class="absolute left-1/3 top-0 h-full border-l border-neutral-300 dark:border-neutral-600" />
                <div class="absolute left-2/3 top-0 h-full border-l border-neutral-300 dark:border-neutral-600" />
                <div class="absolute left-0 top-1/3 w-full border-t border-neutral-300 dark:border-neutral-600" />
                <div class="absolute left-0 top-2/3 w-full border-t border-neutral-300 dark:border-neutral-600" />
              </div>
              <!-- 落點標記 -->
              <div
                class="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full"
                :class="selectedPitch.is_strike ? 'bg-success-500' : 'bg-error-500'"
                :style="{
                  left: `${50 + selectedPitch.location_x * 30}%`,
                  top: `${50 - selectedPitch.location_y * 30}%`,
                }"
              >
                <span class="absolute -top-5 left-5 whitespace-nowrap text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {{ selectedPitch.velocity }} km/h
                </span>
              </div>
            </div>
          </div>

          <!-- 3D 軌跡視圖（佔位） -->
          <div v-if="pitchViewTab === '3d'" data-testid="pitch-3d-view" class="flex h-64 items-center justify-center rounded bg-neutral-50 dark:bg-neutral-800">
            <div class="text-center">
              <UIcon name="i-heroicons-cube-transparent" class="mx-auto size-12 text-neutral-400" />
              <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                3D 入壘軌跡視圖
              </p>
              <p class="text-xs text-neutral-400">
                好球帶：{{ training?.strike_zone_top }}cm - {{ training?.strike_zone_bottom }}cm
              </p>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
