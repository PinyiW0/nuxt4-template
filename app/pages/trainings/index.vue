<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import type { PlayerItem } from '~/types/api/players'
import type { TeamItem } from '~/types/api/teams'
import type { TrainingItem } from '~/types/api/trainings'
import { z } from 'zod'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default' })

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

// 搜尋
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 10

// 取得球隊和球員（用於新增訓練）
const { data: teamsData } = await useFetch<{ status: string, data: TeamItem[] }>('/api/teams')
const { data: playersData } = await useFetch<{ status: string, data: PlayerItem[] }>('/api/players')

const _teams = computed(() => teamsData.value?.data ?? [])
const players = computed(() => playersData.value?.data ?? [])

// 取得訓練列表（今天及未來）
const { data, refresh } = await useFetch<{
  status: string
  data: TrainingItem[]
  meta: { total: number }
}>('/api/trainings')

const allItems = computed(() => data.value?.data ?? [])

const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q)
    return allItems.value
  return allItems.value.filter(t =>
    t.player_name.toLowerCase().includes(q)
    || t.team_name.toLowerCase().includes(q)
    || t.date.includes(q),
  )
})

const totalItems = computed(() => filteredItems.value.length)

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredItems.value.slice(start, start + pageSize)
})

watch(searchQuery, () => {
  currentPage.value = 1
})

const columns: TableColumn<TrainingItem>[] = [
  { accessorKey: 'date', header: '日期' },
  { accessorKey: 'player_name', header: '受測選手' },
  { accessorKey: 'team_name', header: '球隊' },
  { accessorKey: 'pitch_count', header: '投球數' },
  { accessorKey: 'ai_status', header: 'AI 狀態' },
  { accessorKey: 'actions', header: '操作' },
]

function handleSelectRow(_e: Event, row: { original: TrainingItem }) {
  router.push(`/trainings/${row.original.id}`)
}

// === 新增訓練 ===
const isFormModalOpen = ref(false)
const isSubmitting = ref(false)
const selectedPlayerId = ref<number | null>(null)

const schema = z.object({
  date: z.string().min(1, '請選擇日期'),
  player_id: z.number({ error: '請選擇受測選手' }).min(1, '請選擇受測選手'),
  strike_zone_top: z.number({ error: '請輸入上緣' }).min(90, '上緣範圍 90-150').max(150, '上緣範圍 90-150'),
  strike_zone_bottom: z.number({ error: '請輸入下緣' }).min(30, '下緣範圍 30-70').max(70, '下緣範圍 30-70'),
})

type Schema = z.output<typeof schema>

const formState = reactive<Schema>({
  date: '',
  player_id: 0,
  strike_zone_top: 120,
  strike_zone_bottom: 50,
})

function openCreateModal() {
  formState.date = new Date().toISOString().split('T')[0]!
  formState.player_id = 0
  formState.strike_zone_top = 120
  formState.strike_zone_bottom = 50
  selectedPlayerId.value = null
  isFormModalOpen.value = true
}

// 選手變更時自動帶入身高計算好球帶
watch(() => formState.player_id, (newId) => {
  if (newId) {
    const player = players.value.find(p => p.id === newId)
    if (player) {
      formState.strike_zone_top = Math.round(player.height * 0.686)
      formState.strike_zone_bottom = Math.round(player.height * 0.286)
    }
  }
})

const playerOptions = computed(() =>
  players.value.map(p => ({ label: `${p.name} (#${p.number})`, value: p.id })),
)

async function onFormSubmit(event: FormSubmitEvent<Schema>) {
  if (isSubmitting.value)
    return
  if (event.data.strike_zone_top <= event.data.strike_zone_bottom) {
    toast.add({ title: '驗證錯誤', description: '上緣必須大於下緣', color: 'error' })
    return
  }
  isSubmitting.value = true
  try {
    await $fetch('/api/trainings', {
      method: 'POST',
      body: {
        ...event.data,
        created_by: authStore.currentAccount,
      },
    })
    toast.add({ title: '訓練已建立', color: 'success' })
    isFormModalOpen.value = false
    await refresh()
  }
  catch (error: any) {
    toast.add({ title: '建立失敗', description: error?.data?.message || '操作失敗', color: 'error' })
  }
  finally {
    isSubmitting.value = false
  }
}

// === 刪除 ===
const isDeleteModalOpen = ref(false)
const deletingTraining = ref<TrainingItem | null>(null)
const isDeleting = ref(false)

function openDeleteModal(training: TrainingItem) {
  deletingTraining.value = training
  isDeleteModalOpen.value = true
}

async function handleDelete() {
  if (!deletingTraining.value || isDeleting.value)
    return
  isDeleting.value = true
  try {
    await $fetch(`/api/trainings/${deletingTraining.value.id}`, { method: 'DELETE' })
    toast.add({ title: '訓練已刪除', color: 'success' })
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
  <div data-testid="trainings-page" class="flex h-full flex-col">
    <!-- 標題列 -->
    <div class="mb-6 flex shrink-0 flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
        訓練管理
      </h1>
      <div class="flex items-center gap-3">
        <UInput
          v-model="searchQuery"
          data-testid="training-search"
          icon="i-heroicons-magnifying-glass"
          placeholder="搜尋..."
          class="w-64"
        />
        <UButton
          data-testid="training-create"
          icon="i-heroicons-plus"
          color="primary"
          @click="openCreateModal"
        >
          新增訓練
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
          icon="i-heroicons-clipboard-document-list"
          title="目前沒有訓練"
          description="點擊上方按鈕新增訓練"
        />
        <UTable
          v-else
          data-testid="training-list"
          :data="pagedItems"
          :columns="columns"
          class="[&_td]:h-12 [&_th]:h-10"
          :ui="{ tr: 'cursor-pointer hover:bg-elevated' }"
          @select="handleSelectRow"
        >
          <template #ai_status-cell="{ row }">
            <UBadge
              :color="row.original.ai_status === 'running' ? 'success' : 'neutral'"
              variant="subtle"
            >
              {{ row.original.ai_status === 'running' ? '運行中' : '已停止' }}
            </UBadge>
          </template>
          <template #actions-cell="{ row }">
            <div class="flex items-center gap-1">
              <UButton
                data-testid="training-delete"
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

    <!-- 新增訓練 Modal -->
    <UModal v-model:open="isFormModalOpen">
      <template #content>
        <div data-testid="training-form-modal" class="p-6">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
            新增訓練
          </h3>
          <UForm
            :schema="schema"
            :state="formState"
            class="mt-4 space-y-4"
            @submit="onFormSubmit"
          >
            <UFormField
              label="日期"
              name="date"
              class="relative mb-8"
              :ui="{ error: 'absolute top-full left-0 mt-1' }"
            >
              <UInput
                v-model="formState.date"
                data-testid="training-date"
                type="date"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="受測選手"
              name="player_id"
              class="relative mb-8"
              :ui="{ error: 'absolute top-full left-0 mt-1' }"
            >
              <USelect
                v-model="formState.player_id"
                data-testid="training-player"
                :items="playerOptions"
                value-key="value"
                placeholder="請選擇受測選手"
                class="w-full"
              />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField
                label="好球帶上緣 (cm)"
                name="strike_zone_top"
                class="relative mb-8"
                :ui="{ error: 'absolute top-full left-0 mt-1' }"
              >
                <UInput
                  v-model.number="formState.strike_zone_top"
                  data-testid="training-strike-zone-height"
                  type="number"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="好球帶下緣 (cm)"
                name="strike_zone_bottom"
                class="relative mb-8"
                :ui="{ error: 'absolute top-full left-0 mt-1' }"
              >
                <UInput
                  v-model.number="formState.strike_zone_bottom"
                  type="number"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="flex justify-end gap-3">
              <UButton color="neutral" variant="outline" :disabled="isSubmitting" @click="isFormModalOpen = false">
                取消
              </UButton>
              <UButton type="submit" data-testid="training-save" color="primary" :loading="isSubmitting">
                建立
              </UButton>
            </div>
          </UForm>
        </div>
      </template>
    </UModal>

    <!-- 刪除確認 -->
    <CommonConfirmModal
      v-model:open="isDeleteModalOpen"
      title="確認刪除"
      description="確定要刪除此訓練嗎？相關投球數據也會一併刪除。"
      confirm-label="刪除"
      confirm-color="error"
      :loading="isDeleting"
      @confirm="handleDelete"
    />
  </div>
</template>
