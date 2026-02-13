<script setup lang="ts">
import type { TeamItem } from '~/types/api/teams'
import type { TrainingItem } from '~/types/api/trainings'

import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default' })

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

// 篩選條件
const filterTeam = ref<number | null>(null)
const filterDate = ref('')

// 取得球隊列表（用於篩選下拉）
const { data: teamsResponse } = useFetch('/api/teams', {
  query: { page: 1, page_size: 100 },
})

const teamOptions = computed(() => {
  const teams = (teamsResponse.value?.data ?? []) as TeamItem[]
  return [
    { label: '全部球隊', value: null },
    ...teams.map(t => ({ label: t.name, value: t.id })),
  ]
})

// 取得歷史訓練列表
const { data: historyResponse, refresh } = useFetch('/api/trainings/history', {
  query: computed(() => ({
    page: 1,
    page_size: 100,
    user: authStore.user?.account,
    role: authStore.user?.role,
  })),
})

const allItems = computed(() => (historyResponse.value?.data ?? []) as TrainingItem[])

// 客戶端過濾
const filteredItems = computed(() => {
  let items = allItems.value
  if (filterTeam.value) {
    items = items.filter(t => t.team_id === filterTeam.value)
  }
  if (filterDate.value) {
    items = items.filter(t => t.date === filterDate.value)
  }
  return items
})

// 分頁
const page = ref(1)
const pageSize = 10
const total = computed(() => filteredItems.value.length)

const pagedItems = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredItems.value.slice(start, start + pageSize)
})

// 篩選條件變更時重置頁碼
watch([filterTeam, filterDate], () => {
  page.value = 1
})

// 表格欄位
const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'date', header: '日期' },
  { accessorKey: 'player_name', header: '選手' },
  { accessorKey: 'team_name', header: '球隊' },
  { accessorKey: 'pitch_count', header: '投球數' },
  { accessorKey: 'actions', header: '操作' },
]

// Checkbox 多選
const rowSelection = ref<Record<string, boolean>>({})

const selectedIds = computed(() => {
  const ids: number[] = []
  for (const [index, selected] of Object.entries(rowSelection.value)) {
    if (selected) {
      const item = pagedItems.value[Number(index)]
      if (item)
        ids.push(item.id)
    }
  }
  return ids
})

// 分頁變更時清除選取
watch(page, () => {
  rowSelection.value = {}
})

// 批次刪除
const isDeleteOpen = ref(false)
const isSubmitting = ref(false)

async function handleBatchDelete() {
  if (isSubmitting.value)
    return

  isSubmitting.value = true
  try {
    await $fetch('/api/trainings/batch-delete', {
      method: 'POST',
      body: { training_ids: selectedIds.value },
    })
    toast.add({ title: '訓練已批次刪除', color: 'success' })
    isDeleteOpen.value = false
    rowSelection.value = {}
    await refresh()
  }
  catch {
    toast.add({ title: '刪除失敗', color: 'error' })
  }
  finally {
    isSubmitting.value = false
  }
}

// 點擊列導航
function handleRowSelect(_e: Event, row: { original: TrainingItem }) {
  router.push(`/trainings/${row.original.id}`)
}
</script>

<template>
  <div data-testid="trainings-history-page" class="flex h-full flex-col">
    <CommonPageHeader title="歷史訓練" description="查看過往訓練紀錄" />

    <!-- 工具列 -->
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <UInput
        v-model="filterDate"
        data-testid="history-filter-date"
        type="date"
        placeholder="依日期篩選"
        class="w-44"
      />

      <USelect
        v-model="filterTeam"
        data-testid="history-filter-team"
        :items="teamOptions"
        value-key="value"
        class="w-44"
      />

      <div class="flex-1" />

      <UButton
        v-if="selectedIds.length > 0"
        data-testid="batch-delete-btn"
        color="error"
        variant="outline"
        icon="i-heroicons-trash"
        :label="`批次刪除 (${selectedIds.length})`"
        @click="isDeleteOpen = true"
      />
    </div>

    <!-- 列表 -->
    <CommonListContainer
      v-model:page="page"
      :total="total"
      :page-size="pageSize"
      data-testid="trainings-history-pagination"
    >
      <UTable
        v-model:row-selection="rowSelection"
        data-testid="history-list"
        :data="pagedItems"
        :columns="columns"
        class="w-full"
        @select="handleRowSelect"
      >
        <template #select-cell="{ row }">
          <UCheckbox
            :model-value="rowSelection[row.index] ?? false"
            @update:model-value="(val: boolean | 'indeterminate') => rowSelection[row.index] = val === true"
            @click.stop
          />
        </template>

        <template #date-cell="{ row }">
          <span data-testid="history-row" class="text-neutral-900 dark:text-white">{{ row.original.date }}</span>
        </template>

        <template #player_name-cell="{ row }">
          <span class="text-neutral-700 dark:text-neutral-300">{{ row.original.player_name }}</span>
        </template>

        <template #team_name-cell="{ row }">
          <span class="text-neutral-700 dark:text-neutral-300">{{ row.original.team_name }}</span>
        </template>

        <template #pitch_count-cell="{ row }">
          <span class="text-neutral-700 dark:text-neutral-300">{{ row.original.pitch_count }}</span>
        </template>

        <template #actions-cell="{ row }">
          <UButton
            icon="i-heroicons-eye"
            color="neutral"
            variant="ghost"
            size="xs"
            @click.stop="router.push(`/trainings/${row.original.id}`)"
          />
        </template>
      </UTable>
    </CommonListContainer>

    <!-- 批次刪除確認 Modal -->
    <CommonConfirmModal
      v-model:open="isDeleteOpen"
      title="確認刪除"
      :description="`確定要刪除所選的 ${selectedIds.length} 筆訓練嗎？此操作無法復原。`"
      confirm-label="刪除"
      confirm-color="error"
      :loading="isSubmitting"
      @confirm="handleBatchDelete"
    />
  </div>
</template>
