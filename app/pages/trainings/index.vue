<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import type { PlayerItem } from '~/types/api/players'
import type { TrainingItem } from '~/types/api/trainings'
import { z } from 'zod'

definePageMeta({ layout: 'default' })

const toast = useToast()
const router = useRouter()

// 分頁
const page = ref(1)
const pageSize = 10

// 取得訓練列表
const { data: result, refresh } = await useFetch('/api/trainings', {
  query: computed(() => ({ page: page.value, page_size: pageSize })),
})

const trainings = computed<TrainingItem[]>(() => result.value?.data ?? [])
const total = computed(() => result.value?.meta?.total ?? 0)

// 取得球員列表（用於建立訓練的選手下拉）
const { data: playersResult } = await useFetch('/api/players', {
  query: { page_size: 100 },
})
const playerOptions = computed(() => {
  const items = (playersResult.value?.data ?? []) as PlayerItem[]
  return items.map(p => ({
    label: `${p.name} (#${p.number} - ${p.team_name})`,
    value: String(p.id),
    height: p.height,
  }))
})

// 表格欄位
const columns: TableColumn<TrainingItem>[] = [
  { accessorKey: 'date', header: '訓練日期' },
  { accessorKey: 'player_name', header: '受測選手' },
  { accessorKey: 'team_name', header: '所屬球隊' },
  { accessorKey: 'pitch_count', header: '投球數' },
  { accessorKey: 'ai_status', header: 'AI 狀態' },
  { accessorKey: 'id', header: '操作' },
]

// 點擊列導航到訓練詳情
function handleRowSelect(_e: Event, row: { original: TrainingItem }) {
  router.push(`/trainings/${row.original.id}`)
}

// 新增彈窗
const isFormOpen = ref(false)
const formLoading = ref(false)

const schema = z.object({
  date: z.string().min(1, '請選擇訓練日期'),
  player_id: z.string().min(1, '請選擇受測選手'),
  strike_zone_height: z.number({ error: '請輸入好球帶身高' }).min(100, '身高必須為 100-250').max(250, '身高必須為 100-250'),
})

type TrainingSchema = z.infer<typeof schema>

const formState = reactive<TrainingSchema>({
  date: '',
  player_id: '',
  strike_zone_height: 170,
})

function openCreate() {
  formState.date = new Date().toISOString().split('T')[0]!
  formState.player_id = ''
  formState.strike_zone_height = 170
  isFormOpen.value = true
}

// 選手變更時自動帶入身高
watch(() => formState.player_id, (newVal) => {
  if (newVal) {
    const player = playerOptions.value.find(p => p.value === newVal)
    if (player) {
      formState.strike_zone_height = player.height
    }
  }
})

async function onSubmit(event: FormSubmitEvent<TrainingSchema>) {
  formLoading.value = true
  try {
    await $fetch('/api/trainings', {
      method: 'POST',
      body: {
        date: event.data.date,
        player_id: Number(event.data.player_id),
        strike_zone_top: event.data.strike_zone_height,
        strike_zone_bottom: 50,
      },
    })
    toast.add({ title: '訓練已建立', color: 'success' })
    isFormOpen.value = false
    await refresh()
  }
  catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message
      || (err as { message?: string })?.message
      || '建立失敗'
    toast.add({ title: message, color: 'error' })
  }
  finally {
    formLoading.value = false
  }
}

// 刪除
const isDeleteOpen = ref(false)
const deletingTraining = ref<TrainingItem | null>(null)
const deleteLoading = ref(false)

function openDelete(training: TrainingItem) {
  deletingTraining.value = training
  isDeleteOpen.value = true
}

async function confirmDelete() {
  if (!deletingTraining.value)
    return
  deleteLoading.value = true
  try {
    await $fetch(`/api/trainings/${deletingTraining.value.id}`, { method: 'DELETE' })
    toast.add({ title: '訓練已刪除', color: 'success' })
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
</script>

<template>
  <div data-testid="trainings-page" class="flex h-full flex-col">
    <!-- Header -->
    <div class="mb-6 flex shrink-0 items-center justify-between">
      <CommonPageHeader title="訓練管理" description="管理今天及未來的訓練" />
      <UButton
        data-testid="training-create"
        icon="i-heroicons-plus"
        color="primary"
        @click="openCreate"
      >
        新增訓練
      </UButton>
    </div>

    <!-- 列表 -->
    <UCard class="min-h-0 flex-1" :ui="{ body: 'p-0 overflow-auto flex-1 min-h-0', root: 'flex flex-col min-h-0' }">
      <CommonListContainer v-model:page="page" :total="total" :page-size="pageSize">
        <UTable
          data-testid="training-list"
          :data="trainings"
          :columns="columns"
          class="w-full"
          @select="handleRowSelect"
        >
          <template #date-cell="{ row }">
            <span class="font-medium text-neutral-900 dark:text-white">{{ row.original.date }}</span>
          </template>
          <template #ai_status-cell="{ row }">
            <UBadge
              :color="row.original.ai_status === 'running' ? 'success' : 'neutral'"
              variant="subtle"
            >
              {{ row.original.ai_status === 'running' ? '運行中' : '已停止' }}
            </UBadge>
          </template>
          <template #id-cell="{ row }">
            <div class="flex items-center gap-1">
              <UButton
                icon="i-heroicons-eye"
                color="neutral"
                variant="ghost"
                size="xs"
                @click.stop="router.push(`/trainings/${row.original.id}`)"
              />
              <UButton
                data-testid="training-delete"
                icon="i-heroicons-trash"
                color="error"
                variant="ghost"
                size="xs"
                @click.stop="openDelete(row.original)"
              />
            </div>
          </template>
        </UTable>

        <template v-if="trainings.length === 0">
          <CommonEmptyState title="目前沒有訓練" />
        </template>
      </CommonListContainer>
    </UCard>

    <!-- 新增訓練彈窗 -->
    <UModal v-model:open="isFormOpen">
      <template #content>
        <div data-testid="training-form-modal" class="p-6">
          <h3 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            新增訓練
          </h3>
          <UForm :schema="schema" :state="formState" @submit="onSubmit">
            <div class="space-y-2">
              <UFormField label="訓練日期" name="date" required class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }">
                <UInput
                  v-model="formState.date"
                  data-testid="training-date"
                  type="date"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="受測選手" name="player_id" required class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }">
                <USelect
                  v-model="formState.player_id"
                  data-testid="training-player"
                  :items="playerOptions"
                  value-key="value"
                  placeholder="請選擇受測選手"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="好球帶身高 (cm)" name="strike_zone_height" required class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }">
                <UInput
                  v-model.number="formState.strike_zone_height"
                  data-testid="training-strike-zone-height"
                  type="number"
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
                data-testid="training-save"
                type="submit"
                color="primary"
                :loading="formLoading"
              >
                建立
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
      description="確定要刪除此訓練嗎？相關投球數據也會一併刪除。"
      confirm-label="刪除"
      confirm-color="error"
      :loading="deleteLoading"
      @confirm="confirmDelete"
    />
  </div>
</template>
