<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div class="mb-6 shrink-0">
    <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-semibold text-neutral-900 dark:text-white sm:text-2xl">
          {{ title }}
        </h1>
        <p v-if="description" class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {{ description }}
        </p>
      </div>
      <div class="mt-4 flex items-center gap-2 sm:mt-0">
        <slot name="actions" />
      </div>
    </div>
    <slot name="filters" />
  </div>
</template>
