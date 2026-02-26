<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { TeamItem } from '~/types/api/teams'
import type { TrainingItem } from '~/types/api/trainings'

definePageMeta({ layout: 'default' })

const toast = useToast()
const router = useRouter()

// 篩選
const dateFrom = ref('')
const dateTo = ref('')
const selectedTeamId = ref<string | undefined>(undefined)

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

// 取得歷史訓練列表
const { data: result, refresh } = await useFetch('/api/trainings/history', {
  query: computed(() => ({
    page: page.value,
    page_size: pageSize,
    ...(dateFrom.value ? { date_from: dateFrom.value } : {}),
    ...(dateTo.value ? { date_to: dateTo.value } : {}),
    ...(selectedTeamId.value ? { team_id: selectedTeamId.value } : {}),
  })),
})

const trainings = computed<TrainingItem[]>(() => result.value?.data ?? [])
const total = computed(() => result.value?.meta?.total ?? 0)

// 表格欄位
const columns: TableColumn<TrainingItem>[] = [
  { accessorKey: 'date', header: '訓練日期' },
  { accessorKey: 'player_name', header: '受測選手' },
  { accessorKey: 'team_name', header: '所屬球隊' },
  { accessorKey: 'pitch_count', header: '投球數' },
  { accessorKey: 'id', header: '操作' },
]

// 點擊列導航到訓練分析
function handleRowSelect(_e: Event, row: { original: TrainingItem }) {
  router.push(`/history/${row.original.id}`)
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
  if (selectedIds.value.size === trainings.value.length) {
    selectedIds.value = new Set()
  }
  else {
    selectedIds.value = new Set(trainings.value.map(t => t.id))
  }
}

const isAllSelected = computed(() =>
  trainings.value.length > 0 && selectedIds.value.size === trainings.value.length,
)

// 批次刪除
const isBatchDeleteOpen = ref(false)
const batchDeleteLoading = ref(false)

async function confirmBatchDelete() {
  if (selectedIds.value.size === 0)
    return
  batchDeleteLoading.value = true
  try {
    await $fetch('/api/trainings/batch-delete', {
      method: 'POST',
      body: { ids: Array.from(selectedIds.value) },
    })
    toast.add({ title: `已刪除 ${selectedIds.value.size} 筆訓練`, color: 'success' })
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
watch([dateFrom, dateTo, selectedTeamId], () => {
  page.value = 1
  selectedIds.value = new Set()
})
</script>

<template>
  <div data-testid="history-page" class="flex h-full flex-col">
    <!-- Header -->
    <div class="mb-6 flex shrink-0 flex-wrap items-center justify-between gap-4">
      <CommonPageHeader title="歷史訓練" description="查看過去的訓練紀錄" />
      <div class="flex items-center gap-2">
        <UInput
          v-model="dateFrom"
          data-testid="history-date-filter"
          type="date"
          placeholder="開始日期"
          class="w-40"
        />
        <span class="text-neutral-400">~</span>
        <UInput
          v-model="dateTo"
          type="date"
          placeholder="結束日期"
          class="w-40"
        />
        <USelect
          v-model="selectedTeamId"
          data-testid="history-team-filter"
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
          data-testid="history-list"
          :data="trainings"
          :columns="columns"
          class="w-full"
          @select="handleRowSelect"
        >
          <template #date-cell="{ row }">
            <div class="flex items-center gap-2" data-testid="history-row">
              <UCheckbox
                :model-value="selectedIds.has(row.original.id)"
                @click.stop
                @update:model-value="toggleSelect(row.original.id)"
              />
              <span class="font-medium text-neutral-900 dark:text-white">{{ row.original.date }}</span>
            </div>
          </template>
          <template #id-cell="{ row }">
            <UButton
              icon="i-heroicons-chart-bar"
              color="neutral"
              variant="ghost"
              size="xs"
              @click.stop="router.push(`/history/${row.original.id}`)"
            />
          </template>

          <!-- 表頭全選 checkbox -->
          <template #date-header>
            <div class="flex items-center gap-2">
              <UCheckbox
                :model-value="isAllSelected"
                @update:model-value="toggleSelectAll"
              />
              <span>訓練日期</span>
            </div>
          </template>
        </UTable>

        <template v-if="trainings.length === 0">
          <CommonEmptyState title="目前沒有歷史訓練" />
        </template>
      </CommonListContainer>
    </UCard>

    <!-- 批次刪除確認 -->
    <CommonConfirmModal
      v-model:open="isBatchDeleteOpen"
      title="確認批次刪除"
      :description="`確定要刪除所選的 ${selectedIds.size} 筆訓練嗎？相關投球數據也會一併刪除。`"
      confirm-label="刪除"
      confirm-color="error"
      :loading="batchDeleteLoading"
      @confirm="confirmBatchDelete"
    />
  </div>
</template>
