<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Team } from '~/composables/useTeams'
import { z } from 'zod'

const { isAuthenticated } = useAuth()
const router = useRouter()

// 權限檢查
watch(isAuthenticated, (value) => {
  if (!value)
    router.push('/login')
}, { immediate: true })

const { teams, isLoading, isSubmitting, fetchTeams, createTeam, updateTeam, deleteTeam } = useTeams()

// 搜尋
const searchQuery = ref('')
const filteredTeams = computed(() => {
  if (!searchQuery.value)
    return teams.value
  const query = searchQuery.value.toLowerCase()
  return teams.value.filter(team =>
    team.name.toLowerCase().includes(query),
  )
})

// 表格欄位
const columns = [
  { accessorKey: 'name', header: '球隊名稱' },
  { accessorKey: 'player_count', header: '球員數量' },
  { accessorKey: 'created_by', header: '建立者' },
  { accessorKey: 'created_at', header: '建立時間' },
  { accessorKey: 'actions', header: '操作' },
]

// Modal 狀態
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedTeam = ref<Team | null>(null)

// 表單 Schema
const teamSchema = z.object({
  name: z.string().min(1, '球隊名稱不可為空').max(50, '球隊名稱最多 50 字'),
})

type TeamSchema = z.output<typeof teamSchema>

// 建立表單狀態
const createForm = reactive<TeamSchema>({ name: '' })

// 編輯表單狀態
const editForm = reactive<TeamSchema>({ name: '' })

// 格式化日期
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 開啟建立 Modal
function openCreateModal() {
  createForm.name = ''
  isCreateModalOpen.value = true
}

// 開啟編輯 Modal
function openEditModal(team: Team) {
  selectedTeam.value = team
  editForm.name = team.name
  isEditModalOpen.value = true
}

// 開啟刪除 Modal
function openDeleteModal(team: Team) {
  selectedTeam.value = team
  isDeleteModalOpen.value = true
}

// 提交建立
async function handleCreate(event: FormSubmitEvent<TeamSchema>) {
  const success = await createTeam(event.data.name)
  if (success) {
    isCreateModalOpen.value = false
  }
}

// 提交編輯
async function handleEdit(event: FormSubmitEvent<TeamSchema>) {
  if (!selectedTeam.value)
    return
  const success = await updateTeam(selectedTeam.value.id, event.data.name)
  if (success) {
    isEditModalOpen.value = false
  }
}

// 確認刪除
async function handleDelete() {
  if (!selectedTeam.value)
    return
  const success = await deleteTeam(selectedTeam.value.id)
  if (success) {
    isDeleteModalOpen.value = false
  }
}

// 載入資料
onMounted(() => {
  fetchTeams()
})
</script>

<template>
  <div class="flex flex-col h-full">
    <CommonPageHeader title="球隊管理" description="管理您的球隊資料">
      <template #actions>
        <UButton icon="i-heroicons-plus" @click="openCreateModal">
          新增球隊
        </UButton>
      </template>
      <template #filters>
        <div class="mt-4">
          <CommonSearchInput v-model="searchQuery" placeholder="搜尋球隊名稱..." />
        </div>
      </template>
    </CommonPageHeader>

    <CommonListContainer
      :loading="isLoading"
      :empty="filteredTeams.length === 0"
      empty-title="目前沒有球隊"
      empty-description="點擊上方按鈕建立第一個球隊"
    >
      <template #empty-action>
        <UButton icon="i-heroicons-plus" @click="openCreateModal">
          新增球隊
        </UButton>
      </template>

      <UTable :columns="columns" :data="filteredTeams">
        <template #name-cell="{ row }">
          <span class="font-medium text-neutral-900 dark:text-white">{{ (row.original as Team).name }}</span>
        </template>

        <template #player_count-cell="{ row }">
          <UBadge color="primary" variant="subtle">
            {{ (row.original as Team).player_count }} 人
          </UBadge>
        </template>

        <template #created_at-cell="{ row }">
          <span class="text-neutral-400">{{ formatDate((row.original as Team).created_at) }}</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-1">
            <UButton
              icon="i-heroicons-pencil"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="openEditModal(row.original as Team)"
            />
            <UButton
              icon="i-heroicons-trash"
              variant="ghost"
              color="error"
              size="xs"
              @click="openDeleteModal(row.original as Team)"
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
            新增球隊
          </h3>
          <UForm :schema="teamSchema" :state="createForm" @submit="handleCreate">
            <UFormField label="球隊名稱" name="name" required>
              <UInput
                v-model="createForm.name"
                placeholder="請輸入球隊名稱"
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
                label="建立"
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
            編輯球隊
          </h3>
          <UForm :schema="teamSchema" :state="editForm" @submit="handleEdit">
            <UFormField label="球隊名稱" name="name" required>
              <UInput
                v-model="editForm.name"
                placeholder="請輸入球隊名稱"
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
      :description="`確定要刪除球隊「${selectedTeam?.name}」嗎？此操作將同時刪除該球隊的所有球員。`"
      confirm-label="刪除"
      :loading="isSubmitting"
      @confirm="handleDelete"
    />
  </div>
</template>
