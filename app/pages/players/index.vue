<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import type { PlayerItem } from '~/types/api/players'
import type { TeamItem } from '~/types/api/teams'
import draggable from 'vuedraggable'
import { z } from 'zod'

definePageMeta({ layout: 'default' })

const toast = useToast()

// 搜尋與篩選
const searchQuery = ref('')
const selectedTeamId = ref<number | null>(null)

// 分頁
const currentPage = ref(1)
const pageSize = 10

// 拖曳模式
const isSortMode = ref(false)

// 守備位置選項
const positionOptions: string[] = [
  '投手',
  '捕手',
  '一壘手',
  '二壘手',
  '三壘手',
  '游擊手',
  '左外野手',
  '中外野手',
  '右外野手',
  '指定打擊',
]

// 取得球隊列表（用於篩選和新增球員的球隊選擇）
const { data: teamsData } = await useFetch<{
  status: string
  data: TeamItem[]
}>('/api/teams')

const teams = computed(() => teamsData.value?.data ?? [])

const teamFilterOptions = computed(() => [
  { label: '全部球隊', value: null },
  ...teams.value.map(t => ({ label: t.name, value: t.id })),
])

// 取得球員列表
const { data, refresh } = await useFetch<{
  status: string
  data: PlayerItem[]
  meta: { total: number, page: number, per_page: number }
}>('/api/players', {
  query: computed(() => {
    const q: Record<string, any> = {}
    if (selectedTeamId.value)
      q.team_id = selectedTeamId.value
    return q
  }),
})

const allItems = computed(() => data.value?.data ?? [])

// 搜尋過濾
const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q)
    return allItems.value
  return allItems.value.filter(p =>
    p.name.toLowerCase().includes(q)
    || p.team_name.toLowerCase().includes(q)
    || String(p.number).includes(q)
    || p.position.includes(q),
  )
})

const totalItems = computed(() => filteredItems.value.length)

// 分頁資料
const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredItems.value.slice(start, start + pageSize)
})

// 搜尋/篩選時重置頁碼
watch([searchQuery, selectedTeamId], () => {
  currentPage.value = 1
})

// 表格欄位
const columns: TableColumn<PlayerItem>[] = [
  { accessorKey: 'number', header: '背號' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'height', header: '身高 (cm)' },
  { accessorKey: 'position', header: '守備位置' },
  { accessorKey: 'team_name', header: '所屬球隊' },
  { accessorKey: 'actions', header: '操作' },
]

// === 拖曳排序 ===
const sortableItems = ref<PlayerItem[]>([])

function enterSortMode() {
  if (!selectedTeamId.value) {
    toast.add({ title: '請先選擇球隊', description: '排序功能需要先篩選特定球隊', color: 'warning' })
    return
  }
  sortableItems.value = [...filteredItems.value].sort((a, b) => a.sort_order - b.sort_order)
  isSortMode.value = true
}

function cancelSortMode() {
  isSortMode.value = false
  sortableItems.value = []
}

async function saveSortOrder() {
  try {
    const items = sortableItems.value.map((p, idx) => ({
      id: p.id,
      sort_order: idx + 1,
    }))
    await $fetch('/api/players/sort', {
      method: 'PUT',
      body: { items },
    })
    toast.add({ title: '排序已更新', color: 'success' })
    isSortMode.value = false
    await refresh()
  }
  catch (error: any) {
    toast.add({ title: '排序更新失敗', description: error?.data?.message || '操作失敗', color: 'error' })
  }
}

// === 新增 / 編輯 Modal ===
const isFormModalOpen = ref(false)
const isEditing = ref(false)
const editingPlayer = ref<PlayerItem | null>(null)
const isSubmitting = ref(false)

const schema = z.object({
  number: z.number({ error: '請輸入背號' }).min(0, '背號必須為 0-999').max(999, '背號必須為 0-999'),
  name: z.string().trim().min(1, '球員姓名不可為空').max(50, '球員姓名不可超過 50 字元'),
  height: z.number({ error: '請輸入身高' }).min(100, '身高必須為 100-250 公分').max(250, '身高必須為 100-250 公分'),
  position: z.string().min(1, '請選擇守備位置'),
  team_id: z.number({ error: '請選擇球隊' }).min(1, '請選擇球隊'),
})

type Schema = z.output<typeof schema>

const formState = reactive({
  number: 0,
  name: '' as string,
  height: 170,
  position: '' as string,
  team_id: 0,
})

function openCreateModal() {
  isEditing.value = false
  editingPlayer.value = null
  formState.number = 0
  formState.name = ''
  formState.height = 170
  formState.position = ''
  formState.team_id = selectedTeamId.value || 0
  isFormModalOpen.value = true
}

function openEditModal(player: PlayerItem) {
  isEditing.value = true
  editingPlayer.value = player
  formState.number = player.number
  formState.name = player.name
  formState.height = player.height
  formState.position = player.position
  formState.team_id = player.team_id
  isFormModalOpen.value = true
}

async function onFormSubmit(event: FormSubmitEvent<Schema>) {
  if (isSubmitting.value)
    return
  isSubmitting.value = true
  try {
    if (isEditing.value && editingPlayer.value) {
      await $fetch(`/api/players/${editingPlayer.value.id}`, {
        method: 'PUT',
        body: {
          number: event.data.number,
          name: event.data.name,
          height: event.data.height,
          position: event.data.position,
        },
      })
      toast.add({ title: '球員已更新', color: 'success' })
    }
    else {
      await $fetch('/api/players', {
        method: 'POST',
        body: event.data,
      })
      toast.add({ title: '球員已新增', color: 'success' })
    }
    isFormModalOpen.value = false
    await refresh()
  }
  catch (error: any) {
    const message = error?.data?.message || '操作失敗'
    toast.add({ title: isEditing.value ? '更新失敗' : '新增失敗', description: message, color: 'error' })
  }
  finally {
    isSubmitting.value = false
  }
}

// === 刪除 ===
const isDeleteModalOpen = ref(false)
const deletingPlayer = ref<PlayerItem | null>(null)
const isDeleting = ref(false)

function openDeleteModal(player: PlayerItem) {
  deletingPlayer.value = player
  isDeleteModalOpen.value = true
}

async function handleDelete() {
  if (!deletingPlayer.value || isDeleting.value)
    return
  isDeleting.value = true
  try {
    await $fetch(`/api/players/${deletingPlayer.value.id}`, { method: 'DELETE' })
    toast.add({ title: '球員已刪除', color: 'success' })
    isDeleteModalOpen.value = false
    await refresh()
  }
  catch (error: any) {
    toast.add({ title: '刪除失敗', description: error?.data?.message || '刪除失敗', color: 'error' })
  }
  finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div data-testid="players-page" class="flex h-full flex-col">
    <!-- 標題列 -->
    <div class="mb-6 flex shrink-0 flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
        球員管理
      </h1>
      <div class="flex items-center gap-3">
        <UInput
          v-model="searchQuery"
          data-testid="player-search"
          icon="i-heroicons-magnifying-glass"
          placeholder="搜尋..."
          class="w-64"
        />
        <USelect
          v-model="selectedTeamId"
          data-testid="player-team-filter"
          :items="teamFilterOptions"
          value-key="value"
          class="w-40"
        />
        <UButton
          v-if="!isSortMode"
          icon="i-heroicons-bars-3"
          color="neutral"
          variant="outline"
          @click="enterSortMode"
        >
          排序
        </UButton>
        <template v-if="isSortMode">
          <UButton color="primary" @click="saveSortOrder">
            儲存排序
          </UButton>
          <UButton color="neutral" variant="outline" @click="cancelSortMode">
            取消
          </UButton>
        </template>
        <UButton
          v-if="!isSortMode"
          data-testid="player-create"
          icon="i-heroicons-plus"
          color="primary"
          @click="openCreateModal"
        >
          新增球員
        </UButton>
      </div>
    </div>

    <!-- 拖曳排序模式 -->
    <UCard v-if="isSortMode" class="min-h-0 flex-1" :ui="{ body: 'h-full flex flex-col p-0' }">
      <div class="min-h-0 flex-1 overflow-auto">
        <draggable
          v-model="sortableItems"
          item-key="id"
          handle=".drag-handle"
          ghost-class="opacity-50"
          data-testid="player-list"
        >
          <template #item="{ element }">
            <div class="flex items-center gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
              <UIcon name="i-heroicons-bars-3" class="drag-handle size-5 shrink-0 cursor-grab text-neutral-400" />
              <span class="w-12 text-center font-mono text-sm text-neutral-500">{{ element.number }}</span>
              <span class="flex-1 text-neutral-900 dark:text-white">{{ element.name }}</span>
              <span class="text-sm text-neutral-500">{{ element.position }}</span>
            </div>
          </template>
        </draggable>
      </div>
    </UCard>

    <!-- 列表模式 -->
    <UCard v-else class="min-h-0 flex-1" :ui="{ body: 'h-full flex flex-col p-0' }">
      <CommonListContainer
        v-model:page="currentPage"
        :total="totalItems"
        :page-size="pageSize"
      >
        <CommonEmptyState
          v-if="!pagedItems.length"
          icon="i-heroicons-users"
          title="目前沒有球員"
          description="點擊上方按鈕新增球員"
        />
        <UTable
          v-else
          data-testid="player-list"
          :data="pagedItems"
          :columns="columns"
          class="[&_td]:h-12 [&_th]:h-10"
          :ui="{ tr: 'cursor-pointer hover:bg-elevated' }"
        >
          <template #actions-cell="{ row }">
            <div class="flex items-center gap-1">
              <UButton
                data-testid="player-edit"
                icon="i-heroicons-pencil"
                variant="ghost"
                size="xs"
                @click.stop="openEditModal(row.original)"
              />
              <UButton
                data-testid="player-delete"
                icon="i-heroicons-trash"
                variant="ghost"
                color="error"
                size="xs"
                @click.stop="openDeleteModal(row.original)"
              />
            </div>
          </template>
        </UTable>
      </CommonListContainer>
    </UCard>

    <!-- 新增/編輯 Modal -->
    <UModal v-model:open="isFormModalOpen">
      <template #content>
        <div data-testid="player-form-modal" class="p-6">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
            {{ isEditing ? '編輯球員' : '新增球員' }}
          </h3>
          <UForm
            :schema="schema"
            :state="formState"
            class="mt-4 space-y-4"
            @submit="onFormSubmit"
          >
            <!-- 球隊選擇（新增時） -->
            <UFormField
              v-if="!isEditing"
              label="所屬球隊"
              name="team_id"
              class="relative mb-8"
              :ui="{ error: 'absolute top-full left-0 mt-1' }"
            >
              <USelect
                v-model="formState.team_id"
                data-testid="player-team"
                :items="teams.map(t => ({ label: t.name, value: t.id }))"
                value-key="value"
                placeholder="請選擇球隊"
                class="w-full"
              />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField
                label="背號"
                name="number"
                class="relative mb-8"
                :ui="{ error: 'absolute top-full left-0 mt-1' }"
              >
                <UInput
                  v-model.number="formState.number"
                  data-testid="player-number"
                  type="number"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="身高 (cm)"
                name="height"
                class="relative mb-8"
                :ui="{ error: 'absolute top-full left-0 mt-1' }"
              >
                <UInput
                  v-model.number="formState.height"
                  data-testid="player-height"
                  type="number"
                  class="w-full"
                />
              </UFormField>
            </div>

            <UFormField
              label="姓名"
              name="name"
              class="relative mb-8"
              :ui="{ error: 'absolute top-full left-0 mt-1' }"
            >
              <UInput
                v-model="formState.name"
                data-testid="player-name"
                placeholder="請輸入姓名"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="守備位置"
              name="position"
              class="relative mb-8"
              :ui="{ error: 'absolute top-full left-0 mt-1' }"
            >
              <USelect
                v-model="formState.position"
                data-testid="player-position"
                :items="positionOptions.map(p => ({ label: p, value: p }))"
                value-key="value"
                placeholder="請選擇守備位置"
                class="w-full"
              />
            </UFormField>

            <div class="flex justify-end gap-3">
              <UButton
                color="neutral"
                variant="outline"
                :disabled="isSubmitting"
                @click="isFormModalOpen = false"
              >
                取消
              </UButton>
              <UButton
                type="submit"
                data-testid="player-save"
                color="primary"
                :loading="isSubmitting"
              >
                {{ isEditing ? '儲存' : '建立' }}
              </UButton>
            </div>
          </UForm>
        </div>
      </template>
    </UModal>

    <!-- 刪除確認 Modal -->
    <CommonConfirmModal
      v-model:open="isDeleteModalOpen"
      title="確認刪除"
      :description="`確定要刪除球員「${deletingPlayer?.name}」嗎？此操作無法復原。`"
      confirm-label="刪除"
      confirm-color="error"
      :loading="isDeleting"
      @confirm="handleDelete"
    />
  </div>
</template>
