<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import type { PlayerItem } from '~/types/api/players'
import type { TeamItem } from '~/types/api/teams'
import Draggable from 'vuedraggable'
import { z } from 'zod'

definePageMeta({ layout: 'default' })

const toast = useToast()

// 球隊篩選
const selectedTeamId = ref<string | undefined>(undefined)

// 取得球隊列表（用於篩選和新增時選球隊）
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

// 取得球員列表
const { data: result, refresh } = await useFetch('/api/players', {
  query: computed(() => ({
    page: page.value,
    page_size: pageSize,
    ...(selectedTeamId.value ? { team_id: selectedTeamId.value } : {}),
  })),
})

const players = computed<PlayerItem[]>(() => result.value?.data ?? [])
const total = computed(() => result.value?.meta?.total ?? 0)

// 拖曳排序用的本地列表
const sortableList = ref<PlayerItem[]>([])
const isSortMode = ref(false)

function enterSortMode() {
  sortableList.value = [...players.value]
  isSortMode.value = true
}

async function saveSortOrder() {
  if (sortableList.value.length === 0)
    return
  const teamId = sortableList.value[0]!.team_id
  try {
    await $fetch('/api/players/sort', {
      method: 'PUT',
      body: {
        team_id: teamId,
        player_ids: sortableList.value.map(p => p.id),
      },
    })
    toast.add({ title: '排序已更新', color: 'success' })
    isSortMode.value = false
    await refresh()
  }
  catch {
    toast.add({ title: '排序更新失敗', color: 'error' })
  }
}

function cancelSort() {
  isSortMode.value = false
}

// 表格欄位
const columns: TableColumn<PlayerItem>[] = [
  { accessorKey: 'number', header: '背號' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'height', header: '身高(cm)' },
  { accessorKey: 'position', header: '守備位置' },
  { accessorKey: 'team_name', header: '所屬球隊' },
  { accessorKey: 'id', header: '操作' },
]

// 新增/編輯彈窗
const isFormOpen = ref(false)
const editingPlayer = ref<PlayerItem | null>(null)
const formLoading = ref(false)

const positionOptions = ['投手', '捕手', '一壘手', '二壘手', '三壘手', '游擊手', '左外野手', '中外野手', '右外野手', '指定打擊']

const schema = z.object({
  team_id: z.string().min(1, '請選擇球隊'),
  number: z.number({ error: '請輸入背號' }).min(0, '背號必須為 0-999').max(999, '背號必須為 0-999'),
  name: z.string().min(1, '請輸入球員姓名').max(50, '球員姓名不可超過 50 字元'),
  height: z.number({ error: '請輸入身高' }).min(100, '身高必須為 100-250 公分').max(250, '身高必須為 100-250 公分'),
  position: z.string().min(1, '請選擇守備位置'),
})

type PlayerSchema = z.infer<typeof schema>

const formState = reactive<PlayerSchema>({
  team_id: '',
  number: 0,
  name: '',
  height: 170,
  position: '',
})

function openCreate() {
  editingPlayer.value = null
  formState.team_id = selectedTeamId.value ?? ''
  formState.number = 0
  formState.name = ''
  formState.height = 170
  formState.position = ''
  isFormOpen.value = true
}

function openEdit(player: PlayerItem) {
  editingPlayer.value = player
  formState.team_id = String(player.team_id)
  formState.number = player.number
  formState.name = player.name
  formState.height = player.height
  formState.position = player.position
  isFormOpen.value = true
}

async function onSubmit(event: FormSubmitEvent<PlayerSchema>) {
  formLoading.value = true
  try {
    if (editingPlayer.value) {
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
        body: {
          team_id: Number(event.data.team_id),
          number: event.data.number,
          name: event.data.name,
          height: event.data.height,
          position: event.data.position,
        },
      })
      toast.add({ title: '球員已新增', color: 'success' })
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
const deletingPlayer = ref<PlayerItem | null>(null)
const deleteLoading = ref(false)

function openDelete(player: PlayerItem) {
  deletingPlayer.value = player
  isDeleteOpen.value = true
}

async function confirmDelete() {
  if (!deletingPlayer.value)
    return
  deleteLoading.value = true
  try {
    await $fetch(`/api/players/${deletingPlayer.value.id}`, { method: 'DELETE' })
    toast.add({ title: '球員已刪除', color: 'success' })
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

// 篩選球隊變更時重設頁碼
watch(selectedTeamId, () => {
  page.value = 1
  isSortMode.value = false
}, { deep: true })
</script>

<template>
  <div data-testid="players-page" class="flex h-full flex-col">
    <!-- Header -->
    <div class="mb-6 flex shrink-0 flex-wrap items-center justify-between gap-4">
      <CommonPageHeader title="球員管理" description="管理所有球員資訊" />
      <div class="flex items-center gap-2">
        <USelect
          v-model="selectedTeamId"
          data-testid="player-team-filter"
          :items="teamOptions"
          value-key="value"
          placeholder="全部球隊"
          class="w-40"
        />
        <UButton
          v-if="selectedTeamId && !isSortMode"
          icon="i-heroicons-arrows-up-down"
          color="neutral"
          variant="outline"
          @click="enterSortMode"
        >
          排序
        </UButton>
        <UButton
          data-testid="player-create"
          icon="i-heroicons-plus"
          color="primary"
          @click="openCreate"
        >
          新增球員
        </UButton>
      </div>
    </div>

    <!-- 排序模式 -->
    <UCard v-if="isSortMode" class="min-h-0 flex-1" :ui="{ body: 'p-0 flex-1 min-h-0 overflow-auto', root: 'flex flex-col min-h-0' }">
      <div class="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">拖曳調整球員排序</span>
          <div class="flex gap-2">
            <UButton color="neutral" variant="outline" size="sm" @click="cancelSort">
              取消
            </UButton>
            <UButton color="primary" size="sm" @click="saveSortOrder">
              儲存排序
            </UButton>
          </div>
        </div>
      </div>
      <Draggable
        v-model="sortableList"
        item-key="id"
        handle=".drag-handle"
        class="divide-y divide-neutral-200 dark:divide-neutral-800"
      >
        <template #item="{ element }">
          <div class="flex items-center gap-4 px-4 py-3">
            <UIcon name="i-heroicons-bars-3" class="drag-handle size-5 shrink-0 cursor-grab text-neutral-400" />
            <span class="w-12 text-sm font-medium text-neutral-900 dark:text-white">#{{ element.number }}</span>
            <span class="flex-1 text-sm text-neutral-900 dark:text-white">{{ element.name }}</span>
            <span class="text-sm text-neutral-500 dark:text-neutral-400">{{ element.position }}</span>
          </div>
        </template>
      </Draggable>
    </UCard>

    <!-- 列表模式 -->
    <UCard v-else class="min-h-0 flex-1" :ui="{ body: 'p-0 overflow-auto flex-1 min-h-0', root: 'flex flex-col min-h-0' }">
      <CommonListContainer v-model:page="page" :total="total" :page-size="pageSize">
        <UTable
          data-testid="player-list"
          :data="players"
          :columns="columns"
          class="w-full"
        >
          <template #number-cell="{ row }">
            <span class="font-medium text-neutral-900 dark:text-white">#{{ row.original.number }}</span>
          </template>
          <template #name-cell="{ row }">
            <span class="font-medium text-neutral-900 dark:text-white">{{ row.original.name }}</span>
          </template>
          <template #id-cell="{ row }">
            <div class="flex items-center gap-1">
              <UButton
                data-testid="player-edit"
                icon="i-heroicons-pencil"
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

        <template v-if="players.length === 0">
          <CommonEmptyState title="目前沒有球員" />
        </template>
      </CommonListContainer>
    </UCard>

    <!-- 新增/編輯彈窗 -->
    <UModal v-model:open="isFormOpen">
      <template #content>
        <div data-testid="player-form-modal" class="p-6">
          <h3 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            {{ editingPlayer ? '編輯球員' : '新增球員' }}
          </h3>
          <UForm :schema="schema" :state="formState" @submit="onSubmit">
            <div class="space-y-2">
              <UFormField v-if="!editingPlayer" label="所屬球隊" name="team_id" required class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }">
                <USelect
                  v-model="formState.team_id"
                  :items="teamOptions"
                  value-key="value"
                  placeholder="請選擇球隊"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="背號" name="number" required class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }">
                <UInput
                  v-model.number="formState.number"
                  data-testid="player-number"
                  type="number"
                  placeholder="0-999"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="姓名" name="name" required class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }">
                <UInput
                  v-model="formState.name"
                  data-testid="player-name"
                  placeholder="請輸入球員姓名"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="身高 (cm)" name="height" required class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }">
                <UInput
                  v-model.number="formState.height"
                  data-testid="player-height"
                  type="number"
                  placeholder="100-250"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="守備位置" name="position" required class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }">
                <USelect
                  v-model="formState.position"
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
                :disabled="formLoading"
                @click="isFormOpen = false"
              >
                取消
              </UButton>
              <UButton
                data-testid="player-save"
                type="submit"
                color="primary"
                :loading="formLoading"
              >
                {{ editingPlayer ? '儲存' : '建立' }}
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
      :description="`確定要刪除球員「${deletingPlayer?.name}」嗎？`"
      confirm-label="刪除"
      confirm-color="error"
      :loading="deleteLoading"
      @confirm="confirmDelete"
    />
  </div>
</template>
