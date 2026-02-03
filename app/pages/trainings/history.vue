<script setup lang="ts">
import type { Training } from '~/composables/useTrainings'

const { isAuthenticated } = useAuth()
const router = useRouter()

// 權限檢查
watch(isAuthenticated, (value) => {
  if (!value)
    router.push('/login')
}, { immediate: true })

const {
  trainings,
  isLoading,
  isSubmitting,
  fetchHistoryTrainings,
  deleteTraining,
  batchDeleteTrainings,
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

// 多選
const selectedIds = ref<number[]>([])

// 表格欄位
const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'date', header: '日期' },
  { accessorKey: 'player_name', header: '受測選手' },
  { accessorKey: 'team_name', header: '球隊' },
  { accessorKey: 'pitch_count', header: '投球數' },
  { accessorKey: 'actions', header: '操作' },
]

// Modal 狀態
const isDeleteModalOpen = ref(false)
const isBatchDeleteModalOpen = ref(false)
const selectedTraining = ref<Training | null>(null)

// 格式化日期
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// 切換選擇
function toggleSelect(id: number) {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  }
  else {
    selectedIds.value.splice(index, 1)
  }
}

// 全選/取消全選
function toggleSelectAll() {
  if (selectedIds.value.length === filteredTrainings.value.length) {
    selectedIds.value = []
  }
  else {
    selectedIds.value = filteredTrainings.value.map(t => t.id)
  }
}

// 是否已選擇
function isSelected(id: number) {
  return selectedIds.value.includes(id)
}

// 開啟刪除 Modal
function openDeleteModal(training: Training) {
  selectedTraining.value = training
  isDeleteModalOpen.value = true
}

// 開啟批次刪除 Modal
function openBatchDeleteModal() {
  if (selectedIds.value.length === 0)
    return
  isBatchDeleteModalOpen.value = true
}

// 前往訓練詳情
function goToTraining(training: Training) {
  router.push(`/trainings/${training.id}`)
}

// 確認刪除
async function handleDelete() {
  if (!selectedTraining.value)
    return
  const success = await deleteTraining(selectedTraining.value.id)
  if (success) {
    isDeleteModalOpen.value = false
    await fetchHistoryTrainings()
  }
}

// 確認批次刪除
async function handleBatchDelete() {
  const success = await batchDeleteTrainings(selectedIds.value)
  if (success) {
    isBatchDeleteModalOpen.value = false
    selectedIds.value = []
    await fetchHistoryTrainings()
  }
}

// 載入資料
onMounted(async () => {
  await fetchHistoryTrainings()
})
</script>

<template>
  <div class="flex flex-col h-full">
    <CommonPageHeader title="歷史訓練紀錄" description="查看過去的訓練紀錄">
      <template #actions>
        <UButton to="/trainings" variant="outline" color="neutral" icon="i-heroicons-arrow-left">
          返回訓練列表
        </UButton>
        <UButton
          v-if="selectedIds.length > 0"
          icon="i-heroicons-trash"
          color="error"
          @click="openBatchDeleteModal"
        >
          刪除已選 ({{ selectedIds.length }})
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
      empty-title="沒有歷史訓練紀錄"
      empty-description="完成的訓練會顯示在這裡"
    >
      <UTable :columns="columns" :data="filteredTrainings">
        <template #select-header>
          <UCheckbox
            :model-value="selectedIds.length === filteredTrainings.length && filteredTrainings.length > 0"
            :indeterminate="selectedIds.length > 0 && selectedIds.length < filteredTrainings.length"
            @update:model-value="toggleSelectAll"
          />
        </template>

        <template #select-cell="{ row }">
          <UCheckbox
            :model-value="isSelected((row.original as Training).id)"
            @update:model-value="toggleSelect((row.original as Training).id)"
          />
        </template>

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
              icon="i-heroicons-chart-bar"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="router.push(`/trainings/${(row.original as Training).id}/analysis`)"
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

    <!-- 刪除確認 Modal -->
    <CommonConfirmModal
      v-model:open="isDeleteModalOpen"
      title="確認刪除"
      description="確定要刪除這筆訓練嗎？所有相關的投球紀錄也會一併刪除。"
      confirm-label="刪除"
      :loading="isSubmitting"
      @confirm="handleDelete"
    />

    <!-- 批次刪除確認 Modal -->
    <CommonConfirmModal
      v-model:open="isBatchDeleteModalOpen"
      title="確認批次刪除"
      :description="`確定要刪除已選的 ${selectedIds.length} 筆訓練嗎？所有相關的投球紀錄也會一併刪除。`"
      confirm-label="刪除"
      :loading="isSubmitting"
      @confirm="handleBatchDelete"
    />
  </div>
</template>
