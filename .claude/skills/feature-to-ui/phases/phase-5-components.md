# Phase 5: 共用元件（元件原始碼）

> **本檔用途**：Phase 5 建置元件時的原始碼範本。
> **使用方式與規則**（Phase 6 參考）→ 詳見 [components.md](../components.md)

## 必讀規範

```
必須讀取：
- ui-config.yaml > table（表格設定）
- ui-config.yaml > delete.confirmation（刪除確認）
- ui-config.yaml > colorMode（深淺模式）
- components.md（元件使用規範）
- rules.md > Nuxt UI 類型規範

執行 /nuxt-ui 載入組件文檔（若尚未載入）
```

## 執行步驟

1. **建立 ListContainer.vue**
2. **建立 ConfirmModal.vue**
3. **建立 PageHeader.vue**
4. **建立 EmptyState.vue**
5. **詢問用戶確認**

## 輸出結構

```
app/components/common/
├── ListContainer.vue    # 列表頁面容器（含 pagination）
├── ConfirmModal.vue     # 確認對話框
├── PageHeader.vue       # 頁面標題區
└── EmptyState.vue       # 空狀態顯示
```

## ListContainer.vue

```vue
<!-- app/components/common/ListContainer.vue -->
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
        :total="total"
        :items-per-page="pageSize"
        show-edges
      />
    </div>
  </div>
</template>
```

## ConfirmModal.vue

```vue
<!-- app/components/common/ConfirmModal.vue -->
<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  description?: string
  confirmLabel?: string
  confirmColor?: string
  loading?: boolean
}>(), {
  title: '確認操作',
  description: '確定要執行此操作嗎？',
  confirmLabel: '確認',
  confirmColor: 'primary',
  loading: false,
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const isOpen = defineModel<boolean>('open', { default: false })
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div data-testid="modal" class="p-6">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
          {{ title }}
        </h3>
        <p class="mt-2 text-neutral-500 dark:text-neutral-400">
          {{ description }}
        </p>
        <div class="mt-6 flex justify-end gap-3">
          <UButton
            data-testid="modal-cancel"
            color="neutral"
            variant="outline"
            :disabled="loading"
            @click="emit('cancel'); isOpen = false"
          >
            取消
          </UButton>
          <UButton
            data-testid="modal-confirm"
            :color="confirmColor"
            :loading="loading"
            @click="emit('confirm')"
          >
            {{ confirmLabel }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
```

## PageHeader.vue

```vue
<!-- app/components/common/PageHeader.vue -->
<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="mb-6 shrink-0">
    <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
      {{ title }}
    </h1>
    <p v-if="description" class="mt-1 text-neutral-500 dark:text-neutral-400">
      {{ description }}
    </p>
  </div>
</template>
```

## EmptyState.vue

```vue
<!-- app/components/common/EmptyState.vue -->
<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  title?: string
  description?: string
}>(), {
  icon: 'i-heroicons-circle-stack',
  title: '目前沒有資料',
  description: '',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12">
    <UIcon :name="icon" class="size-12 text-neutral-400" />
    <p class="mt-2 text-neutral-500 dark:text-neutral-400">
      {{ title }}
    </p>
    <p v-if="description" class="mt-1 text-sm text-neutral-400">
      {{ description }}
    </p>
  </div>
</template>
```
