<script setup lang="ts">
const { isAuthenticated, user } = useAuth()
const router = useRouter()

// 未登入則導向登入頁
watch(isAuthenticated, (value) => {
  if (!value) {
    router.push('/login')
  }
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col h-full">
    <CommonPageHeader
      title="儀表板"
      description="歡迎使用鷹眼偵測系統"
    />

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Quick Stats Cards -->
      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex size-12 items-center justify-center rounded-lg bg-primary-500/10">
            <UIcon name="i-heroicons-calendar" class="size-6 text-primary-500" />
          </div>
          <div>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              今日訓練
            </p>
            <p class="text-2xl font-semibold text-neutral-900 dark:text-white">
              3
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex size-12 items-center justify-center rounded-lg bg-secondary-500/10">
            <UIcon name="i-heroicons-user-group" class="size-6 text-secondary-500" />
          </div>
          <div>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              球隊數量
            </p>
            <p class="text-2xl font-semibold text-neutral-900 dark:text-white">
              2
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex size-12 items-center justify-center rounded-lg bg-accent-500/10">
            <UIcon name="i-heroicons-users" class="size-6 text-accent-500" />
          </div>
          <div>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              球員人數
            </p>
            <p class="text-2xl font-semibold text-neutral-900 dark:text-white">
              8
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex size-12 items-center justify-center rounded-lg bg-success-500/10">
            <UIcon name="i-heroicons-chart-bar" class="size-6 text-success-500" />
          </div>
          <div>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              總投球數
            </p>
            <p class="text-2xl font-semibold text-neutral-900 dark:text-white">
              1,250
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Welcome Message -->
    <UCard class="mt-6">
      <div class="text-center py-8">
        <UIcon name="i-heroicons-hand-raised" class="size-16 text-primary-500 mx-auto" />
        <h2 class="mt-4 text-xl font-semibold text-neutral-900 dark:text-white">
          歡迎回來，{{ user?.account }}
        </h2>
        <p class="mt-2 text-neutral-500 dark:text-neutral-400">
          您的角色是：{{ user?.role }}
        </p>
        <div class="mt-6 flex justify-center gap-4">
          <UButton to="/trainings" icon="i-heroicons-calendar">
            查看訓練
          </UButton>
          <UButton to="/teams" variant="outline" color="neutral" icon="i-heroicons-user-group">
            管理球隊
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>
