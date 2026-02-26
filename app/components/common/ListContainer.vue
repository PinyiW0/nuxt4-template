<script setup lang="ts">
const props = withDefaults(defineProps<{
  total: number
  pageSize?: number
}>(), {
  pageSize: 10,
})

const page = defineModel<number>('page', { default: 1 })
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- 表格區 -->
    <div class="min-h-0 flex-1 overflow-auto">
      <slot />
    </div>

    <!-- Pagination：固定底部 -->
    <div class="flex shrink-0 items-center justify-end border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
      <UPagination
        v-model:page="page"
        :total="props.total"
        :items-per-page="props.pageSize"
        show-edges
      />
    </div>
  </div>
</template>
