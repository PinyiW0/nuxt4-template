<script setup lang="ts">
import type { PlayerItem } from '~/types/api/players'
import type { TeamItem } from '~/types/api/teams'
import type { TrainingItem } from '~/types/api/trainings'

import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default' })

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

// 分頁
const page = ref(1)
const pageSize = 10

// 訓練列表
const { data: trainingsResponse, refresh } = useFetch('/api/trainings', {
  query: computed(() => ({
    page: page.value,
    page_size: pageSize,
    user: authStore.user?.account,
    role: authStore.user?.role,
  })),
})

const trainings = computed(() => trainingsResponse.value?.data ?? [])
const total = computed(() => (trainingsResponse.value as Record<string, unknown>)?.total as number ?? 0)

// 球隊列表（用於表單）
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

// 球員列表（依球隊篩選）
const formTeamId = ref<number | undefined>(undefined)
const { data: playersResponse } = useFetch('/api/players', {
  query: computed(() => ({
    page_size: 999,
    team_id: formTeamId.value,
    user: authStore.user?.account,
    role: authStore.user?.role,
  })),
  watch: [formTeamId],
})
const playerOptions = computed(() => {
  const list = (playersResponse.value?.data ?? []) as PlayerItem[]
  return list.map(p => ({ label: `${p.number} - ${p.name}`, value: p.id }))
})

// 表格欄位
const columns = [
  { accessorKey: 'date', header: '日期' },
  { accessorKey: 'player_name', header: '選手' },
  { accessorKey: 'team_name', header: '球隊' },
  { accessorKey: 'pitch_count', header: '投球數' },
  { accessorKey: 'ai_status', header: 'AI 狀態' },
  { accessorKey: 'actions', header: '操作' },
]

// 點擊列導航
function handleRowSelect(_e: Event, row: { original: TrainingItem }) {
  router.push(`/trainings/${row.original.id}`)
}

// 表單 Modal
const isFormOpen = ref(false)
const isSubmitting = ref(false)
const formDate = ref('')
const formPlayerId = ref<number | undefined>(undefined)
const formStrikeZoneTop = ref<number | undefined>(undefined)
const formStrikeZoneBottom = ref<number | undefined>(undefined)
const formErrors = ref<Record<string, string>>({})

function openCreate() {
  formDate.value = ''
  formTeamId.value = undefined
  formPlayerId.value = undefined
  formStrikeZoneTop.value = undefined
  formStrikeZoneBottom.value = undefined
  formErrors.value = {}
  isFormOpen.value = true
}

// 當球隊變更時清空球員選擇
watch(formTeamId, () => {
  formPlayerId.value = undefined
})

function validateForm(): boolean {
  const errors: Record<string, string> = {}

  if (!formDate.value) {
    errors.date = '請選擇日期'
  }
  if (!formTeamId.value) {
    errors.team = '請選擇球隊'
  }
  if (!formPlayerId.value) {
    errors.player = '請選擇選手'
  }
  if (formStrikeZoneTop.value !== undefined && formStrikeZoneBottom.value !== undefined) {
    if (formStrikeZoneTop.value <= formStrikeZoneBottom.value) {
      errors.strikeZone = '好球帶上緣必須大於下緣'
    }
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
    await $fetch('/api/trainings', {
      method: 'POST',
      body: {
        date: formDate.value,
        player_id: formPlayerId.value,
        strike_zone_top: formStrikeZoneTop.value,
        strike_zone_bottom: formStrikeZoneBottom.value,
      },
    })
    toast.add({ title: '訓練已新增', color: 'success' })
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
const deletingTraining = ref<TrainingItem | null>(null)
const isDeleting = ref(false)

function openDelete(training: TrainingItem) {
  deletingTraining.value = training
  isDeleteOpen.value = true
}

async function handleDelete() {
  if (isDeleting.value || !deletingTraining.value)
    return

  isDeleting.value = true
  try {
    await $fetch(`/api/trainings/${deletingTraining.value.id}`, { method: 'DELETE' })
    toast.add({ title: '訓練已刪除', color: 'success' })
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

// AI 狀態 Badge 顏色
function getAiStatusColor(status: string) {
  return status === 'running' ? 'success' : 'neutral'
}

function getAiStatusLabel(status: string) {
  return status === 'running' ? '運行中' : '已停止'
}
</script>

<template>
  <div data-testid="trainings-page" class="flex h-full flex-col">
    <CommonPageHeader title="訓練列表" description="管理所有訓練排程" />

    <!-- 工具列 -->
    <div class="mb-4 flex items-center justify-end">
      <UButton
        data-testid="training-create"
        icon="i-heroicons-plus"
        label="新增訓練"
        @click="openCreate"
      />
    </div>

    <!-- 列表 -->
    <CommonListContainer
      v-model:page="page"
      :total="total"
      :page-size="pageSize"
      data-testid="trainings-pagination"
    >
      <UTable
        data-testid="training-list"
        :data="trainings"
        :columns="columns"
        class="w-full"
        @select="handleRowSelect"
      >
        <template #date-cell="{ row }">
          <span class="text-neutral-900 dark:text-white">{{ row.original.date }}</span>
        </template>

        <template #player_name-cell="{ row }">
          <span class="text-neutral-900 dark:text-white">{{ row.original.player_name }}</span>
        </template>

        <template #team_name-cell="{ row }">
          <span class="text-neutral-700 dark:text-neutral-300">{{ row.original.team_name }}</span>
        </template>

        <template #pitch_count-cell="{ row }">
          <span class="text-neutral-700 dark:text-neutral-300">{{ row.original.pitch_count }}</span>
        </template>

        <template #ai_status-cell="{ row }">
          <UBadge :color="getAiStatusColor(row.original.ai_status)" variant="subtle">
            {{ getAiStatusLabel(row.original.ai_status) }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <UButton
            data-testid="training-delete"
            icon="i-heroicons-trash"
            color="error"
            variant="ghost"
            size="xs"
            @click.stop="openDelete(row.original)"
          />
        </template>
      </UTable>
    </CommonListContainer>

    <!-- 新增 Modal -->
    <UModal v-model:open="isFormOpen">
      <template #content>
        <div data-testid="training-form-modal" class="p-6">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
            新增訓練
          </h3>

          <div class="mt-4 space-y-2">
            <UFormField label="訓練日期" class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }" :error="formErrors.date">
              <UInput
                v-model="formDate"
                data-testid="training-date"
                type="date"
                class="w-full"
              />
            </UFormField>

            <UFormField label="球隊" class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }" :error="formErrors.team">
              <USelect
                v-model="formTeamId"
                data-testid="training-team"
                :items="teamOptions"
                placeholder="請選擇球隊"
                class="w-full"
              />
            </UFormField>

            <UFormField label="選手" class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }" :error="formErrors.player">
              <USelect
                v-model="formPlayerId"
                data-testid="training-player"
                :items="playerOptions"
                placeholder="請先選擇球隊"
                :disabled="!formTeamId"
                class="w-full"
              />
            </UFormField>

            <UFormField label="好球帶上緣 (cm)" class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }" :error="formErrors.strikeZone">
              <UInput
                v-model.number="formStrikeZoneTop"
                type="number"
                placeholder="留空自動計算"
                class="w-full"
              />
            </UFormField>

            <UFormField label="好球帶下緣 (cm)" class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }">
              <UInput
                v-model.number="formStrikeZoneBottom"
                type="number"
                placeholder="留空自動計算"
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
              data-testid="training-save"
              :loading="isSubmitting"
              @click="handleSave"
            >
              新增
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- 刪除確認 Modal -->
    <CommonConfirmModal
      v-model:open="isDeleteOpen"
      title="確認刪除"
      :description="`確定要刪除「${deletingTraining?.date ?? ''} - ${deletingTraining?.player_name ?? ''}」的訓練嗎？`"
      confirm-label="刪除"
      confirm-color="error"
      :loading="isDeleting"
      @confirm="handleDelete"
    />
  </div>
</template>
