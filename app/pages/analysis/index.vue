<script setup lang="ts">
import type { PlayerAnalysisItem } from '~/types/api/analysis'
import type { TeamItem } from '~/types/api/teams'

import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default' })

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

// 篩選條件
const filterTeam = ref<number | null>(null)
const searchQuery = ref('')
const debouncedSearch = ref('')

// Debounce 搜尋（300ms）
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, (val) => {
  if (searchTimer)
    clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedSearch.value = val
  }, 300)
})

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

// 球隊 ID → 名稱映射（用於客戶端過濾）
const teamNameMap = computed(() => {
  const teams = (teamsResponse.value?.data ?? []) as TeamItem[]
  const map = new Map<number, string>()
  teams.forEach(t => map.set(t.id, t.name))
  return map
})

// 取得選手分析列表
const { data: analysisResponse, refresh } = useFetch('/api/player-analysis', {
  query: computed(() => ({
    page: 1,
    page_size: 100,
    user: authStore.user?.account,
    role: authStore.user?.role,
  })),
})

const allItems = computed(() => (analysisResponse.value?.data ?? []) as PlayerAnalysisItem[])

// 客戶端過濾
const filteredItems = computed(() => {
  let items = allItems.value
  if (filterTeam.value) {
    items = items.filter(a => a.team_name === teamNameMap.value.get(filterTeam.value!))
  }
  if (debouncedSearch.value) {
    const keyword = debouncedSearch.value.toLowerCase()
    items = items.filter(a => a.name.toLowerCase().includes(keyword))
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
watch([filterTeam, debouncedSearch], () => {
  page.value = 1
})

// 表格欄位
const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'number', header: '背號' },
  { accessorKey: 'team_name', header: '球隊' },
  { accessorKey: 'training_count', header: '訓練次數' },
  { accessorKey: 'total_pitches', header: '總投球數' },
  { accessorKey: 'last_training_date', header: '最近訓練日' },
  { accessorKey: 'avg_velocity', header: '平均球速' },
]

// Checkbox 多選
const rowSelection = ref<Record<string, boolean>>({})

const selectedIds = computed(() => {
  const ids: number[] = []
  for (const [index, selected] of Object.entries(rowSelection.value)) {
    if (selected) {
      const item = pagedItems.value[Number(index)]
      if (item)
        ids.push(item.player_id)
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
    await $fetch('/api/player-analysis/batch-delete', {
      method: 'POST',
      body: { player_ids: selectedIds.value },
    })
    toast.add({ title: '選手分析已批次刪除', color: 'success' })
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
function handleRowSelect(_e: Event, row: { original: PlayerAnalysisItem }) {
  router.push(`/analysis/${row.original.id}`)
}
</script>

<template>
  <div data-testid="player-analysis-page" class="flex h-full flex-col">
    <CommonPageHeader title="選手分析" description="查看選手投球分析數據" />

    <!-- 工具列 -->
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <UInput
        v-model="searchQuery"
        data-testid="analysis-search"
        placeholder="搜尋選手姓名"
        icon="i-heroicons-magnifying-glass"
        class="w-52"
      />

      <USelect
        v-model="filterTeam"
        data-testid="analysis-filter-team"
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
      data-testid="player-analysis-pagination"
    >
      <UTable
        v-model:row-selection="rowSelection"
        data-testid="analysis-list"
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

        <template #name-cell="{ row }">
          <span data-testid="analysis-row" class="text-neutral-900 dark:text-white">{{ row.original.name }}</span>
        </template>

        <template #number-cell="{ row }">
          <span class="text-neutral-700 dark:text-neutral-300">{{ row.original.number }}</span>
        </template>

        <template #team_name-cell="{ row }">
          <span class="text-neutral-700 dark:text-neutral-300">{{ row.original.team_name }}</span>
        </template>

        <template #training_count-cell="{ row }">
          <span class="text-neutral-700 dark:text-neutral-300">{{ row.original.training_count }}</span>
        </template>

        <template #total_pitches-cell="{ row }">
          <span class="text-neutral-700 dark:text-neutral-300">{{ row.original.total_pitches }}</span>
        </template>

        <template #last_training_date-cell="{ row }">
          <span class="text-neutral-500 dark:text-neutral-400">{{ row.original.last_training_date }}</span>
        </template>

        <template #avg_velocity-cell="{ row }">
          <span class="text-neutral-700 dark:text-neutral-300">
            {{ row.original.avg_velocity != null ? `${row.original.avg_velocity} km/h` : '-' }}
          </span>
        </template>
      </UTable>
    </CommonListContainer>

    <!-- 批次刪除確認 Modal -->
    <CommonConfirmModal
      v-model:open="isDeleteOpen"
      title="確認刪除"
      :description="`確定要刪除所選的 ${selectedIds.length} 筆選手分析嗎？此操作無法復原。`"
      confirm-label="刪除"
      confirm-color="error"
      :loading="isSubmitting"
      @confirm="handleBatchDelete"
    />
  </div>
</template>
