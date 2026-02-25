<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import type { AiSystemStatus } from '~/types/api/ai'
import type { PitchItem } from '~/types/api/pitches'
import type { TrainingDetail } from '~/types/api/trainings'
import { z } from 'zod'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const trainingId = computed(() => Number(route.params.id))

// 取得訓練詳情
const { data: trainingData, refresh: refreshTraining } = await useFetch<{
  status: string
  data: TrainingDetail
}>(() => `/api/trainings/${trainingId.value}`)

const training = computed(() => trainingData.value?.data)

// 取得投球清單
const { data: pitchesData, refresh: _refreshPitches } = await useFetch<{
  status: string
  data: PitchItem[]
}>(() => `/api/trainings/${trainingId.value}/pitches`)

const pitches = computed(() => pitchesData.value?.data ?? [])

// 取得 AI 狀態
const { data: aiData, refresh: refreshAi } = await useFetch<{
  status: string
  data: AiSystemStatus
}>('/api/ai/status')

const aiStatus = computed(() => aiData.value?.data)

// 即時統計（前端計算）
const stats = computed(() => {
  const list = pitches.value
  if (!list.length) {
    return { total: 0, strikes: 0, balls: 0, strikeRate: '0%', avgVelocity: '0' }
  }
  const strikes = list.filter(p => p.is_strike).length
  const balls = list.length - strikes
  const rate = Math.round((strikes / list.length) * 1000) / 10
  const avgV = Math.round(list.reduce((sum, p) => sum + p.velocity, 0) / list.length * 100) / 100
  return {
    total: list.length,
    strikes,
    balls,
    strikeRate: `${rate}%`,
    avgVelocity: String(avgV),
  }
})

// 投球清單欄位
const pitchColumns: TableColumn<PitchItem>[] = [
  { accessorKey: 'sequence', header: '球序' },
  { accessorKey: 'time', header: '投球時間' },
  { accessorKey: 'velocity', header: '球速 (km/h)' },
  { accessorKey: 'spin_rate', header: '轉速 (rpm)' },
  { accessorKey: 'is_strike', header: '好壞球' },
  { accessorKey: 'location', header: '落點 (x, y)' },
]

function handleSelectPitch(_e: Event, row: { original: PitchItem }) {
  router.push(`/trainings/${trainingId.value}/pitches/${row.original.id}`)
}

// === AI 控制 ===
const isAiLoading = ref(false)

async function startAi() {
  if (isAiLoading.value)
    return
  isAiLoading.value = true
  try {
    await $fetch('/api/ai/start', {
      method: 'POST',
      body: { training_id: trainingId.value },
    })
    toast.add({ title: 'AI 系統已啟動', color: 'success' })
    await Promise.all([refreshTraining(), refreshAi()])
  }
  catch (error: any) {
    toast.add({ title: '啟動失敗', description: error?.data?.message || '操作失敗', color: 'error' })
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
    toast.add({ title: 'AI 系統已關閉', color: 'success' })
    await Promise.all([refreshTraining(), refreshAi()])
  }
  catch (error: any) {
    toast.add({ title: '關閉失敗', description: error?.data?.message || '操作失敗', color: 'error' })
  }
  finally {
    isAiLoading.value = false
  }
}

// === 好球帶設定 ===
const isStrikeZoneModalOpen = ref(false)
const isStrikeZoneSaving = ref(false)

const strikeZoneSchema = z.object({
  top: z.number({ error: '請輸入上緣' }).min(90, '上緣範圍 90-150').max(150, '上緣範圍 90-150'),
  bottom: z.number({ error: '請輸入下緣' }).min(30, '下緣範圍 30-70').max(70, '下緣範圍 30-70'),
})

type StrikeZoneSchema = z.output<typeof strikeZoneSchema>

const strikeZoneState = reactive<StrikeZoneSchema>({
  top: 120,
  bottom: 50,
})

function openStrikeZoneModal() {
  if (training.value) {
    strikeZoneState.top = training.value.strike_zone_top
    strikeZoneState.bottom = training.value.strike_zone_bottom
  }
  isStrikeZoneModalOpen.value = true
}

async function onStrikeZoneSubmit(event: FormSubmitEvent<StrikeZoneSchema>) {
  if (isStrikeZoneSaving.value)
    return
  if (event.data.top <= event.data.bottom) {
    toast.add({ title: '驗證錯誤', description: '上緣必須大於下緣', color: 'error' })
    return
  }
  isStrikeZoneSaving.value = true
  try {
    await $fetch(`/api/trainings/${trainingId.value}/strike-zone`, {
      method: 'PUT',
      body: event.data,
    })
    toast.add({ title: '好球帶設定已更新', color: 'success' })
    isStrikeZoneModalOpen.value = false
    await refreshTraining()
  }
  catch (error: any) {
    toast.add({ title: '更新失敗', description: error?.data?.message || '操作失敗', color: 'error' })
  }
  finally {
    isStrikeZoneSaving.value = false
  }
}
</script>

<template>
  <div data-testid="training-detail-page" class="flex h-full flex-col gap-6">
    <!-- 頂部：返回 + 標題 + AI 控制 -->
    <div class="flex shrink-0 flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <UButton
          icon="i-heroicons-arrow-left"
          color="neutral"
          variant="ghost"
          @click="router.push('/trainings')"
        />
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
          訓練詳情
        </h1>
      </div>
      <div class="flex items-center gap-3">
        <span data-testid="training-ai-status">
          <UBadge
            :color="aiStatus?.status === 'running' ? 'success' : 'neutral'"
            variant="subtle"
          >
            AI {{ aiStatus?.status === 'running' ? '運行中' : '已關閉' }}
          </UBadge>
        </span>
        <UButton
          v-if="aiStatus?.status !== 'running'"
          data-testid="training-ai-start"
          icon="i-heroicons-play"
          color="success"
          :loading="isAiLoading"
          @click="startAi"
        >
          啟動 AI
        </UButton>
        <UButton
          v-else
          data-testid="training-ai-stop"
          icon="i-heroicons-stop"
          color="error"
          :loading="isAiLoading"
          @click="stopAi"
        >
          關閉 AI
        </UButton>
        <UButton
          icon="i-heroicons-chart-bar"
          color="neutral"
          variant="outline"
          @click="router.push(`/trainings/${trainingId}/analysis`)"
        >
          查看分析
        </UButton>
      </div>
    </div>

    <!-- 訓練基本資訊 -->
    <UCard v-if="training" data-testid="training-info">
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p class="text-sm text-neutral-500">
            日期
          </p>
          <p class="font-medium text-neutral-900 dark:text-white">
            {{ training.date }}
          </p>
        </div>
        <div>
          <p class="text-sm text-neutral-500">
            受測選手
          </p>
          <p class="font-medium text-neutral-900 dark:text-white">
            {{ training.player_name }}
          </p>
        </div>
        <div>
          <p class="text-sm text-neutral-500">
            球隊
          </p>
          <p class="font-medium text-neutral-900 dark:text-white">
            {{ training.team_name }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <div>
            <p class="text-sm text-neutral-500">
              好球帶
            </p>
            <p class="font-medium text-neutral-900 dark:text-white">
              {{ training.strike_zone_top }} ~ {{ training.strike_zone_bottom }} cm
            </p>
          </div>
          <UButton
            data-testid="strike-zone-edit"
            icon="i-heroicons-pencil"
            color="neutral"
            variant="ghost"
            size="xs"
            @click="openStrikeZoneModal"
          />
        </div>
      </div>
    </UCard>

    <!-- 即時統計 -->
    <UCard data-testid="training-stats">
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            總投球數
          </p>
          <p data-testid="training-total-pitches" class="text-2xl font-bold text-neutral-900 dark:text-white">
            {{ stats.total }}
          </p>
        </div>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            好球數
          </p>
          <p data-testid="training-strike-count" class="text-2xl font-bold text-success-600 dark:text-success-400">
            {{ stats.strikes }}
          </p>
        </div>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            壞球數
          </p>
          <p data-testid="training-ball-count" class="text-2xl font-bold text-error-600 dark:text-error-400">
            {{ stats.balls }}
          </p>
        </div>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            好球率
          </p>
          <p data-testid="training-strike-rate" class="text-2xl font-bold text-neutral-900 dark:text-white">
            {{ stats.strikeRate }}
          </p>
        </div>
        <div class="text-center">
          <p class="text-sm text-neutral-500">
            平均球速
          </p>
          <p data-testid="training-avg-velocity" class="text-2xl font-bold text-neutral-900 dark:text-white">
            {{ stats.avgVelocity }}
          </p>
        </div>
      </div>
    </UCard>

    <!-- 投球清單 -->
    <UCard class="min-h-0 flex-1" :ui="{ body: 'h-full flex flex-col p-0' }">
      <div class="min-h-0 flex-1 overflow-auto">
        <CommonEmptyState
          v-if="!pitches.length"
          icon="i-heroicons-clipboard-document-list"
          title="尚無投球紀錄"
          description="啟動 AI 系統開始偵測投球"
        />
        <UTable
          v-else
          data-testid="pitch-list"
          :data="pitches"
          :columns="pitchColumns"
          class="[&_td]:h-12 [&_th]:h-10"
          :ui="{ tr: 'cursor-pointer hover:bg-elevated' }"
          @select="handleSelectPitch"
        >
          <template #is_strike-cell="{ row }">
            <UBadge
              data-testid="pitch-row"
              :color="row.original.is_strike ? 'success' : 'error'"
              variant="subtle"
            >
              {{ row.original.is_strike ? '好球' : '壞球' }}
            </UBadge>
          </template>
          <template #location-cell="{ row }">
            ({{ row.original.location_x }}, {{ row.original.location_y }})
          </template>
        </UTable>
      </div>
    </UCard>

    <!-- 好球帶設定 Modal -->
    <UModal v-model:open="isStrikeZoneModalOpen">
      <template #content>
        <div data-testid="strike-zone-form-modal" class="p-6">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
            好球帶設定
          </h3>
          <UForm
            :schema="strikeZoneSchema"
            :state="strikeZoneState"
            class="mt-4 space-y-4"
            @submit="onStrikeZoneSubmit"
          >
            <UFormField
              label="上緣 (cm)"
              name="top"
              class="relative mb-8"
              :ui="{ error: 'absolute top-full left-0 mt-1' }"
            >
              <UInput
                v-model.number="strikeZoneState.top"
                data-testid="strike-zone-upper"
                type="number"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="下緣 (cm)"
              name="bottom"
              class="relative mb-8"
              :ui="{ error: 'absolute top-full left-0 mt-1' }"
            >
              <UInput
                v-model.number="strikeZoneState.bottom"
                data-testid="strike-zone-lower"
                type="number"
                class="w-full"
              />
            </UFormField>
            <div class="flex justify-end gap-3">
              <UButton color="neutral" variant="outline" :disabled="isStrikeZoneSaving" @click="isStrikeZoneModalOpen = false">
                取消
              </UButton>
              <UButton type="submit" data-testid="strike-zone-save" color="primary" :loading="isStrikeZoneSaving">
                儲存
              </UButton>
            </div>
          </UForm>
        </div>
      </template>
    </UModal>
  </div>
</template>
