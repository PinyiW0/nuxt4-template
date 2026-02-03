<script setup lang="ts">
interface Props {
  icon?: string
  title?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'i-heroicons-circle-stack',
  title: '目前沒有資料',
  description: '',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="flex size-16 items-center justify-center rounded-full bg-neutral-800">
      <UIcon :name="icon" class="size-8 text-neutral-400" />
    </div>
    <h3 class="mt-4 text-lg font-medium text-neutral-300">
      {{ title }}
    </h3>
    <p v-if="description" class="mt-1 text-sm text-neutral-500">
      {{ description }}
    </p>
    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>
