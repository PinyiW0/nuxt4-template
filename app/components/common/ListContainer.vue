<script setup lang="ts">
interface Props {
  loading?: boolean
  empty?: boolean
  emptyIcon?: string
  emptyTitle?: string
  emptyDescription?: string
}

withDefaults(defineProps<Props>(), {
  loading: false,
  empty: false,
  emptyIcon: 'i-heroicons-circle-stack',
  emptyTitle: '目前沒有資料',
  emptyDescription: '',
})
</script>

<template>
  <UCard
    class="flex flex-1 flex-col min-h-0"
    :ui="{
      body: 'p-0 flex-1 overflow-auto min-h-0',
      footer: 'shrink-0 border-t border-neutral-800',
    }"
  >
    <!-- Header slot (搜尋、篩選等) -->
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>

    <!-- Loading State -->
    <div v-if="loading" class="flex h-64 items-center justify-center">
      <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin text-primary-500" />
    </div>

    <!-- Empty State -->
    <CommonEmptyState
      v-else-if="empty"
      :icon="emptyIcon"
      :title="emptyTitle"
      :description="emptyDescription"
    >
      <slot name="empty-action" />
    </CommonEmptyState>

    <!-- Content -->
    <template v-else>
      <slot />
    </template>

    <!-- Footer slot (pagination) -->
    <template v-if="$slots.footer && !loading && !empty" #footer>
      <slot name="footer" />
    </template>
  </UCard>
</template>
