<script setup lang="ts">
const colorMode = useColorMode()

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-950 px-4">
    <!-- Color Mode Toggle (top right) -->
    <div class="absolute right-4 top-4">
      <UButton
        :icon="colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'"
        variant="ghost"
        color="neutral"
        @click="toggleColorMode"
      />
    </div>

    <!-- Logo -->
    <div class="mb-8 flex flex-col items-center gap-2">
      <UIcon name="i-heroicons-eye" class="size-16 text-primary-500" />
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
        鷹眼偵測系統
      </h1>
      <p class="text-neutral-500 dark:text-neutral-400">
        智能訓練分析平台
      </p>
    </div>

    <!-- Auth Content -->
    <div class="w-full max-w-md">
      <slot />
    </div>

    <!-- Footer -->
    <div class="mt-8 text-center text-sm text-neutral-500">
      <p>&copy; 2026 鷹眼偵測系統. All rights reserved.</p>
    </div>
  </div>
</template>
