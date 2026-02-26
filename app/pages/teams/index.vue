<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import type { TeamItem } from '~/types/api/teams'
import { z } from 'zod'

definePageMeta({ layout: 'default' })

const toast = useToast()

// 分頁
const page = ref(1)
const pageSize = 10

// 取得球隊列表
const { data: result, refresh } = await useFetch('/api/teams', {
  query: computed(() => ({ page: page.value, page_size: pageSize })),
})

const teams = computed<TeamItem[]>(() => result.value?.data ?? [])
const total = computed(() => result.value?.meta?.total ?? 0)

// 表格欄位
const columns: TableColumn<TeamItem>[] = [
  { accessorKey: 'name', header: '球隊名稱' },
  { accessorKey: 'player_count', header: '球員數量' },
  { accessorKey: 'created_by', header: '建立者' },
  { accessorKey: 'created_at', header: '建立時間' },
  { accessorKey: 'id', header: '操作' },
]

// 新增/編輯彈窗
const isFormOpen = ref(false)
const editingTeam = ref<TeamItem | null>(null)
const formLoading = ref(false)

const schema = z.object({
  name: z.string().min(1, '請輸入球隊名稱').max(50, '球隊名稱不可超過 50 字元'),
})

type TeamSchema = z.infer<typeof schema>

const formState = reactive<TeamSchema>({ name: '' })

function openCreate() {
  editingTeam.value = null
  formState.name = ''
  isFormOpen.value = true
}

function openEdit(team: TeamItem) {
  editingTeam.value = team
  formState.name = team.name
  isFormOpen.value = true
}

async function onSubmit(event: FormSubmitEvent<TeamSchema>) {
  formLoading.value = true
  try {
    if (editingTeam.value) {
      await $fetch(`/api/teams/${editingTeam.value.id}`, {
        method: 'PUT',
        body: { name: event.data.name },
      })
      toast.add({ title: '球隊已更新', color: 'success' })
    }
    else {
      await $fetch('/api/teams', {
        method: 'POST',
        body: { name: event.data.name },
      })
      toast.add({ title: '球隊已新增', color: 'success' })
    }
    isFormOpen.value = false
    await refresh()
  }
  catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message
      || (err as { message?: string })?.message
      || '操作失敗'
    toast.add({ title: message, color: 'error' })
  }
  finally {
    formLoading.value = false
  }
}

// 刪除
const isDeleteOpen = ref(false)
const deletingTeam = ref<TeamItem | null>(null)
const deleteLoading = ref(false)

function openDelete(team: TeamItem) {
  deletingTeam.value = team
  isDeleteOpen.value = true
}

async function confirmDelete() {
  if (!deletingTeam.value)
    return
  deleteLoading.value = true
  try {
    await $fetch(`/api/teams/${deletingTeam.value.id}`, { method: 'DELETE' })
    toast.add({ title: '球隊已刪除', color: 'success' })
    isDeleteOpen.value = false
    await refresh()
  }
  catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message
      || (err as { message?: string })?.message
      || '刪除失敗'
    toast.add({ title: message, color: 'error' })
  }
  finally {
    deleteLoading.value = false
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-TW')
}
</script>

<template>
  <div data-testid="teams-page" class="flex h-full flex-col">
    <!-- Header -->
    <div class="mb-6 flex shrink-0 items-center justify-between">
      <CommonPageHeader title="球隊管理" description="管理所有球隊資訊" />
      <UButton
        data-testid="team-create"
        icon="i-heroicons-plus"
        color="primary"
        @click="openCreate"
      >
        新增球隊
      </UButton>
    </div>

    <!-- 列表 -->
    <UCard class="min-h-0 flex-1" :ui="{ body: 'p-0 overflow-auto flex-1 min-h-0', root: 'flex flex-col min-h-0' }">
      <CommonListContainer v-model:page="page" :total="total" :page-size="pageSize">
        <UTable
          data-testid="team-list"
          :data="teams"
          :columns="columns"
          class="w-full"
        >
          <template #name-cell="{ row }">
            <span class="font-medium text-neutral-900 dark:text-white">{{ row.original.name }}</span>
          </template>
          <template #created_at-cell="{ row }">
            {{ formatDate(row.original.created_at) }}
          </template>
          <template #id-cell="{ row }">
            <div class="flex items-center gap-1">
              <UButton
                data-testid="team-edit"
                icon="i-heroicons-pencil"
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

        <template v-if="teams.length === 0">
          <CommonEmptyState title="目前沒有球隊" />
        </template>
      </CommonListContainer>
    </UCard>

    <!-- 新增/編輯彈窗 -->
    <UModal v-model:open="isFormOpen">
      <template #content>
        <div data-testid="team-form-modal" class="p-6">
          <h3 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            {{ editingTeam ? '編輯球隊' : '新增球隊' }}
          </h3>
          <UForm :schema="schema" :state="formState" @submit="onSubmit">
            <UFormField label="球隊名稱" name="name" required class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }">
              <UInput
                v-model="formState.name"
                data-testid="team-name"
                placeholder="請輸入球隊名稱"
                class="w-full"
              />
            </UFormField>
            <div class="mt-6 flex justify-end gap-3">
              <UButton
                color="neutral"
                variant="outline"
                :disabled="formLoading"
                @click="isFormOpen = false"
              >
                取消
              </UButton>
              <UButton
                data-testid="team-save"
                type="submit"
                color="primary"
                :loading="formLoading"
              >
                {{ editingTeam ? '儲存' : '建立' }}
              </UButton>
            </div>
          </UForm>
        </div>
      </template>
    </UModal>

    <!-- 刪除確認彈窗 -->
    <CommonConfirmModal
      v-model:open="isDeleteOpen"
      title="確認刪除"
      :description="`確定要刪除「${deletingTeam?.name}」嗎？此操作將連帶刪除所有關聯球員。`"
      confirm-label="刪除"
      confirm-color="error"
      :loading="deleteLoading"
      @confirm="confirmDelete"
    />
  </div>
</template>
