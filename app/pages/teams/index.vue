<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import type { TeamItem } from '~/types/api/teams'
import { z } from 'zod'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default' })

const authStore = useAuthStore()
const toast = useToast()

// 搜尋
const searchQuery = ref('')

// 分頁
const currentPage = ref(1)
const pageSize = 10

// 取得球隊列表
const { data, refresh } = await useFetch<{
  status: string
  data: TeamItem[]
  meta: { total: number, page: number, per_page: number }
}>('/api/teams')

const allItems = computed(() => data.value?.data ?? [])

// 搜尋過濾
const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q)
    return allItems.value
  return allItems.value.filter(t =>
    t.name.toLowerCase().includes(q)
    || t.created_by.toLowerCase().includes(q),
  )
})

const totalItems = computed(() => filteredItems.value.length)

// 分頁資料
const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredItems.value.slice(start, start + pageSize)
})

// 搜尋時重置頁碼
watch(searchQuery, () => {
  currentPage.value = 1
})

// 表格欄位
const columns: TableColumn<TeamItem>[] = [
  { accessorKey: 'name', header: '球隊名稱' },
  { accessorKey: 'player_count', header: '球員數量' },
  { accessorKey: 'created_by', header: '建立者' },
  { accessorKey: 'created_at', header: '建立時間' },
  { accessorKey: 'actions', header: '操作' },
]

// 格式化時間
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-TW')
}

// === 新增 / 編輯 Modal ===
const isFormModalOpen = ref(false)
const isEditing = ref(false)
const editingTeam = ref<TeamItem | null>(null)
const isSubmitting = ref(false)

const schema = z.object({
  name: z.string().trim().min(1, '球隊名稱不可為空').max(50, '球隊名稱不可超過 50 字元'),
})

type Schema = z.output<typeof schema>

const formState = reactive<Schema>({
  name: '',
})

function openCreateModal() {
  isEditing.value = false
  editingTeam.value = null
  formState.name = ''
  isFormModalOpen.value = true
}

function openEditModal(team: TeamItem) {
  isEditing.value = true
  editingTeam.value = team
  formState.name = team.name
  isFormModalOpen.value = true
}

async function onFormSubmit(event: FormSubmitEvent<Schema>) {
  if (isSubmitting.value)
    return
  isSubmitting.value = true
  try {
    if (isEditing.value && editingTeam.value) {
      await $fetch(`/api/teams/${editingTeam.value.id}`, {
        method: 'PUT',
        body: { name: event.data.name },
      })
      toast.add({ title: '球隊已更新', color: 'success' })
    }
    else {
      await $fetch('/api/teams', {
        method: 'POST',
        body: { name: event.data.name, created_by: authStore.currentAccount },
      })
      toast.add({ title: '球隊已新增', color: 'success' })
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
const deletingTeam = ref<TeamItem | null>(null)
const isDeleting = ref(false)

function openDeleteModal(team: TeamItem) {
  deletingTeam.value = team
  isDeleteModalOpen.value = true
}

async function handleDelete() {
  if (!deletingTeam.value || isDeleting.value)
    return
  isDeleting.value = true
  try {
    await $fetch(`/api/teams/${deletingTeam.value.id}`, { method: 'DELETE' })
    toast.add({ title: '球隊已刪除', color: 'success' })
    isDeleteModalOpen.value = false
    await refresh()
  }
  catch (error: any) {
    const message = error?.data?.message || '刪除失敗'
    toast.add({ title: '刪除失敗', description: message, color: 'error' })
  }
  finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div data-testid="teams-page" class="flex h-full flex-col">
    <!-- 標題列 -->
    <div class="mb-6 flex shrink-0 items-center justify-between">
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
        球隊管理
      </h1>
      <div class="flex items-center gap-3">
        <UInput
          v-model="searchQuery"
          data-testid="team-search"
          icon="i-heroicons-magnifying-glass"
          placeholder="搜尋..."
          class="w-64"
        />
        <UButton
          data-testid="team-create"
          icon="i-heroicons-plus"
          color="primary"
          @click="openCreateModal"
        >
          新增球隊
        </UButton>
      </div>
    </div>

    <!-- 列表卡片 -->
    <UCard class="min-h-0 flex-1" :ui="{ body: 'h-full flex flex-col p-0' }">
      <CommonListContainer
        v-model:page="currentPage"
        :total="totalItems"
        :page-size="pageSize"
      >
        <CommonEmptyState
          v-if="!pagedItems.length"
          icon="i-heroicons-user-group"
          title="目前沒有球隊"
          description="點擊上方按鈕新增第一支球隊"
        />
        <UTable
          v-else
          data-testid="team-list"
          :data="pagedItems"
          :columns="columns"
          class="[&_td]:h-12 [&_th]:h-10"
          :ui="{ tr: 'cursor-pointer hover:bg-elevated' }"
        >
          <template #created_at-cell="{ row }">
            {{ formatDate(row.original.created_at) }}
          </template>
          <template #actions-cell="{ row }">
            <div class="flex items-center gap-1">
              <UButton
                data-testid="team-edit"
                icon="i-heroicons-pencil"
                variant="ghost"
                size="xs"
                @click.stop="openEditModal(row.original)"
              />
              <UButton
                data-testid="team-delete"
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
        <div data-testid="team-form-modal" class="p-6">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
            {{ isEditing ? '編輯球隊' : '新增球隊' }}
          </h3>
          <UForm
            :schema="schema"
            :state="formState"
            class="mt-4 space-y-4"
            @submit="onFormSubmit"
          >
            <UFormField
              label="球隊名稱"
              name="name"
              class="relative mb-8"
              :ui="{ error: 'absolute top-full left-0 mt-1' }"
            >
              <UInput
                v-model="formState.name"
                data-testid="team-name"
                placeholder="請輸入球隊名稱"
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
                data-testid="team-save"
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
      :description="`確定要刪除「${deletingTeam?.name}」嗎？此操作無法復原。`"
      confirm-label="刪除"
      confirm-color="error"
      :loading="isDeleting"
      @confirm="handleDelete"
    />
  </div>
</template>
