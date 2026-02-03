<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'

interface Pitch {
  id: number
  sequence: number
  time: string
  velocity: number
  spin_rate: number
  is_strike: boolean
  location_x: number
  location_y: number
}

const route = useRoute()
const router = useRouter()
const { isAuthenticated, userAccount, userRole } = useAuth()
const toast = useToast()

// 權限檢查
watch(isAuthenticated, (value) => {
  if (!value)
    router.push('/login')
}, { immediate: true })

const trainingId = computed(() => Number(route.params.id))

// 狀態
const training = ref<{
  id: number
  date: string
  player_name: string
  player_height: number
  team_name: string
  pitch_count: number
  ai_status: 'running' | 'stopped'
  strike_zone_top: number
  strike_zone_bottom: number
  stats: {
    total_pitches: number
    strike_count: number
    ball_count: number
    strike_rate: number
    avg_velocity: number
    avg_spin_rate: number
  }
} | null>(null)

const pitches = ref<Pitch[]>([])

const isLoading = ref(false)
const isAIControlLoading = ref(false)
const isStrikeZoneModalOpen = ref(false)
const isStrikeZoneSubmitting = ref(false)

// 好球帶設定表單
const strikeZoneSchema = z.object({
  strike_zone_top: z.coerce.number().int().min(90, '好球帶上緣必須為 90-150 公分').max(150, '好球帶上緣必須為 90-150 公分'),
  strike_zone_bottom: z.coerce.number().int().min(30, '好球帶下緣必須為 30-70 公分').max(70, '好球帶下緣必須為 30-70 公分'),
}).refine(data => data.strike_zone_top > data.strike_zone_bottom, {
  message: '上緣必須大於下緣',
  path: ['strike_zone_top'],
})

type StrikeZoneSchema = z.output<typeof strikeZoneSchema>

const strikeZoneForm = reactive({
  strike_zone_top: 120,
  strike_zone_bottom: 50,
})

// 表格欄位
const columns = [
  { accessorKey: 'sequence', header: '#' },
  { accessorKey: 'time', header: '時間' },
  { accessorKey: 'velocity', header: '球速' },
  { accessorKey: 'spin_rate', header: '轉速' },
  { accessorKey: 'is_strike', header: '好壞球' },
  { accessorKey: 'location', header: '落點' },
  { accessorKey: 'actions', header: '操作' },
]

// 載入訓練資料
async function fetchTraining() {
  isLoading.value = true
  try {
    const response = await $fetch(`/api/trainings/${trainingId.value}`, {
      query: {
        user: userAccount.value,
        role: userRole.value,
      },
    })

    if (response.status === 'success') {
      training.value = response.data as typeof training.value
    }
  }
  catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: '載入失敗',
      description: err.data?.message || '無法載入訓練資料',
      color: 'error',
    })
    router.push('/trainings')
  }
  finally {
    isLoading.value = false
  }
}

// 載入投球清單
async function fetchPitches() {
  try {
    const response = await $fetch(`/api/trainings/${trainingId.value}/pitches`, {
      query: {
        user: userAccount.value,
        role: userRole.value,
      },
    })

    if (response.status === 'success') {
      pitches.value = response.data as typeof pitches.value
    }
  }
  catch {
    // Ignore
  }
}

// 啟動 AI 系統
async function startAI() {
  if (isAIControlLoading.value)
    return
  isAIControlLoading.value = true

  try {
    const response = await $fetch('/api/ai/start', {
      method: 'POST',
      body: {
        training_id: trainingId.value,
        user: userAccount.value,
        role: userRole.value,
      },
    })

    if (response.status === 'success') {
      toast.add({
        title: 'AI 系統已啟動',
        description: '開始偵測投球',
        color: 'success',
      })
      await fetchTraining()
    }
  }
  catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: '啟動失敗',
      description: err.data?.message || '無法啟動 AI 系統',
      color: 'error',
    })
  }
  finally {
    isAIControlLoading.value = false
  }
}

// 關閉 AI 系統
async function stopAI() {
  if (isAIControlLoading.value)
    return
  isAIControlLoading.value = true

  try {
    const response = await $fetch('/api/ai/stop', {
      method: 'POST',
      body: {
        training_id: trainingId.value,
        user: userAccount.value,
        role: userRole.value,
      },
    })

    if (response.status === 'success') {
      toast.add({
        title: 'AI 系統已關閉',
        description: '停止偵測投球',
        color: 'info',
      })
      await fetchTraining()
    }
  }
  catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: '關閉失敗',
      description: err.data?.message || '無法關閉 AI 系統',
      color: 'error',
    })
  }
  finally {
    isAIControlLoading.value = false
  }
}

// 格式化時間
function formatTime(timeString: string) {
  return new Date(timeString).toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// 開啟好球帶設定 Modal
function openStrikeZoneModal() {
  if (!training.value)
    return
  strikeZoneForm.strike_zone_top = training.value.strike_zone_top
  strikeZoneForm.strike_zone_bottom = training.value.strike_zone_bottom
  isStrikeZoneModalOpen.value = true
}

// 提交好球帶設定
async function handleStrikeZoneSubmit(event: FormSubmitEvent<StrikeZoneSchema>) {
  if (isStrikeZoneSubmitting.value)
    return
  isStrikeZoneSubmitting.value = true

  try {
    const response = await $fetch(`/api/trainings/${trainingId.value}/strike-zone`, {
      method: 'PUT',
      body: {
        strike_zone_top: event.data.strike_zone_top,
        strike_zone_bottom: event.data.strike_zone_bottom,
        user: userAccount.value,
        role: userRole.value,
      },
    })

    if (response.status === 'success') {
      toast.add({
        title: '設定成功',
        description: '好球帶範圍已更新',
        color: 'success',
      })
      isStrikeZoneModalOpen.value = false
      await fetchTraining()
    }
  }
  catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: '設定失敗',
      description: err.data?.message || '無法更新好球帶設定',
      color: 'error',
    })
  }
  finally {
    isStrikeZoneSubmitting.value = false
  }
}

// 載入資料
onMounted(async () => {
  await fetchTraining()
  await fetchPitches()
})
</script>

<template>
  <div class="flex flex-col h-full">
    <CommonPageHeader
      :title="training ? `訓練紀錄 - ${training.player_name}` : '訓練紀錄'"
      :description="training ? `${training.team_name} | ${training.date}` : ''"
    >
      <template #actions>
        <UButton to="/trainings" variant="outline" color="neutral" icon="i-heroicons-arrow-left">
          返回列表
        </UButton>
        <UButton
          v-if="training"
          :to="`/trainings/${trainingId}/analysis`"
          variant="outline"
          color="neutral"
          icon="i-heroicons-chart-bar"
        >
          查看分析
        </UButton>
      </template>
    </CommonPageHeader>

    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin text-primary-500" />
    </div>

    <template v-else-if="training">
      <!-- 訓練資訊卡片 -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">
                AI 狀態
              </p>
              <p class="text-xl font-semibold" :class="training.ai_status === 'running' ? 'text-success-500' : 'text-neutral-500 dark:text-neutral-400'">
                {{ training.ai_status === 'running' ? '運行中' : '已停止' }}
              </p>
            </div>
            <UButton
              v-if="training.ai_status === 'stopped'"
              icon="i-heroicons-play"
              color="success"
              :loading="isAIControlLoading"
              @click="startAI"
            >
              啟動
            </UButton>
            <UButton
              v-else
              icon="i-heroicons-stop"
              color="error"
              :loading="isAIControlLoading"
              @click="stopAI"
            >
              停止
            </UButton>
          </div>
        </UCard>

        <UCard>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            總投球數
          </p>
          <p class="text-2xl font-semibold text-neutral-900 dark:text-white">
            {{ training.stats.total_pitches }}
          </p>
        </UCard>

        <UCard>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            好球率
          </p>
          <p class="text-2xl font-semibold text-neutral-900 dark:text-white">
            {{ training.stats.strike_rate }}%
          </p>
          <p class="text-xs text-neutral-500">
            好球 {{ training.stats.strike_count }} / 壞球 {{ training.stats.ball_count }}
          </p>
        </UCard>

        <UCard>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            平均球速
          </p>
          <p class="text-2xl font-semibold text-neutral-900 dark:text-white">
            {{ training.stats.avg_velocity }} km/h
          </p>
        </UCard>
      </div>

      <!-- 好球帶設定 -->
      <UCard class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-neutral-900 dark:text-white">
              好球帶設定
            </h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              上緣 {{ training.strike_zone_top }} cm / 下緣 {{ training.strike_zone_bottom }} cm
            </p>
          </div>
          <UButton variant="outline" color="neutral" size="sm" @click="openStrikeZoneModal">
            調整設定
          </UButton>
        </div>
      </UCard>

      <!-- 投球清單 -->
      <CommonListContainer
        :empty="pitches.length === 0"
        empty-title="尚無投球紀錄"
        empty-description="啟動 AI 系統開始記錄投球"
      >
        <UTable :columns="columns" :data="pitches">
          <template #sequence-cell="{ row }">
            <span class="text-neutral-500">#{{ (row.original as Pitch).sequence }}</span>
          </template>

          <template #time-cell="{ row }">
            <span>{{ formatTime((row.original as Pitch).time) }}</span>
          </template>

          <template #velocity-cell="{ row }">
            <span class="font-medium text-neutral-900 dark:text-white">{{ (row.original as Pitch).velocity }} km/h</span>
          </template>

          <template #spin_rate-cell="{ row }">
            <span>{{ (row.original as Pitch).spin_rate }} rpm</span>
          </template>

          <template #is_strike-cell="{ row }">
            <UBadge
              :color="(row.original as Pitch).is_strike ? 'success' : 'error'"
              variant="subtle"
            >
              {{ (row.original as Pitch).is_strike ? '好球' : '壞球' }}
            </UBadge>
          </template>

          <template #location-cell="{ row }">
            <span class="text-neutral-500 dark:text-neutral-400">
              ({{ (row.original as Pitch).location_x.toFixed(2) }},
              {{ (row.original as Pitch).location_y.toFixed(2) }})
            </span>
          </template>

          <template #actions-cell="{ row }">
            <UButton
              icon="i-heroicons-eye"
              variant="ghost"
              color="neutral"
              size="xs"
              :to="`/trainings/${trainingId}/pitches/${(row.original as Pitch).id}`"
            />
          </template>
        </UTable>
      </CommonListContainer>
    </template>

    <!-- 好球帶設定 Modal -->
    <UModal v-model:open="isStrikeZoneModalOpen">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            調整好球帶設定
          </h3>
          <UForm :schema="strikeZoneSchema" :state="strikeZoneForm" class="space-y-4" @submit="handleStrikeZoneSubmit">
            <UFormField label="好球帶上緣 (cm)" name="strike_zone_top" required hint="範圍 90-150 公分">
              <UInput
                v-model="strikeZoneForm.strike_zone_top"
                type="number"
                placeholder="90-150"
                :disabled="isStrikeZoneSubmitting"
              />
            </UFormField>

            <UFormField label="好球帶下緣 (cm)" name="strike_zone_bottom" required hint="範圍 30-70 公分">
              <UInput
                v-model="strikeZoneForm.strike_zone_bottom"
                type="number"
                placeholder="30-70"
                :disabled="isStrikeZoneSubmitting"
              />
            </UFormField>

            <div class="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <p class="text-sm text-neutral-500 dark:text-neutral-400">
                好球帶高度：{{ strikeZoneForm.strike_zone_top - strikeZoneForm.strike_zone_bottom }} cm
              </p>
              <p class="text-xs text-neutral-500 mt-1">
                寬度固定為本壘板寬度 43 公分
              </p>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <UButton
                label="取消"
                color="neutral"
                variant="outline"
                :disabled="isStrikeZoneSubmitting"
                @click="isStrikeZoneModalOpen = false"
              />
              <UButton
                type="submit"
                label="儲存"
                :loading="isStrikeZoneSubmitting"
                :disabled="isStrikeZoneSubmitting"
              />
            </div>
          </UForm>
        </div>
      </template>
    </UModal>
  </div>
</template>
