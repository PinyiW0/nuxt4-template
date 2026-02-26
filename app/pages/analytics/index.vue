<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { PlayerAnalyticsItem } from '~/types/api/analysis'
import type { TeamItem } from '~/types/api/teams'

definePageMeta({ layout: 'default' })

const toast = useToast()
const router = useRouter()

// 篩選
const selectedTeamId = ref<string | undefined>(undefined)
const keyword = ref('')

// 取得球隊列表（篩選用）
const { data: teamsResult } = await useFetch('/api/teams', {
  query: { page_size: 100 },
})
const teamOptions = computed(() => {
  const teams = (teamsResult.value?.data ?? []) as TeamItem[]
  return teams.map(t => ({ label: t.name, value: String(t.id) }))
})

// 分頁
const page = ref(1)
const pageSize = 10

// 取得選手分析列表
const { data: result, refresh } = await useFetch('/api/analytics/players', {
  query: computed(() => ({
    page: page.value,
    page_size: pageSize,
    ...(selectedTeamId.value ? { team_id: selectedTeamId.value } : {}),
    ...(keyword.value ? { keyword: keyword.value } : {}),
  })),
})

const players = computed<PlayerAnalyticsItem[]>(() => result.value?.data ?? [])
const total = computed(() => result.value?.meta?.total ?? 0)

// 表格欄位
const columns: TableColumn<PlayerAnalyticsItem>[] = [
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'number', header: '背號' },
  { accessorKey: 'team_name', header: '所屬球隊' },
  { accessorKey: 'training_count', header: '訓練次數' },
  { accessorKey: 'total_pitches', header: '投球數' },
  { accessorKey: 'last_training_date', header: '最近訓練日' },
  { accessorKey: 'avg_velocity', header: '平均球速' },
  { accessorKey: 'id', header: '操作' },
]

// 點擊列導航到選手統計
function handleRowSelect(_e: Event, row: { original: PlayerAnalyticsItem }) {
  router.push(`/analytics/${row.original.id}`)
}

// 批次選取
const selectedIds = ref<Set<number>>(new Set())

function toggleSelect(id: number) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) {
    next.delete(id)
  }
  else {
    next.add(id)
  }
  selectedIds.value = next
}

function toggleSelectAll() {
  if (selectedIds.value.size === players.value.length) {
    selectedIds.value = new Set()
  }
  else {
    selectedIds.value = new Set(players.value.map(p => p.id))
  }
}

const isAllSelected = computed(() =>
  players.value.length > 0 && selectedIds.value.size === players.value.length,
)

// 批次刪除
const isBatchDeleteOpen = ref(false)
const batchDeleteLoading = ref(false)

async function confirmBatchDelete() {
  if (selectedIds.value.size === 0)
    return
  batchDeleteLoading.value = true
  try {
    await $fetch('/api/analytics/players/batch-delete', {
      method: 'POST',
      body: { player_ids: Array.from(selectedIds.value) },
    })
    toast.add({ title: '選手分析已批次刪除', color: 'success' })
    isBatchDeleteOpen.value = false
    selectedIds.value = new Set()
    await refresh()
  }
  catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message
      || (err as { message?: string })?.message
      || '刪除失敗'
    toast.add({ title: message, color: 'error' })
  }
  finally {
    batchDeleteLoading.value = false
  }
}

// 篩選變更時重設頁碼和選取
watch([selectedTeamId, keyword], () => {
  page.value = 1
  selectedIds.value = new Set()
})
</script>

<template>
  <div data-testid="analysis-page" class="flex h-full flex-col">
    <!-- Header -->
    <div class="mb-6 flex shrink-0 flex-wrap items-center justify-between gap-4">
      <CommonPageHeader title="數據分析" description="查看選手投球分析數據" />
      <div class="flex items-center gap-2">
        <UInput
          v-model="keyword"
          data-testid="player-analysis-search"
          icon="i-heroicons-magnifying-glass"
          placeholder="搜尋姓名"
          class="w-40"
        />
        <USelect
          v-model="selectedTeamId"
          data-testid="player-analysis-team-filter"
          :items="teamOptions"
          value-key="value"
          placeholder="全部球隊"
          class="w-40"
        />
        <UButton
          v-if="selectedIds.size > 0"
          data-testid="batch-delete-btn"
          icon="i-heroicons-trash"
          color="error"
          variant="outline"
          @click="isBatchDeleteOpen = true"
        >
          刪除 ({{ selectedIds.size }})
        </UButton>
      </div>
    </div>

    <!-- 列表 -->
    <UCard class="min-h-0 flex-1" :ui="{ body: 'p-0 overflow-auto flex-1 min-h-0', root: 'flex flex-col min-h-0' }">
      <CommonListContainer v-model:page="page" :total="total" :page-size="pageSize">
        <UTable
          data-testid="player-analysis-list"
          :data="players"
          :columns="columns"
          class="w-full"
          @select="handleRowSelect"
        >
          <template #name-cell="{ row }">
            <div class="flex items-center gap-2" data-testid="player-analysis-row">
              <UCheckbox
                :model-value="selectedIds.has(row.original.id)"
                @click.stop
                @update:model-value="toggleSelect(row.original.id)"
              />
              <span class="font-medium text-neutral-900 dark:text-white">{{ row.original.name }}</span>
            </div>
          </template>
          <template #number-cell="{ row }">
            <span class="font-medium text-neutral-900 dark:text-white">#{{ row.original.number }}</span>
          </template>
          <template #avg_velocity-cell="{ row }">
            {{ row.original.avg_velocity > 0 ? `${row.original.avg_velocity} km/h` : '-' }}
          </template>
          <template #id-cell="{ row }">
            <UButton
              icon="i-heroicons-chart-bar"
              color="neutral"
              variant="ghost"
              size="xs"
              @click.stop="router.push(`/analytics/${row.original.id}`)"
            />
          </template>

          <!-- 表頭全選 checkbox -->
          <template #name-header>
            <div class="flex items-center gap-2">
              <UCheckbox
                :model-value="isAllSelected"
                @update:model-value="toggleSelectAll"
              />
              <span>姓名</span>
            </div>
          </template>
        </UTable>

        <template v-if="players.length === 0">
          <CommonEmptyState title="目前沒有選手分析資料" />
        </template>
      </CommonListContainer>
    </UCard>

    <!-- 批次刪除確認 -->
    <CommonConfirmModal
      v-model:open="isBatchDeleteOpen"
      title="確認批次刪除"
      :description="`確定要刪除 ${selectedIds.size} 位選手的分析資料？此操作無法復原`"
      confirm-label="刪除"
      confirm-color="error"
      :loading="batchDeleteLoading"
      @confirm="confirmBatchDelete"
    />
  </div>
</template>
