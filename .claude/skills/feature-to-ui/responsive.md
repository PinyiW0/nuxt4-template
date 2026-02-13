# 響應式設計（RWD）規範

> **必須遵循**：所有 UI 必須實作響應式設計

## 設計策略

根據 `ui-config.yaml` 的 `responsive.strategy`：

| 策略 | 說明 | 適用 |
|------|------|------|
| `desktop-first` | 先桌面，用 `max-lg:` 適配小螢幕 | 後台系統（預設） |
| `mobile-first` | 先手機，用 `sm:` 擴展 | 前台網站 |

---

## Layout 響應式

> 完整 Layout 範本 → 詳見 [phase-4-layout.md](phases/phase-4-layout.md)

```vue
<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar：lg 以上顯示 -->
    <aside class="hidden shrink-0 lg:flex lg:flex-col w-64">
      <!-- Sidebar 內容 -->
    </aside>

    <!-- Mobile Drawer -->
    <USlideover v-model:open="isMobileMenuOpen" side="left">
      <!-- 行動選單內容 -->
    </USlideover>

    <!-- Main Content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- ⚠️ Mobile Top Bar：in-flow，禁止 fixed/absolute -->
      <div class="flex h-14 shrink-0 items-center gap-3 border-b px-4 lg:hidden">
        <button @click="isMobileMenuOpen = true">
          <UIcon name="i-heroicons-bars-3" class="size-6" />
        </button>
        <span class="text-lg font-bold">網站名稱</span>
      </div>
      <main class="flex min-h-0 flex-1 flex-col overflow-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
```

---

## 表格響應式

### 方式一：隱藏次要欄位

```vue
<UTable :columns="columns">
  <template #createdAt-header>
    <span class="hidden sm:inline">建立時間</span>
  </template>
  <template #createdAt-cell="{ row }">
    <span class="hidden sm:table-cell">{{ formatDate(row.createdAt) }}</span>
  </template>
</UTable>
```

### 方式二：水平滾動

```vue
<div class="overflow-x-auto">
  <UTable :columns="columns" class="min-w-200" />
</div>
```

### 方式三：小螢幕改用卡片

```vue
<template>
  <!-- 桌面：表格 -->
  <UTable :data="items" class="hidden md:block" />

  <!-- 手機：卡片 -->
  <div class="space-y-3 md:hidden">
    <UCard v-for="item in items" :key="item.id">
      <div class="flex justify-between">
        <span>{{ item.name }}</span>
        <UBadge>{{ item.status }}</UBadge>
      </div>
    </UCard>
  </div>
</template>
```

---

## 表單響應式

```vue
<!-- 手機單欄，平板以上雙欄 -->
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
  <UFormField label="背號" name="number">
    <UInput v-model="state.number" class="w-full" />
  </UFormField>
  <UFormField label="身高" name="height">
    <UInput v-model="state.height" class="w-full" />
  </UFormField>
</div>
```

---

## Modal 響應式

```vue
<UModal
  v-model="isOpen"
  :ui="{
    width: 'w-full sm:max-w-md lg:max-w-lg',
  }"
>
  <!-- 內容 -->
</UModal>
```

---

## 按鈕響應式

```vue
<!-- 手機只顯示 icon -->
<UButton icon="i-heroicons-plus" color="primary">
  <span class="hidden sm:inline">新增球員</span>
</UButton>
```

---

## 文字響應式

```vue
<!-- 標題大小響應式 -->
<h1 class="text-xl font-bold sm:text-2xl lg:text-3xl">
  頁面標題
</h1>

<!-- 長文字截斷 -->
<span class="truncate max-w-50 sm:max-w-none">
  {{ longText }}
</span>
```

---

## 檢查清單

在產出 UI 時，確認以下項目：

- [ ] **Layout**：Sidebar 在 lg 以下隱藏，有漢堡選單
- [ ] **Header**：行動裝置上簡化顯示
- [ ] **表格**：隱藏次要欄位或水平滾動
- [ ] **表單**：多欄在 sm 以下改單欄
- [ ] **Modal**：響應式寬度
- [ ] **按鈕**：考慮 icon-only
- [ ] **文字**：響應式大小
- [ ] **間距**：響應式 padding（`p-4 sm:p-6 lg:p-8`）

---

## 禁止事項

| 禁止 | 正確做法 |
|------|----------|
| 固定寬度 `w-[500px]` | `w-full max-w-md` |
| 表格不處理小螢幕 | 隱藏欄位或滾動 |
| Modal 固定寬度 | `w-full sm:max-w-md` |
| 忽略行動裝置 | 實作響應式 |
| Sidebar 不可存取 | 提供漢堡選單 |

---

## 斷點參考

| 斷點 | 尺寸 | 裝置 |
|------|------|------|
| `sm` | 640px | 手機橫向 |
| `md` | 768px | 平板 |
| `lg` | 1024px | 小筆電 |
| `xl` | 1280px | 桌面 |
| `2xl` | 1536px | 大螢幕 |
