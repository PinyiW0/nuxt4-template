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
const pitchId = computed(() => Number(route.params.pitchId))

// 狀態
interface PitchDetail {
  id: number
  training_id: number
  sequence: number
  time: string
  velocity: number
  spin_rate: number
  is_strike: boolean
  location_x: number
  location_y: number
  trajectory_data: Record<string, unknown>
}

interface TrainingInfo {
  strike_zone_top: number
  strike_zone_bottom: number
  player_name: string
}

const pitch = ref<PitchDetail | null>(null)
const trainingInfo = ref<TrainingInfo | null>(null)
const isLoading = ref(false)
const activeTab = ref('grid')

// 載入投球資料
async function fetchPitchDetail() {
  isLoading.value = true
  try {
    const [pitchResponse, trainingResponse] = await Promise.all([
      $fetch(`/api/trainings/${trainingId.value}/pitches/${pitchId.value}`, {
        query: {
          user: userAccount.value,
          role: userRole.value,
        },
      }),
      $fetch(`/api/trainings/${trainingId.value}`, {
        query: {
          user: userAccount.value,
          role: userRole.value,
        },
      }),
    ])

    if (pitchResponse.status === 'success') {
      pitch.value = pitchResponse.data as PitchDetail
    }
    if (trainingResponse.status === 'success') {
      const data = trainingResponse.data as TrainingInfo & Record<string, unknown>
      trainingInfo.value = {
        strike_zone_top: data.strike_zone_top,
        strike_zone_bottom: data.strike_zone_bottom,
        player_name: data.player_name,
      }
    }
  }
  catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: '載入失敗',
      description: err.data?.message || '無法載入投球資料',
      color: 'error',
    })
    router.push(`/trainings/${trainingId.value}`)
  }
  finally {
    isLoading.value = false
  }
}

// 格式化時間
function formatTime(timeString: string) {
  return new Date(timeString).toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// 計算落點在九宮格中的位置（百分比）
function getLocationStyle() {
  if (!pitch.value)
    return {}
  // location_x: -0.4 ~ 0.4 映射到 0% ~ 100%
  // location_y: 0.3 ~ 1.2 映射到 100% ~ 0%（y軸反向）
  const x = ((pitch.value.location_x + 0.4) / 0.8) * 100
  const y = ((1.2 - pitch.value.location_y) / 0.9) * 100
  return {
    left: `${Math.max(0, Math.min(100, x))}%`,
    top: `${Math.max(0, Math.min(100, y))}%`,
  }
}

// Tab 選項
const tabs = [
  { label: '九宮格', value: 'grid', icon: 'i-heroicons-squares-2x2' },
  { label: '3D 軌跡', value: '3d', icon: 'i-heroicons-cube' },
]

// 載入資料
onMounted(async () => {
  await fetchPitchDetail()
})
</script>

<template>
  <div class="flex flex-col h-full">
    <CommonPageHeader
      :title="pitch ? `第 ${pitch.sequence} 球` : '單球儀表板'"
      :description="trainingInfo ? trainingInfo.player_name : ''"
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

    <template v-else-if="pitch && trainingInfo">
      <!-- 投球資訊卡片 -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <UCard>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            球速
          </p>
          <p class="text-2xl font-semibold text-neutral-900 dark:text-white">
            {{ pitch.velocity }} km/h
          </p>
        </UCard>

        <UCard>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            轉速
          </p>
          <p class="text-2xl font-semibold text-neutral-900 dark:text-white">
            {{ pitch.spin_rate }} rpm
          </p>
        </UCard>

        <UCard>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            好壞球
          </p>
          <UBadge
            :color="pitch.is_strike ? 'success' : 'error'"
            variant="subtle"
            class="text-lg"
          >
            {{ pitch.is_strike ? '好球' : '壞球' }}
          </UBadge>
        </UCard>

        <UCard>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            投球時間
          </p>
          <p class="text-xl font-semibold text-neutral-900 dark:text-white">
            {{ formatTime(pitch.time) }}
          </p>
        </UCard>
      </div>

      <!-- Tab 切換 -->
      <div class="mb-4">
        <div class="flex gap-2">
          <UButton
            v-for="tab in tabs"
            :key="tab.value"
            :icon="tab.icon"
            :variant="activeTab === tab.value ? 'solid' : 'outline'"
            :color="activeTab === tab.value ? 'primary' : 'neutral'"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </UButton>
        </div>
      </div>

      <!-- 九宮格視圖 -->
      <UCard v-if="activeTab === 'grid'">
        <template #header>
          <h3 class="font-semibold text-neutral-900 dark:text-white">
            九宮格視圖
          </h3>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            好球帶：上緣 {{ trainingInfo.strike_zone_top }} cm / 下緣 {{ trainingInfo.strike_zone_bottom }} cm
          </p>
        </template>

        <div class="flex justify-center">
          <!-- 九宮格容器 -->
          <div class="relative w-72 h-96 border-2 border-neutral-600 bg-neutral-100 dark:bg-neutral-800/50">
            <!-- 九宮格線 -->
            <div class="absolute inset-0 grid grid-cols-3 grid-rows-3">
              <div v-for="i in 9" :key="i" class="border border-neutral-700" />
            </div>

            <!-- 落點標記 -->
            <div
              class="absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center shadow-lg"
              :class="pitch.is_strike ? 'bg-success-500' : 'bg-error-500'"
              :style="getLocationStyle()"
            >
              <span class="text-xs font-bold text-white">{{ pitch.sequence }}</span>
            </div>

            <!-- 球速標註 -->
            <div
              class="absolute text-xs font-medium px-1 py-0.5 rounded"
              :class="pitch.is_strike ? 'bg-success-500/80 text-white' : 'bg-error-500/80 text-white'"
              :style="{
                left: getLocationStyle().left,
                top: `calc(${getLocationStyle().top} + 20px)`,
                transform: 'translateX(-50%)',
              }"
            >
              {{ pitch.velocity }} km/h
            </div>

            <!-- 好球帶標示 -->
            <div class="absolute -left-16 top-0 h-full flex flex-col justify-between text-xs text-neutral-500">
              <span>{{ trainingInfo.strike_zone_top }} cm</span>
              <span>{{ trainingInfo.strike_zone_bottom }} cm</span>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex items-center justify-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
            <span class="flex items-center gap-1">
              <span class="w-3 h-3 rounded-full bg-success-500" />
              好球
            </span>
            <span class="flex items-center gap-1">
              <span class="w-3 h-3 rounded-full bg-error-500" />
              壞球
            </span>
          </div>
        </template>
      </UCard>

      <!-- 3D 軌跡視圖 -->
      <UCard v-else-if="activeTab === '3d'">
        <template #header>
          <h3 class="font-semibold text-neutral-900 dark:text-white">
            3D 入壘軌跡
          </h3>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            投球軌跡視覺化
          </p>
        </template>

        <div class="flex justify-center items-center h-96 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg">
          <!-- 簡化的 3D 軌跡示意圖 -->
          <div class="relative w-full max-w-md h-full p-8">
            <!-- 投手位置 -->
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
              <div class="w-4 h-4 rounded-full bg-primary-500 mx-auto" />
              <span class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">投手</span>
            </div>

            <!-- 本壘位置（好球帶框線） -->
            <div class="absolute top-8 left-1/2 -translate-x-1/2">
              <div class="w-24 h-32 border-2 border-neutral-500 relative">
                <!-- 落點 -->
                <div
                  class="absolute w-4 h-4 -ml-2 -mt-2 rounded-full"
                  :class="pitch.is_strike ? 'bg-success-500' : 'bg-error-500'"
                  :style="{
                    left: `${((pitch.location_x + 0.4) / 0.8) * 100}%`,
                    top: `${((1.2 - pitch.location_y) / 0.9) * 100}%`,
                  }"
                />
              </div>
              <span class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 block text-center">本壘</span>
            </div>

            <!-- 軌跡線 -->
            <svg class="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                :d="`M 50 95 Q ${50 + pitch.location_x * 50} 50, ${50 + (pitch.location_x + 0.4) / 0.8 * 24 - 12 + 50} 15`"
                fill="none"
                :stroke="pitch.is_strike ? '#22c55e' : '#ef4444'"
                stroke-width="0.5"
                stroke-dasharray="2,2"
              />
            </svg>

            <!-- 軌跡數據 -->
            <div class="absolute bottom-20 right-4 text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
              <p>釋放點：({{ (pitch.trajectory_data?.release_point as { x?: number, y?: number } | undefined)?.x?.toFixed(2) || 0 }}, {{ (pitch.trajectory_data?.release_point as { x?: number, y?: number } | undefined)?.y?.toFixed(2) || 0 }})</p>
              <p>進壘點：({{ pitch.location_x.toFixed(2) }}, {{ pitch.location_y.toFixed(2) }})</p>
            </div>
          </div>
        </div>

        <template #footer>
          <p class="text-xs text-neutral-500 text-center">
            此為簡化示意圖，實際 3D 視覺化需整合 Three.js 或其他 3D 函式庫
          </p>
        </template>
      </UCard>

      <!-- 落點座標 -->
      <UCard class="mt-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-neutral-900 dark:text-white">
              落點座標
            </h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              X: {{ pitch.location_x.toFixed(3) }} / Y: {{ pitch.location_y.toFixed(3) }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              投球序號
            </p>
            <p class="text-xl font-semibold text-neutral-900 dark:text-white">
              #{{ pitch.sequence }}
            </p>
          </div>
        </div>
      </UCard>
    </template>
  </div>
</template>
