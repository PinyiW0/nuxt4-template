<script setup lang="ts">
import type { TeamItem } from '~/types/api/teams'

import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default' })

const authStore = useAuthStore()
const toast = useToast()

// 分頁
const page = ref(1)
const pageSize = 10

// 列表查詢
const { data: teamsResponse, refresh } = useFetch('/api/teams', {
  query: computed(() => ({
    page: page.value,
    page_size: pageSize,
    user: authStore.user?.account,
    role: authStore.user?.role,
  })),
})

const teams = computed(() => teamsResponse.value?.data ?? [])
const total = computed(() => (teamsResponse.value as Record<string, unknown>)?.total as number ?? 0)

// 表格欄位
const columns = [
  { accessorKey: 'name', header: '球隊名稱' },
  { accessorKey: 'player_count', header: '球員數' },
  { accessorKey: 'created_by', header: '建立者' },
  { accessorKey: 'created_at', header: '建立日期' },
  { accessorKey: 'actions', header: '操作' },
]

// 表單 Modal
const isFormOpen = ref(false)
const isSubmitting = ref(false)
const editingTeam = ref<TeamItem | null>(null)
const formName = ref('')
const formError = ref('')

function openCreate() {
  editingTeam.value = null
  formName.value = ''
  formError.value = ''
  isFormOpen.value = true
}

function openEdit(team: TeamItem) {
  editingTeam.value = team
  formName.value = team.name
  formError.value = ''
  isFormOpen.value = true
}

async function handleSave() {
  if (isSubmitting.value)
    return

  // 前端驗證
  const name = formName.value.trim()
  if (!name) {
    formError.value = '請輸入球隊名稱'
    return
  }
  if (name.length > 50) {
    formError.value = '球隊名稱不可超過 50 字元'
    return
  }

  isSubmitting.value = true
  try {
    if (editingTeam.value) {
      await $fetch(`/api/teams/${editingTeam.value.id}`, {
        method: 'PUT',
        body: { name },
      })
      toast.add({ title: '球隊已更新', color: 'success' })
    }
    else {
      await $fetch('/api/teams', {
        method: 'POST',
        body: { name, created_by: authStore.user?.account ?? '' },
      })
      toast.add({ title: '球隊已新增', color: 'success' })
    }
    isFormOpen.value = false
    await refresh()
  }
  catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message ?? '操作失敗'
    formError.value = message
  }
  finally {
    isSubmitting.value = false
  }
}

// 刪除 Modal
const isDeleteOpen = ref(false)
const deletingTeam = ref<TeamItem | null>(null)
const isDeleting = ref(false)

function openDelete(team: TeamItem) {
  deletingTeam.value = team
  isDeleteOpen.value = true
}

async function handleDelete() {
  if (isDeleting.value || !deletingTeam.value)
    return

  isDeleting.value = true
  try {
    await $fetch(`/api/teams/${deletingTeam.value.id}`, { method: 'DELETE' })
    toast.add({ title: '球隊已刪除', color: 'success' })
    isDeleteOpen.value = false
    await refresh()
  }
  catch {
    toast.add({ title: '刪除失敗', color: 'error' })
  }
  finally {
    isDeleting.value = false
  }
}

// 格式化日期
function formatDate(dateStr: string) {
  return dateStr.slice(0, 10)
}
</script>

<template>
  <div data-testid="teams-page" class="flex h-full flex-col">
    <CommonPageHeader title="球隊管理" description="管理所有球隊資料" />

    <!-- 工具列 -->
    <div class="mb-4 flex items-center justify-end">
      <UButton
        data-testid="team-create"
        icon="i-heroicons-plus"
        label="新增球隊"
        @click="openCreate"
      />
    </div>

    <!-- 列表 -->
    <CommonListContainer
      v-model:page="page"
      :total="total"
      :page-size="pageSize"
      data-testid="teams-pagination"
    >
      <UTable
        data-testid="team-list"
        :data="teams"
        :columns="columns"
        class="w-full"
      >
        <template #name-cell="{ row }">
          <span class="text-neutral-900 dark:text-white">{{ row.original.name }}</span>
        </template>

        <template #player_count-cell="{ row }">
          <span class="text-neutral-700 dark:text-neutral-300">{{ row.original.player_count }}</span>
        </template>

        <template #created_by-cell="{ row }">
          <span class="text-neutral-700 dark:text-neutral-300">{{ row.original.created_by }}</span>
        </template>

        <template #created_at-cell="{ row }">
          <span class="text-neutral-500 dark:text-neutral-400">{{ formatDate(row.original.created_at) }}</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton
              data-testid="team-edit"
              icon="i-heroicons-pencil-square"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="openEdit(row.original)"
            />
            <UButton
              data-testid="team-delete"
              icon="i-heroicons-trash"
              color="error"
              variant="ghost"
              size="xs"
              @click="openDelete(row.original)"
            />
          </div>
        </template>
      </UTable>
    </CommonListContainer>

    <!-- 新增/編輯 Modal -->
    <UModal v-model:open="isFormOpen">
      <template #content>
        <div data-testid="team-form-modal" class="p-6">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
            {{ editingTeam ? '編輯球隊' : '新增球隊' }}
          </h3>

          <div class="mt-4">
            <UFormField label="球隊名稱" class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }" :error="formError">
              <UInput
                v-model="formName"
                data-testid="team-name"
                placeholder="請輸入球隊名稱"
                class="w-full"
                @keydown.enter="handleSave"
              />
            </UFormField>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="outline"
              :disabled="isSubmitting"
              @click="isFormOpen = false"
            >
              取消
            </UButton>
            <UButton
              data-testid="team-save"
              :loading="isSubmitting"
              @click="handleSave"
            >
              {{ editingTeam ? '更新' : '新增' }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- 刪除確認 Modal -->
    <CommonConfirmModal
      v-model:open="isDeleteOpen"
      title="確認刪除"
      :description="`確定要刪除「${deletingTeam?.name ?? ''}」嗎？此操作會連帶刪除所有球員。`"
      confirm-label="刪除"
      confirm-color="error"
      :loading="isDeleting"
      @confirm="handleDelete"
    />
  </div>
</template>
