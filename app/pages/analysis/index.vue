<script setup lang="ts">
import type { PlayerAnalysis } from '~/composables/usePlayerAnalysis'

const { isAuthenticated } = useAuth()
const router = useRouter()

// 權限檢查
watch(isAuthenticated, (value) => {
  if (!value)
    router.push('/login')
}, { immediate: true })

const { teams, fetchTeams } = useTeams()
const { analyses, isLoading, isSubmitting, fetchAnalyses, batchDeleteAnalyses } = usePlayerAnalysis()

// 篩選
const searchQuery = ref('')
const selectedTeamFilter = ref<string>('all')

// 多選
const selectedIds = ref<number[]>([])

// Modal 狀態
const isBatchDeleteModalOpen = ref(false)

// 依篩選條件的分析資料
const filteredAnalyses = computed(() => {
  let result = analyses.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(a =>
      a.name.toLowerCase().includes(query)
      || a.number.toString().includes(query),
    )
  }

  return result
})

// 球隊選項（用於篩選）
const teamFilterOptions = computed(() => [
  { label: '全部球隊', value: 'all' },
  ...teams.value.map(t => ({ label: t.name, value: String(t.id) })),
])

// 轉換篩選值為數字
const selectedTeamId = computed(() => {
  if (selectedTeamFilter.value === 'all')
    return undefined
  return Number(selectedTeamFilter.value)
})

// 表格欄位
const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'number', header: '背號' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'team_name', header: '球隊' },
  { accessorKey: 'training_count', header: '訓練次數' },
  { accessorKey: 'total_pitches', header: '總投球數' },
  { accessorKey: 'avg_velocity', header: '平均球速' },
  { accessorKey: 'last_training_date', header: '最近訓練' },
  { accessorKey: 'actions', header: '操作' },
]

// 格式化日期
function formatDate(dateString: string | null) {
  if (!dateString)
    return '-'
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// 前往選手詳情
function goToPlayerDetail(analysis: PlayerAnalysis) {
  router.push(`/analysis/${analysis.id}`)
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
  if (selectedIds.value.length === filteredAnalyses.value.length) {
    selectedIds.value = []
  }
  else {
    selectedIds.value = filteredAnalyses.value.map(a => a.id)
  }
}

// 是否已選擇
function isSelected(id: number) {
  return selectedIds.value.includes(id)
}

// 開啟批次刪除 Modal
function openBatchDeleteModal() {
  if (selectedIds.value.length === 0)
    return
  isBatchDeleteModalOpen.value = true
}

// 確認批次刪除
async function handleBatchDelete() {
  const success = await batchDeleteAnalyses(selectedIds.value)
  if (success) {
    isBatchDeleteModalOpen.value = false
    selectedIds.value = []
    await fetchAnalyses(selectedTeamId.value)
  }
}

// 篩選球隊變更
watch(selectedTeamFilter, () => {
  selectedIds.value = []
  fetchAnalyses(selectedTeamId.value)
})

// 載入資料
onMounted(async () => {
  await fetchTeams()
  await fetchAnalyses()
})
</script>

<template>
  <div class="flex flex-col h-full">
    <CommonPageHeader title="選手分析" description="查看選手的訓練統計與分析">
      <template #actions>
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
        <div class="mt-4 flex flex-wrap items-center gap-4">
          <USelect
            v-model="selectedTeamFilter"
            :items="teamFilterOptions"
            placeholder="選擇球隊"
            class="w-48"
          />
          <CommonSearchInput v-model="searchQuery" placeholder="搜尋選手..." />
        </div>
      </template>
    </CommonPageHeader>

    <CommonListContainer
      :loading="isLoading"
      :empty="filteredAnalyses.length === 0"
      empty-title="沒有選手分析資料"
      empty-description="選手需要有訓練紀錄才會顯示在此"
    >
      <UTable :columns="columns" :data="filteredAnalyses">
        <template #select-header>
          <UCheckbox
            :model-value="selectedIds.length === filteredAnalyses.length && filteredAnalyses.length > 0"
            :indeterminate="selectedIds.length > 0 && selectedIds.length < filteredAnalyses.length"
            @update:model-value="toggleSelectAll"
          />
        </template>

        <template #select-cell="{ row }">
          <UCheckbox
            :model-value="isSelected((row.original as PlayerAnalysis).id)"
            @update:model-value="toggleSelect((row.original as PlayerAnalysis).id)"
          />
        </template>

        <template #number-cell="{ row }">
          <UBadge color="primary" variant="subtle">
            #{{ (row.original as PlayerAnalysis).number }}
          </UBadge>
        </template>

        <template #name-cell="{ row }">
          <span class="font-medium text-neutral-900 dark:text-white">{{ (row.original as PlayerAnalysis).name }}</span>
        </template>

        <template #training_count-cell="{ row }">
          <span>{{ (row.original as PlayerAnalysis).training_count }} 次</span>
        </template>

        <template #total_pitches-cell="{ row }">
          <span>{{ (row.original as PlayerAnalysis).total_pitches }} 球</span>
        </template>

        <template #avg_velocity-cell="{ row }">
          <span v-if="(row.original as PlayerAnalysis).avg_velocity">
            {{ (row.original as PlayerAnalysis).avg_velocity }} km/h
          </span>
          <span v-else class="text-neutral-500">-</span>
        </template>

        <template #last_training_date-cell="{ row }">
          <span>{{ formatDate((row.original as PlayerAnalysis).last_training_date) }}</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-1">
            <UButton
              icon="i-heroicons-chart-bar"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="goToPlayerDetail(row.original as PlayerAnalysis)"
            />
          </div>
        </template>
      </UTable>
    </CommonListContainer>

    <!-- 批次刪除確認 Modal -->
    <CommonConfirmModal
      v-model:open="isBatchDeleteModalOpen"
      title="確認批次刪除"
      :description="`確定要刪除 ${selectedIds.length} 位選手的分析資料？此操作無法復原，但選手基本資料會保留。`"
      confirm-label="刪除"
      :loading="isSubmitting"
      @confirm="handleBatchDelete"
    />
  </div>
</template>
