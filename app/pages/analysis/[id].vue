<script setup lang="ts">
import type { PlayerStatistics } from '~/composables/usePlayerAnalysis'

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()
const toast = useToast()

// 權限檢查
watch(isAuthenticated, (value) => {
  if (!value)
    router.push('/login')
}, { immediate: true })

const { fetchPlayerStatistics } = usePlayerAnalysis()

const playerId = computed(() => Number(route.params.id))
const statistics = ref<PlayerStatistics | null>(null)
const isLoading = ref(false)

// 載入選手統計
async function loadStatistics() {
  isLoading.value = true
  try {
    statistics.value = await fetchPlayerStatistics(playerId.value)
    if (!statistics.value) {
      router.push('/analysis')
    }
  }
  catch {
    toast.add({
      title: '載入失敗',
      description: '無法載入選手統計資料',
      color: 'error',
    })
    router.push('/analysis')
  }
  finally {
    isLoading.value = false
  }
}

// 取得熱區格子的顏色（根據投球數量顯示熱度）
function getHeatmapColor(cell: PlayerStatistics['strike_zone_heatmap'][0]) {
  if (cell.count === 0)
    return 'bg-neutral-100 dark:bg-neutral-800'
  if (cell.count >= 40)
    return 'bg-error-500/60'
  if (cell.count >= 25)
    return 'bg-warning-500/60'
  return 'bg-success-500/60'
}

// 取得球速趨勢最大值
const maxTrendVelocity = computed(() => {
  if (!statistics.value?.velocity_trend.length)
    return 150
  return Math.max(...statistics.value.velocity_trend.map(v => v.value)) + 5
})

const minTrendVelocity = computed(() => {
  if (!statistics.value?.velocity_trend.length)
    return 100
  return Math.min(...statistics.value.velocity_trend.map(v => v.value)) - 5
})

// 格式化日期
function formatDate(dateString: string | null) {
  if (!dateString)
    return '-'
  return new Date(dateString).toLocaleDateString('zh-TW', {
    month: '2-digit',
    day: '2-digit',
  })
}

// 載入資料
onMounted(async () => {
  await loadStatistics()
})
</script>

<template>
  <div class="flex flex-col h-full">
    <CommonPageHeader
      :title="statistics ? `#${statistics.player_number} ${statistics.player_name}` : '選手分析'"
      :description="statistics ? statistics.team_name : ''"
    >
      <template #actions>
        <UButton to="/analysis" variant="outline" color="neutral" icon="i-heroicons-arrow-left">
          返回列表
        </UButton>
      </template>
    </CommonPageHeader>

    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin text-primary-500" />
    </div>

    <template v-else-if="statistics">
      <!-- 總覽卡片 -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <UCard>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            訓練次數
          </p>
          <p class="text-2xl font-semibold text-neutral-900 dark:text-white">
            {{ statistics.training_count }}
          </p>
        </UCard>

        <UCard>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            總投球數
          </p>
          <p class="text-2xl font-semibold text-neutral-900 dark:text-white">
            {{ statistics.total_pitches }}
          </p>
        </UCard>

        <UCard>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            平均球速
          </p>
          <p class="text-2xl font-semibold text-neutral-900 dark:text-white">
            {{ statistics.avg_velocity ? `${statistics.avg_velocity} km/h` : '-' }}
          </p>
        </UCard>

        <UCard>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            好球率
          </p>
          <p class="text-2xl font-semibold text-neutral-900 dark:text-white">
            {{ statistics.strike_rate ? `${statistics.strike_rate}%` : '-' }}
          </p>
        </UCard>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- 球速趨勢 -->
        <UCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900 dark:text-white">
              球速趨勢
            </h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              最近訓練的平均球速變化
            </p>
          </template>

          <div v-if="statistics.velocity_trend.length > 0" class="h-48 flex items-end gap-2">
            <div
              v-for="(point, index) in statistics.velocity_trend"
              :key="index"
              class="flex-1 flex flex-col items-center"
            >
              <span class="text-xs text-neutral-900 dark:text-white mb-1">{{ Math.round(point.value * 10) / 10 }}</span>
              <div
                class="w-full bg-primary-500 rounded-t transition-all duration-300"
                :style="{
                  height: `${((point.value - minTrendVelocity) / (maxTrendVelocity - minTrendVelocity)) * 100}%`,
                }"
              />
              <span class="text-xs text-neutral-500 mt-1">{{ formatDate(point.date) }}</span>
            </div>
          </div>
          <div v-else class="h-48 flex items-center justify-center">
            <p class="text-neutral-500">
              尚無足夠資料
            </p>
          </div>
        </UCard>

        <!-- 投球熱區 -->
        <UCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900 dark:text-white">
              投球熱區分布
            </h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              好球帶 3x3 九宮格
            </p>
          </template>

          <div v-if="statistics.strike_zone_heatmap.length > 0" class="flex justify-center">
            <div class="grid grid-cols-3 gap-1 w-64">
              <template v-for="cell in statistics.strike_zone_heatmap" :key="`${cell.y}-${cell.x}`">
                <div
                  class="aspect-square flex flex-col items-center justify-center rounded-lg transition-colors" :class="[
                    getHeatmapColor(cell),
                  ]"
                >
                  <span class="text-lg font-semibold text-white">{{ cell.count }}</span>
                </div>
              </template>
            </div>
          </div>
          <div v-else class="flex justify-center items-center h-64">
            <p class="text-neutral-500">
              尚無足夠資料
            </p>
          </div>

          <template v-if="statistics.strike_zone_heatmap.length > 0" #footer>
            <div class="flex items-center justify-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
              <span class="flex items-center gap-1">
                <span class="w-3 h-3 rounded bg-success-500/60" />
                &lt;25 球
              </span>
              <span class="flex items-center gap-1">
                <span class="w-3 h-3 rounded bg-warning-500/60" />
                25-40 球
              </span>
              <span class="flex items-center gap-1">
                <span class="w-3 h-3 rounded bg-error-500/60" />
                ≥40 球
              </span>
            </div>
          </template>
        </UCard>
      </div>

      <!-- 最近訓練資訊 -->
      <UCard class="mt-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-neutral-900 dark:text-white">
              最近訓練
            </h3>
            <p v-if="statistics.last_training_date" class="text-sm text-neutral-500 dark:text-neutral-400">
              {{ new Date(statistics.last_training_date).toLocaleDateString('zh-TW') }}
            </p>
            <p v-else class="text-sm text-neutral-500 dark:text-neutral-400">
              尚無訓練紀錄
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              平均轉速
            </p>
            <p class="text-xl font-semibold text-neutral-900 dark:text-white">
              {{ statistics.avg_spin_rate ? `${statistics.avg_spin_rate} rpm` : '-' }}
            </p>
          </div>
        </div>
      </UCard>
    </template>
  </div>
</template>
