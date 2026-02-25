<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { PlayerAnalysisItem } from '~/types/api/analysis'
import type { TeamItem } from '~/types/api/teams'

definePageMeta({ layout: 'default' })

const router = useRouter()
const toast = useToast()

// 篩選
const searchQuery = ref('')
const selectedTeamId = ref<number | null>(null)

// 分頁
const currentPage = ref(1)
const pageSize = 10

// 勾選（批次刪除）
const selectedIds = ref<number[]>([])

// 取得球隊
const { data: teamsData } = await useFetch<{ status: string, data: TeamItem[] }>('/api/teams')
const teams = computed(() => teamsData.value?.data ?? [])
const teamFilterOptions = computed(() => [
  { label: '全部球隊', value: null },
  ...teams.value.map(t => ({ label: t.name, value: t.id })),
])

// 取得選手分析列表
const { data, refresh } = await useFetch<{
  status: string
  data: PlayerAnalysisItem[]
  meta: { total: number }
}>('/api/player-analysis', {
  query: computed(() => {
    const q: Record<string, any> = {}
    if (selectedTeamId.value)
      q.team_id = selectedTeamId.value
    if (searchQuery.value.trim())
      q.keyword = searchQuery.value.trim()
    return q
  }),
})

const allItems = computed(() => data.value?.data ?? [])
const totalItems = computed(() => allItems.value.length)

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return allItems.value.slice(start, start + pageSize)
})

watch([searchQuery, selectedTeamId], () => {
  currentPage.value = 1
  selectedIds.value = []
})

const columns: TableColumn<PlayerAnalysisItem>[] = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'number', header: '背號' },
  { accessorKey: 'team_name', header: '球隊' },
  { accessorKey: 'training_count', header: '訓練次數' },
  { accessorKey: 'total_pitches', header: '投球數' },
  { accessorKey: 'last_training_date', header: '最近訓練日' },
  { accessorKey: 'avg_velocity', header: '平均球速' },
]

function toggleSelect(id: number) {
  const idx = selectedIds.value.indexOf(id)
  if (idx > -1) {
    selectedIds.value.splice(idx, 1)
  }
  else {
    selectedIds.value.push(id)
  }
}

function isSelected(id: number) {
  return selectedIds.value.includes(id)
}

function handleSelectRow(_e: Event, row: { original: PlayerAnalysisItem }) {
  router.push(`/analysis/${row.original.id}`)
}

// === 批次刪除 ===
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)

function openBatchDelete() {
  if (!selectedIds.value.length) {
    toast.add({ title: '請選擇選手', description: '請先勾選要刪除分析的選手', color: 'warning' })
    return
  }
  isDeleteModalOpen.value = true
}

async function handleBatchDelete() {
  if (isDeleting.value)
    return
  isDeleting.value = true
  try {
    await $fetch('/api/player-analysis/batch-delete', {
      method: 'POST',
      body: { player_ids: selectedIds.value },
    })
    toast.add({ title: '選手分析已批次刪除', color: 'success' })
    isDeleteModalOpen.value = false
    selectedIds.value = []
    await refresh()
  }
  catch (error: any) {
    toast.add({ title: '刪除失敗', description: error?.data?.message || '操作失敗', color: 'error' })
  }
  finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div data-testid="analysis-page" class="flex h-full flex-col">
    <!-- 標題列 -->
    <div class="mb-6 flex shrink-0 flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
        選手分析
      </h1>
      <div class="flex items-center gap-3">
        <UInput
          v-model="searchQuery"
          data-testid="player-analysis-search"
          icon="i-heroicons-magnifying-glass"
          placeholder="搜尋姓名..."
          class="w-64"
        />
        <USelect
          v-model="selectedTeamId"
          data-testid="player-analysis-team-filter"
          :items="teamFilterOptions"
          value-key="value"
          class="w-40"
        />
        <UButton
          data-testid="batch-delete-btn"
          icon="i-heroicons-trash"
          color="error"
          variant="outline"
          :disabled="!selectedIds.length"
          @click="openBatchDelete"
        >
          批次刪除 {{ selectedIds.length ? `(${selectedIds.length})` : '' }}
        </UButton>
      </div>
    </div>

    <!-- 列表 -->
    <UCard class="min-h-0 flex-1" :ui="{ body: 'h-full flex flex-col p-0' }">
      <CommonListContainer
        v-model:page="currentPage"
        :total="totalItems"
        :page-size="pageSize"
      >
        <CommonEmptyState
          v-if="!pagedItems.length"
          icon="i-heroicons-chart-bar"
          title="目前沒有選手分析資料"
          description="選手有訓練紀錄後會自動產生分析資料"
        />
        <UTable
          v-else
          data-testid="player-analysis-list"
          :data="pagedItems"
          :columns="columns"
          class="[&_td]:h-12 [&_th]:h-10"
          :ui="{ tr: 'cursor-pointer hover:bg-elevated' }"
          @select="handleSelectRow"
        >
          <template #select-cell="{ row }">
            <div data-testid="player-analysis-row" @click.stop>
              <UCheckbox
                :model-value="isSelected(row.original.id)"
                @update:model-value="toggleSelect(row.original.id)"
              />
            </div>
          </template>
          <template #avg_velocity-cell="{ row }">
            {{ row.original.avg_velocity ? `${row.original.avg_velocity} km/h` : '-' }}
          </template>
        </UTable>
      </CommonListContainer>
    </UCard>

    <!-- 批次刪除確認 -->
    <CommonConfirmModal
      v-model:open="isDeleteModalOpen"
      title="確認刪除"
      :description="`確定要刪除 ${selectedIds.length} 位選手的分析資料？此操作無法復原`"
      confirm-label="刪除"
      confirm-color="error"
      :loading="isDeleting"
      @confirm="handleBatchDelete"
    />
  </div>
</template>
