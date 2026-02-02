# 元件規範

## 表單元件

### 寬度規則

所有表單元件必須使用滿版寬度：

```vue
<!-- 單一欄位：滿版 -->
<UFormField label="帳號" name="account">
  <UInput v-model="state.account" class="w-full" />
</UFormField>

<!-- 多欄並排：grid -->
<div class="grid grid-cols-2 gap-4">
  <UFormField label="背號" name="number">
    <UInput v-model="state.number" class="w-full" />
  </UFormField>
  <UFormField label="身高" name="height">
    <UInput v-model="state.height" class="w-full" />
  </UFormField>
</div>
```

### 錯誤訊息高度預留

```vue
<!-- 使用 min-h 預留空間 -->
<UFormField label="帳號" name="account" class="min-h-18">
  <UInput v-model="state.account" class="w-full" />
</UFormField>
```

### Input 值自動清除空白

```typescript
// 推薦：Zod schema 處理
const schema = z.object({
  account: z.string().trim().min(1, '請輸入帳號'),
})
```

---

## 列表頁面佈局

### 必備條件

| 規則 | 說明 |
|------|------|
| 每頁固定 10 筆 | 不提供筆數選擇器 |
| Pagination 右下角 | `justify-end` |
| 容器滿高 | `flex h-full flex-col` |
| Pagination 永遠顯示 | 即使只有一頁 |
| Mock 資料 ≥ 11 筆 | 確保分頁可測試 |

### 完整範本

```vue
<script setup lang="ts">
const currentPage = ref(1)
const pageSize = 10

const { data } = await useFetch<{
  data: { items: Item[], total: number }
}>('/api/items', {
  query: computed(() => ({
    page: currentPage.value,
    pageSize,
  })),
})

const items = computed(() => data.value?.data?.items || [])
const totalItems = computed(() => data.value?.data?.total || 0)
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- 標題 -->
    <div class="mb-6 flex shrink-0 items-center justify-between">
      <h1 class="text-2xl font-bold">
        列表標題
      </h1>
      <UButton icon="i-heroicons-plus">
        新增
      </UButton>
    </div>

    <!-- 列表卡片 -->
    <UCard class="min-h-0 flex-1" :ui="{ body: 'h-full flex flex-col p-0' }">
      <CommonListContainer
        v-model:page="currentPage"
        :total="totalItems"
        :page-size="pageSize"
      >
        <UTable
          :data="items"
          :columns="columns"
          class="[&_th]:h-10 [&_td]:h-12"
          :ui="{ tr: 'cursor-pointer hover:bg-elevated' }"
        />
      </CommonListContainer>
    </UCard>
  </div>
</template>
```

---

## 表格樣式

### 兩種設定方式

| 方式 | 適用場景 | 範例 |
|------|----------|------|
| `:ui` prop | cursor、hover | `tr: 'cursor-pointer'` |
| `class` | 固定高度 | `[&_th]:h-10` |

```vue
<UTable
  :data="items"
  :columns="columns"
  class="[&_th]:h-10 [&_td]:h-12"
  :ui="{ tr: 'cursor-pointer hover:bg-elevated' }"
/>
```

---

## CommonListContainer

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
    <div class="min-h-0 flex-1 overflow-hidden">
      <slot />
    </div>

    <!-- Pagination -->
    <div class="flex shrink-0 items-center justify-end border-t px-4 py-3">
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

---

## Layout 配合設定

```vue
<!-- app/layouts/default.vue -->
<template>
  <!-- h-screen + overflow-hidden -->
  <div class="flex h-screen overflow-hidden">
    <aside class="hidden lg:flex w-64">
      <!-- Sidebar -->
    </aside>
    <div class="flex flex-1 flex-col">
      <header class="h-16 shrink-0">
        <!-- Header -->
      </header>
      <!-- min-h-0 讓 flex-1 可縮小 -->
      <main class="flex min-h-0 flex-1 flex-col overflow-hidden p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
```

> ⚠️ **關鍵**：
> - 外層 `h-screen overflow-hidden`
> - main 必須有 `min-h-0`

---

## Hover 互動樣式

所有 hover 元素必須同時加上 `cursor-pointer` 和 `duration-300`：

```html
<!-- ✅ 正確 -->
<div class="cursor-pointer transition-colors duration-300 hover:bg-neutral-100">

<!-- ❌ 錯誤 -->
<div class="hover:bg-neutral-100">
```

---

## 刪除確認 Modal

```vue
<UModal v-model="deleteModalOpen">
  <template #header>
    <h3>確認刪除</h3>
  </template>
  <template #body>
    <p>此操作無法復原，確定要刪除嗎？</p>
  </template>
  <template #footer>
    <UButton color="neutral" @click="deleteModalOpen = false">
      取消
    </UButton>
    <UButton color="error" @click="confirmDelete">
      刪除
    </UButton>
  </template>
</UModal>
```

---

## 空狀態

```vue
<template v-if="!data?.length">
  <div class="flex flex-col items-center justify-center py-12">
    <UIcon name="i-heroicons-circle-stack" class="size-12 text-muted" />
    <p class="mt-2 text-muted">
      目前沒有資料
    </p>
  </div>
</template>
```

---

## 搜尋框

```vue
<UInput
  v-model="searchQuery"
  icon="i-heroicons-magnifying-glass"
  placeholder="搜尋..."
  class="w-64"
/>
```

---

## 拖曳排序

### 安裝

```bash
npm i vuedraggable@next
```

### 使用

```vue
<script setup>
import draggable from 'vuedraggable'
</script>

<template>
  <draggable
    v-model="items"
    item-key="id"
    handle=".drag-handle"
    ghost-class="opacity-50"
    @end="handleDragEnd"
  >
    <template #item="{ element }">
      <div class="flex items-center gap-3 p-3">
        <UIcon name="i-heroicons-bars-3" class="drag-handle cursor-grab" />
        <span>{{ element.name }}</span>
      </div>
    </template>
  </draggable>
</template>
```

---

## UCard UI Props

NuxtUI v4 只支援：

```vue
:ui="{
  root: 'class...',
  header: 'class...',
  body: 'class...',
  footer: 'class...',
}"

// ❌ 不支援，改用 class
:ui="{ ring: 'ring-0' }"  // → class="ring-0"
```
