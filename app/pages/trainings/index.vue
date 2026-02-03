<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Training } from '~/composables/useTrainings'
import { z } from 'zod'

const { isAuthenticated } = useAuth()
const router = useRouter()

// 權限檢查
watch(isAuthenticated, (value) => {
  if (!value)
    router.push('/login')
}, { immediate: true })

const { teams, fetchTeams } = useTeams()
const { players, fetchPlayers } = usePlayers()
const {
  trainings,
  isLoading,
  isSubmitting,
  fetchTrainings,
  createTraining,
  deleteTraining,
} = useTrainings()

// 搜尋
const searchQuery = ref('')
const filteredTrainings = computed(() => {
  if (!searchQuery.value)
    return trainings.value
  const query = searchQuery.value.toLowerCase()
  return trainings.value.filter(t =>
    t.player_name.toLowerCase().includes(query)
    || t.team_name.toLowerCase().includes(query),
  )
})

// 表格欄位
const columns = [
  { accessorKey: 'date', header: '日期' },
  { accessorKey: 'player_name', header: '受測選手' },
  { accessorKey: 'team_name', header: '球隊' },
  { accessorKey: 'pitch_count', header: '投球數' },
  { accessorKey: 'ai_status', header: 'AI 狀態' },
  { accessorKey: 'actions', header: '操作' },
]

// Modal 狀態
const isCreateModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedTraining = ref<Training | null>(null)

// 表單 Schema
const trainingSchema = z.object({
  date: z.string().min(1, '請選擇日期'),
  player_id: z.coerce.number().int().positive('請選擇受測選手'),
  team_id: z.coerce.number().int().positive('請選擇球隊'),
})

type TrainingSchema = z.output<typeof trainingSchema>

// 建立表單狀態
const createForm = reactive({
  date: new Date().toISOString().split('T')[0],
  player_id: '',
  team_id: '',
})

// 球隊選項
const teamFormOptions = computed(() =>
  teams.value.map(t => ({ label: t.name, value: String(t.id) })),
)

// 球員選項（依所選球隊篩選）
const playerFormOptions = computed(() => {
  if (!createForm.team_id)
    return []
  const teamId = Number(createForm.team_id)
  return players.value
    .filter(p => p.team_id === teamId)
    .map(p => ({ label: `#${p.number} ${p.name}`, value: String(p.id) }))
})

// 選中的球員
const selectedPlayer = computed(() => {
  if (!createForm.player_id)
    return null
  return players.value.find(p => p.id === Number(createForm.player_id))
})

// 格式化日期
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// 開啟建立 Modal
function openCreateModal() {
  createForm.date = new Date().toISOString().split('T')[0]!
  createForm.player_id = ''
  createForm.team_id = teams.value[0]?.id.toString() ?? ''
  isCreateModalOpen.value = true
}

// 開啟刪除 Modal
function openDeleteModal(training: Training) {
  selectedTraining.value = training
  isDeleteModalOpen.value = true
}

// 前往訓練詳情
function goToTraining(training: Training) {
  router.push(`/trainings/${training.id}`)
}

// 提交建立
async function handleCreate(event: FormSubmitEvent<TrainingSchema>) {
  const player = selectedPlayer.value
  const success = await createTraining({
    date: event.data.date,
    player_id: Number(createForm.player_id),
    team_id: Number(createForm.team_id),
    strike_zone_top: player ? Math.round(player.height * 0.7) : 120,
    strike_zone_bottom: player ? Math.round(player.height * 0.3) : 50,
  })
  if (success) {
    isCreateModalOpen.value = false
  }
}

// 確認刪除
async function handleDelete() {
  if (!selectedTraining.value)
    return
  const success = await deleteTraining(selectedTraining.value.id)
  if (success) {
    isDeleteModalOpen.value = false
    await fetchTrainings()
  }
}

// 球隊變更時重新載入球員
watch(() => createForm.team_id, async (teamId) => {
  if (teamId) {
    await fetchPlayers(Number(teamId))
    createForm.player_id = ''
  }
})

// 載入資料
onMounted(async () => {
  await fetchTeams()
  await fetchPlayers()
  await fetchTrainings()
})
</script>

<template>
  <div class="flex flex-col h-full">
    <CommonPageHeader title="訓練管理" description="管理今天及未來的訓練">
      <template #actions>
        <UButton to="/trainings/history" variant="outline" color="neutral" icon="i-heroicons-clock">
          歷史紀錄
        </UButton>
        <UButton icon="i-heroicons-plus" @click="openCreateModal">
          新增訓練
        </UButton>
      </template>
      <template #filters>
        <div class="mt-4">
          <CommonSearchInput v-model="searchQuery" placeholder="搜尋選手或球隊..." />
        </div>
      </template>
    </CommonPageHeader>

    <CommonListContainer
      :loading="isLoading"
      :empty="filteredTrainings.length === 0"
      empty-title="目前沒有訓練"
      empty-description="點擊上方按鈕建立第一個訓練"
    >
      <template #empty-action>
        <UButton icon="i-heroicons-plus" @click="openCreateModal">
          新增訓練
        </UButton>
      </template>

      <UTable :columns="columns" :data="filteredTrainings">
        <template #date-cell="{ row }">
          <span class="font-medium text-neutral-900 dark:text-white">{{ formatDate((row.original as Training).date) }}</span>
        </template>

        <template #player_name-cell="{ row }">
          <span>{{ (row.original as Training).player_name }}</span>
        </template>

        <template #pitch_count-cell="{ row }">
          <UBadge color="primary" variant="subtle">
            {{ (row.original as Training).pitch_count }} 球
          </UBadge>
        </template>

        <template #ai_status-cell="{ row }">
          <UBadge
            :color="(row.original as Training).ai_status === 'running' ? 'success' : 'neutral'"
            variant="subtle"
          >
            {{ (row.original as Training).ai_status === 'running' ? '運行中' : '已停止' }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-1">
            <UButton
              icon="i-heroicons-eye"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="goToTraining(row.original as Training)"
            />
            <UButton
              icon="i-heroicons-trash"
              variant="ghost"
              color="error"
              size="xs"
              @click="openDeleteModal(row.original as Training)"
            />
          </div>
        </template>
      </UTable>
    </CommonListContainer>

    <!-- 建立 Modal -->
    <UModal v-model:open="isCreateModalOpen">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            新增訓練
          </h3>
          <UForm :schema="trainingSchema" :state="createForm" class="space-y-4" @submit="handleCreate">
            <UFormField label="訓練日期" name="date" required>
              <UInput
                v-model="createForm.date"
                type="date"
                :disabled="isSubmitting"
              />
            </UFormField>

            <UFormField label="所屬球隊" name="team_id" required>
              <USelect
                v-model="createForm.team_id"
                :items="teamFormOptions"
                placeholder="選擇球隊"
                :disabled="isSubmitting"
              />
            </UFormField>

            <UFormField label="受測選手" name="player_id" required>
              <USelect
                v-model="createForm.player_id"
                :items="playerFormOptions"
                placeholder="選擇球員"
                :disabled="isSubmitting || !createForm.team_id"
              />
            </UFormField>

            <div v-if="selectedPlayer" class="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                選手身高：{{ selectedPlayer.height }} cm
              </p>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                好球帶預設：{{ Math.round(selectedPlayer.height * 0.3) }} - {{ Math.round(selectedPlayer.height * 0.7) }} cm
              </p>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <UButton
                label="取消"
                color="neutral"
                variant="outline"
                :disabled="isSubmitting"
                @click="isCreateModalOpen = false"
              />
              <UButton
                type="submit"
                label="建立"
                :loading="isSubmitting"
                :disabled="isSubmitting"
              />
            </div>
          </UForm>
        </div>
      </template>
    </UModal>

    <!-- 刪除確認 Modal -->
    <CommonConfirmModal
      v-model:open="isDeleteModalOpen"
      title="確認刪除"
      description="確定要刪除這筆訓練嗎？所有相關的投球紀錄也會一併刪除。"
      confirm-label="刪除"
      :loading="isSubmitting"
      @confirm="handleDelete"
    />
  </div>
</template>
