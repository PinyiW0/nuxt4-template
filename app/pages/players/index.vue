<script setup lang="ts">
import type { PlayerItem } from '~/types/api/players'
import type { TeamItem } from '~/types/api/teams'

import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default' })

const authStore = useAuthStore()
const toast = useToast()

// 分頁
const page = ref(1)
const pageSize = 10

// 球隊篩選
const filterTeamId = ref<number | undefined>(undefined)

// 球隊列表（用於篩選與表單）
const { data: teamsResponse } = useFetch('/api/teams', {
  query: {
    page_size: 999,
    user: authStore.user?.account,
    role: authStore.user?.role,
  },
})
const teamOptions = computed(() => {
  const list = (teamsResponse.value?.data ?? []) as TeamItem[]
  return list.map(t => ({ label: t.name, value: t.id }))
})

// 球員列表
const { data: playersResponse, refresh } = useFetch('/api/players', {
  query: computed(() => ({
    page: page.value,
    page_size: pageSize,
    team_id: filterTeamId.value,
    user: authStore.user?.account,
    role: authStore.user?.role,
  })),
})

const players = computed(() => playersResponse.value?.data ?? [])
const total = computed(() => (playersResponse.value as Record<string, unknown>)?.total as number ?? 0)

// 當篩選條件變更時重置頁碼
watch(filterTeamId, () => {
  page.value = 1
})

// 守備位置選項
const positionOptions = [
  { label: '投手', value: '投手' },
  { label: '捕手', value: '捕手' },
  { label: '一壘手', value: '一壘手' },
  { label: '二壘手', value: '二壘手' },
  { label: '三壘手', value: '三壘手' },
  { label: '游擊手', value: '游擊手' },
  { label: '左外野手', value: '左外野手' },
  { label: '中外野手', value: '中外野手' },
  { label: '右外野手', value: '右外野手' },
  { label: '指定打擊', value: '指定打擊' },
]

// 表格欄位
const columns = [
  { accessorKey: 'number', header: '背號' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'height', header: '身高 (cm)' },
  { accessorKey: 'position', header: '守備位置' },
  { accessorKey: 'team_name', header: '球隊' },
  { accessorKey: 'sort_order', header: '排序' },
  { accessorKey: 'actions', header: '操作' },
]

// 表單 Modal
const isFormOpen = ref(false)
const isSubmitting = ref(false)
const editingPlayer = ref<PlayerItem | null>(null)
const formTeamId = ref<number | undefined>(undefined)
const formNumber = ref<number | undefined>(undefined)
const formName = ref('')
const formHeight = ref<number | undefined>(undefined)
const formPosition = ref<string | undefined>(undefined)
const formErrors = ref<Record<string, string>>({})

function openCreate() {
  editingPlayer.value = null
  formTeamId.value = undefined
  formNumber.value = undefined
  formName.value = ''
  formHeight.value = undefined
  formPosition.value = undefined
  formErrors.value = {}
  isFormOpen.value = true
}

function openEdit(player: PlayerItem) {
  editingPlayer.value = player
  formTeamId.value = player.team_id
  formNumber.value = player.number
  formName.value = player.name
  formHeight.value = player.height
  formPosition.value = player.position
  formErrors.value = {}
  isFormOpen.value = true
}

function validateForm(): boolean {
  const errors: Record<string, string> = {}

  if (!editingPlayer.value && !formTeamId.value) {
    errors.team = '請選擇球隊'
  }
  if (formNumber.value === undefined || formNumber.value === null) {
    errors.number = '請輸入背號'
  }
  else if (formNumber.value < 0 || formNumber.value > 99) {
    errors.number = '背號必須在 0-99 之間'
  }
  if (!formName.value.trim()) {
    errors.name = '請輸入姓名'
  }
  if (!formHeight.value) {
    errors.height = '請輸入身高'
  }
  else if (formHeight.value < 100 || formHeight.value > 250) {
    errors.height = '身高必須在 100-250 公分之間'
  }
  if (!formPosition.value) {
    errors.position = '請選擇守備位置'
  }

  formErrors.value = errors
  return Object.keys(errors).length === 0
}

async function handleSave() {
  if (isSubmitting.value)
    return
  if (!validateForm())
    return

  isSubmitting.value = true
  try {
    if (editingPlayer.value) {
      await $fetch(`/api/players/${editingPlayer.value.id}`, {
        method: 'PUT',
        body: {
          number: formNumber.value,
          name: formName.value.trim(),
          height: formHeight.value,
          position: formPosition.value,
        },
      })
      toast.add({ title: '球員已更新', color: 'success' })
    }
    else {
      await $fetch('/api/players', {
        method: 'POST',
        body: {
          team_id: formTeamId.value,
          number: formNumber.value,
          name: formName.value.trim(),
          height: formHeight.value,
          position: formPosition.value,
          created_by: authStore.user?.account ?? '',
        },
      })
      toast.add({ title: '球員已新增', color: 'success' })
    }
    isFormOpen.value = false
    await refresh()
  }
  catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message ?? '操作失敗'
    toast.add({ title: message, color: 'error' })
  }
  finally {
    isSubmitting.value = false
  }
}

// 刪除 Modal
const isDeleteOpen = ref(false)
const deletingPlayer = ref<PlayerItem | null>(null)
const isDeleting = ref(false)

function openDelete(player: PlayerItem) {
  deletingPlayer.value = player
  isDeleteOpen.value = true
}

async function handleDelete() {
  if (isDeleting.value || !deletingPlayer.value)
    return

  isDeleting.value = true
  try {
    await $fetch(`/api/players/${deletingPlayer.value.id}`, { method: 'DELETE' })
    toast.add({ title: '球員已刪除', color: 'success' })
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
</script>

<template>
  <div data-testid="players-page" class="flex h-full flex-col">
    <CommonPageHeader title="球員管理" description="管理所有球員資料" />

    <!-- 工具列 -->
    <div class="mb-4 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <USelect
          v-model="filterTeamId"
          data-testid="player-filter-team"
          :items="[{ label: '全部球隊', value: undefined }, ...teamOptions]"
          placeholder="篩選球隊"
          class="w-48"
        />
      </div>
      <UButton
        data-testid="player-create"
        icon="i-heroicons-plus"
        label="新增球員"
        @click="openCreate"
      />
    </div>

    <!-- 列表 -->
    <CommonListContainer
      v-model:page="page"
      :total="total"
      :page-size="pageSize"
      data-testid="players-pagination"
    >
      <UTable
        data-testid="player-list"
        :data="players"
        :columns="columns"
        class="w-full"
      >
        <template #number-cell="{ row }">
          <span class="font-mono text-neutral-900 dark:text-white">{{ row.original.number }}</span>
        </template>

        <template #name-cell="{ row }">
          <span class="text-neutral-900 dark:text-white">{{ row.original.name }}</span>
        </template>

        <template #height-cell="{ row }">
          <span class="text-neutral-700 dark:text-neutral-300">{{ row.original.height }}</span>
        </template>

        <template #position-cell="{ row }">
          <UBadge color="neutral" variant="subtle">
            {{ row.original.position }}
          </UBadge>
        </template>

        <template #team_name-cell="{ row }">
          <span class="text-neutral-700 dark:text-neutral-300">{{ row.original.team_name }}</span>
        </template>

        <template #sort_order-cell="{ row }">
          <span data-testid="player-sort-handle" class="text-neutral-500 dark:text-neutral-400">{{ row.original.sort_order }}</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton
              data-testid="player-edit"
              icon="i-heroicons-pencil-square"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="openEdit(row.original)"
            />
            <UButton
              data-testid="player-delete"
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
        <div data-testid="player-form-modal" class="p-6">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
            {{ editingPlayer ? '編輯球員' : '新增球員' }}
          </h3>

          <div class="mt-4 space-y-2">
            <!-- 球隊選擇（新增時才顯示） -->
            <UFormField
              v-if="!editingPlayer"
              label="球隊"
              class="relative mb-8"
              :ui="{ error: 'absolute top-full left-0 mt-1' }"
              :error="formErrors.team"
            >
              <USelect
                v-model="formTeamId"
                data-testid="player-team"
                :items="teamOptions"
                placeholder="請選擇球隊"
                class="w-full"
              />
            </UFormField>

            <UFormField label="背號" class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }" :error="formErrors.number">
              <UInput
                v-model.number="formNumber"
                data-testid="player-number"
                type="number"
                placeholder="0-99"
                :min="0"
                :max="99"
                class="w-full"
              />
            </UFormField>

            <UFormField label="姓名" class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }" :error="formErrors.name">
              <UInput
                v-model="formName"
                data-testid="player-name"
                placeholder="請輸入姓名"
                class="w-full"
              />
            </UFormField>

            <UFormField label="身高 (cm)" class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }" :error="formErrors.height">
              <UInput
                v-model.number="formHeight"
                data-testid="player-height"
                type="number"
                placeholder="100-250"
                :min="100"
                :max="250"
                class="w-full"
              />
            </UFormField>

            <UFormField label="守備位置" class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }" :error="formErrors.position">
              <USelect
                v-model="formPosition"
                data-testid="player-position"
                :items="positionOptions"
                placeholder="請選擇守備位置"
                class="w-full"
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
              data-testid="player-save"
              :loading="isSubmitting"
              @click="handleSave"
            >
              {{ editingPlayer ? '更新' : '新增' }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- 刪除確認 Modal -->
    <CommonConfirmModal
      v-model:open="isDeleteOpen"
      title="確認刪除"
      :description="`確定要刪除「${deletingPlayer?.name ?? ''}」嗎？`"
      confirm-label="刪除"
      confirm-color="error"
      :loading="isDeleting"
      @confirm="handleDelete"
    />
  </div>
</template>
