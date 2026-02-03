<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { isAuthenticated, userAccount, userRole } = useAuth()
const toast = useToast()

// 權限檢查
watch(isAuthenticated, (value) => {
  if (!value)
    router.push('/login')
}, { immediate: true })

const trainingId = computed(() => Number(route.params.id))

// 狀態
interface AnalysisData {
  training: {
    id: number
    date: string
    player_name: string
    team_name: string
  }
  stats: {
    total_pitches: number
    strike_count: number
    ball_count: number
    strike_rate: number
    avg_velocity: number
    max_velocity: number
    min_velocity: number
    avg_spin_rate: number
  }
  heatmap: {
    row: number
    col: number
    count: number
    strikes: number
    strike_rate: number
  }[]
  velocity_distribution: {
    label: string
    count: number
  }[]
}

const analysisData = ref<AnalysisData | null>(null)
const isLoading = ref(false)

// 載入分析資料
async function fetchAnalysis() {
  isLoading.value = true
  try {
    const response = await $fetch(`/api/trainings/${trainingId.value}/analysis`, {
      query: {
        user: userAccount.value,
        role: userRole.value,
      },
    })

    if (response.status === 'success') {
      analysisData.value = response.data as AnalysisData
    }
  }
  catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: '載入失敗',
      description: err.data?.message || '無法載入分析資料',
      color: 'error',
    })
    router.push('/trainings')
  }
  finally {
    isLoading.value = false
  }
}

// 取得熱區格子的顏色
function getHeatmapColor(cell: AnalysisData['heatmap'][0]) {
  if (cell.count === 0)
    return 'bg-neutral-100 dark:bg-neutral-800'
  if (cell.strike_rate >= 70)
    return 'bg-success-500/60'
  if (cell.strike_rate >= 50)
    return 'bg-warning-500/60'
  return 'bg-error-500/60'
}

// 取得球速分布最大值
const maxVelocityCount = computed(() => {
  if (!analysisData.value)
    return 1
  return Math.max(...analysisData.value.velocity_distribution.map(v => v.count), 1)
})

// 載入資料
onMounted(async () => {
  await fetchAnalysis()
})
</script>

<template>
  <div class="flex flex-col h-full">
    <CommonPageHeader
      :title="analysisData ? `訓練分析 - ${analysisData.training.player_name}` : '訓練分析'"
      :description="analysisData ? `${analysisData.training.team_name} | ${analysisData.training.date}` : ''"
    >
      <template #actions>
        <UButton :to="`/trainings/${trainingId}`" variant="outline" color="neutral" icon="i-heroicons-arrow-left">
          返回紀錄
        </UButton>
      </template>
    </CommonPageHeader>

    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin text-primary-500" />
    </div>

    <template v-else-if="analysisData">
      <!-- 統計數據 -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <UCard>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            總投球數
          </p>
          <p class="text-2xl font-semibold text-neutral-900 dark:text-white">
            {{ analysisData.stats.total_pitches }}
          </p>
        </UCard>

        <UCard>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            好球率
          </p>
          <p class="text-2xl font-semibold text-neutral-900 dark:text-white">
            {{ analysisData.stats.strike_rate }}%
          </p>
          <p class="text-xs text-neutral-500">
            好球 {{ analysisData.stats.strike_count }} / 壞球 {{ analysisData.stats.ball_count }}
          </p>
        </UCard>

        <UCard>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            平均球速
          </p>
          <p class="text-2xl font-semibold text-neutral-900 dark:text-white">
            {{ analysisData.stats.avg_velocity }} km/h
          </p>
          <p class="text-xs text-neutral-500">
            最快 {{ analysisData.stats.max_velocity }} / 最慢 {{ analysisData.stats.min_velocity }}
          </p>
        </UCard>

        <UCard>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            平均轉速
          </p>
          <p class="text-2xl font-semibold text-neutral-900 dark:text-white">
            {{ analysisData.stats.avg_spin_rate }} rpm
          </p>
        </UCard>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- 熱區分布 -->
        <UCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900 dark:text-white">
              投球熱區分布
            </h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              3x3 九宮格顯示好球率
            </p>
          </template>

          <div class="flex justify-center">
            <div class="grid grid-cols-3 gap-1 w-64">
              <template v-for="cell in analysisData.heatmap" :key="`${cell.row}-${cell.col}`">
                <div
                  class="aspect-square flex flex-col items-center justify-center rounded-lg transition-colors" :class="[
                    getHeatmapColor(cell),
                  ]"
                >
                  <span class="text-lg font-semibold text-white">{{ cell.count }}</span>
                  <span v-if="cell.count > 0" class="text-xs text-white/70">{{ cell.strike_rate }}%</span>
                </div>
              </template>
            </div>
          </div>

          <template #footer>
            <div class="flex items-center justify-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
              <span class="flex items-center gap-1">
                <span class="w-3 h-3 rounded bg-success-500/60" />
                好球率 ≥70%
              </span>
              <span class="flex items-center gap-1">
                <span class="w-3 h-3 rounded bg-warning-500/60" />
                好球率 50-70%
              </span>
              <span class="flex items-center gap-1">
                <span class="w-3 h-3 rounded bg-error-500/60" />
                好球率 &lt;50%
              </span>
            </div>
          </template>
        </UCard>

        <!-- 球速分布 -->
        <UCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900 dark:text-white">
              球速分布
            </h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              各區間投球數量
            </p>
          </template>

          <div class="space-y-3">
            <div
              v-for="range in analysisData.velocity_distribution"
              :key="range.label"
              class="flex items-center gap-3"
            >
              <span class="w-20 text-sm text-neutral-500 dark:text-neutral-400 text-right">{{ range.label }}</span>
              <div class="flex-1 h-6 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary-500 rounded-full transition-all duration-500"
                  :style="{ width: `${(range.count / maxVelocityCount) * 100}%` }"
                />
              </div>
              <span class="w-8 text-sm text-neutral-900 dark:text-white text-right">{{ range.count }}</span>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </div>
</template>
