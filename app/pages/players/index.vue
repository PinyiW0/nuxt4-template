<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Player } from '~/composables/usePlayers'
import { z } from 'zod'
import { POSITIONS } from '~/composables/usePlayers'

const { isAuthenticated } = useAuth()
const router = useRouter()

// 權限檢查
watch(isAuthenticated, (value) => {
  if (!value)
    router.push('/login')
}, { immediate: true })

const { teams, fetchTeams } = useTeams()
const {
  players,
  isLoading,
  isSubmitting,
  fetchPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
  updateSortOrder,
} = usePlayers()

// 篩選
const searchQuery = ref('')

// 依球隊篩選的球員
const filteredPlayers = computed(() => {
  let result = players.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(query)
      || p.number.toString().includes(query),
    )
  }

  // 依排序順序排列
  return result.sort((a, b) => a.sort_order - b.sort_order)
})

// 球隊選項（用於篩選）
const teamFilterOptions = computed(() => [
  { label: '全部球隊', value: 'all' },
  ...teams.value.map(t => ({ label: t.name, value: String(t.id) })),
])

// 球隊選項（用於表單）
const teamFormOptions = computed(() =>
  teams.value.map(t => ({ label: t.name, value: String(t.id) })),
)

// 守備位置選項
const positionOptions: { label: string, value: string }[] = POSITIONS.map(p => ({ label: p, value: p }))

// 篩選用的字串值
const selectedTeamFilter = ref<string>('all')

// 轉換篩選值為數字
const selectedTeamId = computed(() => {
  if (selectedTeamFilter.value === 'all')
    return undefined
  return Number(selectedTeamFilter.value)
})

// 表格欄位
const columns = [
  { accessorKey: 'sort_order', header: '#' },
  { accessorKey: 'number', header: '背號' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'height', header: '身高' },
  { accessorKey: 'position', header: '守備位置' },
  { accessorKey: 'team_name', header: '球隊' },
  { accessorKey: 'actions', header: '操作' },
]

// Modal 狀態
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedPlayer = ref<Player | null>(null)

// 表單 Schema
const playerSchema = z.object({
  number: z.coerce.number().int().min(0, '背號必須為 0-999').max(999, '背號必須為 0-999'),
  name: z.string().min(1, '球員姓名不可為空').max(50, '球員姓名最多 50 字'),
  height: z.coerce.number().int().min(100, '身高必須為 100-250 公分').max(250, '身高必須為 100-250 公分'),
  position: z.string().min(1, '請選擇守備位置'),
  team_id: z.coerce.number().int().positive('請選擇球隊'),
})

type PlayerSchema = z.output<typeof playerSchema>

// 建立表單狀態
const createForm = reactive({
  number: 0,
  name: '',
  height: 175,
  position: '',
  team_id: '',
})

// 編輯表單狀態
const editForm = reactive({
  number: 0,
  name: '',
  height: 175,
  position: '',
})

// 開啟建立 Modal
function openCreateModal() {
  createForm.number = 0
  createForm.name = ''
  createForm.height = 175
  createForm.position = ''
  createForm.team_id = selectedTeamId.value?.toString() || (teams.value[0]?.id.toString() ?? '')
  isCreateModalOpen.value = true
}

// 開啟編輯 Modal
function openEditModal(player: Player) {
  selectedPlayer.value = player
  editForm.number = player.number
  editForm.name = player.name
  editForm.height = player.height
  editForm.position = player.position
  isEditModalOpen.value = true
}

// 開啟刪除 Modal
function openDeleteModal(player: Player) {
  selectedPlayer.value = player
  isDeleteModalOpen.value = true
}

// 提交建立
async function handleCreate(event: FormSubmitEvent<PlayerSchema>) {
  const data = {
    ...event.data,
    team_id: Number(createForm.team_id),
  }
  const success = await createPlayer(data)
  if (success) {
    isCreateModalOpen.value = false
  }
}

// 提交編輯
async function handleEdit(event: FormSubmitEvent<Omit<PlayerSchema, 'team_id'>>) {
  if (!selectedPlayer.value)
    return
  const success = await updatePlayer(
    selectedPlayer.value.id,
    event.data,
    selectedTeamId.value,
  )
  if (success) {
    isEditModalOpen.value = false
  }
}

// 確認刪除
async function handleDelete() {
  if (!selectedPlayer.value)
    return
  const success = await deletePlayer(selectedPlayer.value.id, selectedTeamId.value)
  if (success) {
    isDeleteModalOpen.value = false
  }
}

// 移動球員排序
async function movePlayer(index: number, direction: 'up' | 'down') {
  const newIndex = direction === 'up' ? index - 1 : index + 1
  if (newIndex < 0 || newIndex >= filteredPlayers.value.length)
    return

  const newOrder = [...filteredPlayers.value]
  const [removed] = newOrder.splice(index, 1)
  newOrder.splice(newIndex, 0, removed!)

  const playerIds = newOrder.map(p => p.id)
  await updateSortOrder(playerIds)
  await fetchPlayers(selectedTeamId.value)
}

// 篩選球隊變更
watch(selectedTeamFilter, () => {
  fetchPlayers(selectedTeamId.value)
})

// 載入資料
onMounted(async () => {
  await fetchTeams()
  await fetchPlayers()
})
</script>

<template>
  <div class="flex flex-col h-full">
    <CommonPageHeader title="球員管理" description="管理您的球員資料">
      <template #actions>
        <UButton icon="i-heroicons-plus" @click="openCreateModal">
          新增球員
        </UButton>
      </template>
      <template #filters>
        <div class="mt-4 flex flex-wrap items-center gap-4">
          <USelect
            v-model="selectedTeamFilter"
            :items="teamFilterOptions"
            placeholder="選擇球隊"
            class="w-48"
          />
          <CommonSearchInput v-model="searchQuery" placeholder="搜尋球員..." />
        </div>
      </template>
    </CommonPageHeader>

    <CommonListContainer
      :loading="isLoading"
      :empty="filteredPlayers.length === 0"
      empty-title="目前沒有球員"
      empty-description="點擊上方按鈕新增第一位球員"
    >
      <template #empty-action>
        <UButton icon="i-heroicons-plus" @click="openCreateModal">
          新增球員
        </UButton>
      </template>

      <UTable :columns="columns" :data="filteredPlayers">
        <template #sort_order-cell="{ row }">
          <div class="flex items-center gap-1">
            <span class="text-neutral-500 w-6">{{ (row.original as Player).sort_order }}</span>
            <div class="flex flex-col">
              <UButton
                icon="i-heroicons-chevron-up"
                variant="ghost"
                color="neutral"
                size="xs"
                :disabled="row.index === 0"
                @click="movePlayer(row.index, 'up')"
              />
              <UButton
                icon="i-heroicons-chevron-down"
                variant="ghost"
                color="neutral"
                size="xs"
                :disabled="row.index === filteredPlayers.length - 1"
                @click="movePlayer(row.index, 'down')"
              />
            </div>
          </div>
        </template>

        <template #number-cell="{ row }">
          <UBadge color="primary" variant="subtle">
            #{{ (row.original as Player).number }}
          </UBadge>
        </template>

        <template #name-cell="{ row }">
          <span class="font-medium text-neutral-900 dark:text-white">{{ (row.original as Player).name }}</span>
        </template>

        <template #height-cell="{ row }">
          <span>{{ (row.original as Player).height }} cm</span>
        </template>

        <template #position-cell="{ row }">
          <UBadge color="secondary" variant="subtle">
            {{ (row.original as Player).position }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-1">
            <UButton
              icon="i-heroicons-pencil"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="openEditModal(row.original as Player)"
            />
            <UButton
              icon="i-heroicons-trash"
              variant="ghost"
              color="error"
              size="xs"
              @click="openDeleteModal(row.original as Player)"
            />
          </div>
        </template>
      </UTable>
    </CommonListContainer>

    <!-- 建立 Modal -->
    <UModal v-model:open="isCreateModalOpen">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            新增球員
          </h3>
          <UForm :schema="playerSchema" :state="createForm" class="space-y-4" @submit="handleCreate">
            <UFormField label="所屬球隊" name="team_id" required>
              <USelect
                v-model="createForm.team_id"
                :items="teamFormOptions"
                placeholder="選擇球隊"
                :disabled="isSubmitting"
              />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="背號" name="number" required>
                <UInput
                  v-model="createForm.number"
                  type="number"
                  placeholder="0-999"
                  :disabled="isSubmitting"
                />
              </UFormField>

              <UFormField label="身高 (cm)" name="height" required>
                <UInput
                  v-model="createForm.height"
                  type="number"
                  placeholder="100-250"
                  :disabled="isSubmitting"
                />
              </UFormField>
            </div>

            <UFormField label="姓名" name="name" required>
              <UInput
                v-model="createForm.name"
                placeholder="請輸入球員姓名"
                :disabled="isSubmitting"
              />
            </UFormField>

            <UFormField label="守備位置" name="position" required>
              <USelect
                v-model="createForm.position"
                :items="positionOptions"
                placeholder="選擇守備位置"
                :disabled="isSubmitting"
              />
            </UFormField>

            <div class="mt-6 flex justify-end gap-3">
              <UButton
                label="取消"
                color="neutral"
                variant="outline"
                :disabled="isSubmitting"
                @click="isCreateModalOpen = false"
              />
              <UButton
                type="submit"
                label="新增"
                :loading="isSubmitting"
                :disabled="isSubmitting"
              />
            </div>
          </UForm>
        </div>
      </template>
    </UModal>

    <!-- 編輯 Modal -->
    <UModal v-model:open="isEditModalOpen">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            編輯球員
          </h3>
          <UForm
            :schema="playerSchema.omit({ team_id: true })"
            :state="editForm"
            class="space-y-4"
            @submit="handleEdit"
          >
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="背號" name="number" required>
                <UInput
                  v-model="editForm.number"
                  type="number"
                  placeholder="0-999"
                  :disabled="isSubmitting"
                />
              </UFormField>

              <UFormField label="身高 (cm)" name="height" required>
                <UInput
                  v-model="editForm.height"
                  type="number"
                  placeholder="100-250"
                  :disabled="isSubmitting"
                />
              </UFormField>
            </div>

            <UFormField label="姓名" name="name" required>
              <UInput
                v-model="editForm.name"
                placeholder="請輸入球員姓名"
                :disabled="isSubmitting"
              />
            </UFormField>

            <UFormField label="守備位置" name="position" required>
              <USelect
                v-model="editForm.position"
                :items="positionOptions"
                placeholder="選擇守備位置"
                :disabled="isSubmitting"
              />
            </UFormField>

            <div class="mt-6 flex justify-end gap-3">
              <UButton
                label="取消"
                color="neutral"
                variant="outline"
                :disabled="isSubmitting"
                @click="isEditModalOpen = false"
              />
              <UButton
                type="submit"
                label="儲存"
                :loading="isSubmitting"
                :disabled="isSubmitting"
              />
            </div>
          </UForm>
        </div>
      </template>
    </UModal>

    <!-- 刪除確認 Modal -->
    <CommonConfirmModal
      v-model:open="isDeleteModalOpen"
      title="確認刪除"
      :description="`確定要刪除球員「${selectedPlayer?.name}」嗎？`"
      confirm-label="刪除"
      :loading="isSubmitting"
      @confirm="handleDelete"
    />
  </div>
</template>
