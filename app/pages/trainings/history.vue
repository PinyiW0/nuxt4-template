<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { TeamItem } from '~/types/api/teams'
import type { TrainingItem } from '~/types/api/trainings'

definePageMeta({ layout: 'default' })

const toast = useToast()

// 篩選
const dateFrom = ref('')
const dateTo = ref('')
const selectedTeamId = ref<number | null>(null)

// 分頁
const currentPage = ref(1)
const pageSize = 10

// 勾選（批次刪除）
const selectedIds = ref<number[]>([])

// 取得球隊（用於篩選）
const { data: teamsData } = await useFetch<{ status: string, data: TeamItem[] }>('/api/teams')
const teams = computed(() => teamsData.value?.data ?? [])
const teamFilterOptions = computed(() => [
  { label: '全部球隊', value: null },
  ...teams.value.map(t => ({ label: t.name, value: t.id })),
])

// 取得歷史訓練
const { data, refresh } = await useFetch<{
  status: string
  data: TrainingItem[]
  meta: { total: number }
}>('/api/trainings/history', {
  query: computed(() => {
    const q: Record<string, any> = {}
    if (dateFrom.value)
      q.date_from = dateFrom.value
    if (dateTo.value)
      q.date_to = dateTo.value
    if (selectedTeamId.value)
      q.team_id = selectedTeamId.value
    return q
  }),
})

const allItems = computed(() => data.value?.data ?? [])
const totalItems = computed(() => allItems.value.length)

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return allItems.value.slice(start, start + pageSize)
})

// 篩選時重置
watch([dateFrom, dateTo, selectedTeamId], () => {
  currentPage.value = 1
  selectedIds.value = []
})

const columns: TableColumn<TrainingItem>[] = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'date', header: '日期' },
  { accessorKey: 'player_name', header: '受測選手' },
  { accessorKey: 'team_name', header: '球隊' },
  { accessorKey: 'pitch_count', header: '投球數' },
  { accessorKey: 'ai_status', header: 'AI 狀態' },
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

// === 批次刪除 ===
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)

function openBatchDelete() {
  if (!selectedIds.value.length) {
    toast.add({ title: '請選擇訓練', description: '請先勾選要刪除的訓練', color: 'warning' })
    return
  }
  isDeleteModalOpen.value = true
}

async function handleBatchDelete() {
  if (isDeleting.value)
    return
  isDeleting.value = true
  try {
    await $fetch('/api/trainings/batch-delete', {
      method: 'POST',
      body: { ids: selectedIds.value },
    })
    toast.add({ title: '訓練已批次刪除', color: 'success' })
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
  <div data-testid="history-page" class="flex h-full flex-col">
    <!-- 標題列 -->
    <div class="mb-6 flex shrink-0 flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
        歷史訓練
      </h1>
      <div class="flex items-center gap-3">
        <div data-testid="history-date-filter" class="flex items-center gap-2">
          <UInput
            v-model="dateFrom"
            type="date"
            class="w-40"
            placeholder="起始日期"
          />
          <span class="text-neutral-400">~</span>
          <UInput
            v-model="dateTo"
            type="date"
            class="w-40"
            placeholder="結束日期"
          />
        </div>
        <USelect
          v-model="selectedTeamId"
          data-testid="history-team-filter"
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
          icon="i-heroicons-clock"
          title="目前沒有歷史訓練"
          description="歷史訓練會在訓練日期到期後顯示"
        />
        <UTable
          v-else
          data-testid="history-list"
          :data="pagedItems"
          :columns="columns"
          class="[&_td]:h-12 [&_th]:h-10"
        >
          <template #select-cell="{ row }">
            <div data-testid="history-row">
              <UCheckbox
                :model-value="isSelected(row.original.id)"
                @update:model-value="toggleSelect(row.original.id)"
              />
            </div>
          </template>
          <template #ai_status-cell="{ row }">
            <UBadge
              :color="row.original.ai_status === 'running' ? 'success' : 'neutral'"
              variant="subtle"
            >
              {{ row.original.ai_status === 'running' ? '運行中' : '已停止' }}
            </UBadge>
          </template>
        </UTable>
      </CommonListContainer>
    </UCard>

    <!-- 批次刪除確認 -->
    <CommonConfirmModal
      v-model:open="isDeleteModalOpen"
      title="確認刪除"
      :description="`確定要刪除 ${selectedIds.length} 筆訓練紀錄？`"
      confirm-label="刪除"
      confirm-color="error"
      :loading="isDeleting"
      @confirm="handleBatchDelete"
    />
  </div>
</template>
