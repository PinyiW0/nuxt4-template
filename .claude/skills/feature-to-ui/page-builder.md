# Nuxt UI Page Builder 規範

## 前置作業（必須先執行）

### 1. 讀取並分類顏色

讀取 `ui-config.yaml` 中的 `theme.colors`：

| 類型 | 判斷方式 | 範例 |
|------|----------|------|
| Hex 色碼 | 以 `#` 開頭 | `"#FF359A"` |
| Tailwind 預設色 | 不以 `#` 開頭 | `"purple"`, `"green"` |

### 2. 處理 Hex 色碼

每個 Hex 色碼需在 `main.css` 定義完整色階：

```css
/* app/assets/css/main.css */
@import "tailwindcss";
@import "@nuxt/ui";

@theme static {
  --color-primary-50: #fff0f7;
  --color-primary-100: #ffe3f1;
  /* ... 50-950 完整色階 ... */
  --color-primary-950: #580024;
}
```

> ⚠️ **必須使用 `@theme static`**（注意 `static` 關鍵字）

色階產生：https://uicolors.app

### 3. 產生 app.config.ts

```typescript
// app/app.config.ts
export default defineAppConfig({
  ui: {
    colors: {
      // Hex → 使用顏色名稱
      primary: 'primary',
      // Tailwind 預設 → 直接使用
      secondary: 'indigo',
      success: 'green',
      warning: 'amber',
      error: 'red',
    },
    toast: {
      position: 'top-right', // 從 ui-config.yaml 讀取
    },
  },
})
```

---

## DSL Feature 解析

### 從 Background 提取資料結構

```gherkin
Background:
  Given 系統中有以下使用者：
    | account | password | role   |
    | admin   | pass123  | 管理者 |
```

→ TypeScript 型別：

```typescript
interface User {
  account: string
  password: string
  role: '管理者' | '教練'
}
```

### 從 When 提取表單欄位

```gherkin
When 使用者以帳號 "coach1" 密碼 "pass123" 登入
```

→ 表單欄位：`account`, `password`

### 從 Rule 提取驗證規則

| DSL Rule | Zod 驗證 |
|----------|----------|
| `背號範圍為 0-99` | `z.number().min(0).max(99)` |
| `必填欄位` | `z.string().min(1, '請輸入...')` |
| `帳號或密碼錯誤` | API 層驗證，前端顯示錯誤 |

### 從 Then 提取錯誤訊息

```gherkin
Then 操作失敗
And 系統顯示 "帳號或密碼錯誤"
```

→ Toast error 或 Alert

---

## Command 類型對應

| DSL Command | UI 元件 | 必要元素 |
|-------------|---------|----------|
| `登入` | 表單 + UButton | 密碼眼睛 icon |
| `建立 XXX` | 表單 + Modal | |
| `編輯 XXX` | 表單（預填） | |
| `刪除 XXX` | 確認 Modal | |
| `查詢 XXX 列表` | UTable | **必須有搜尋框** |

> **重要**：「查詢」關鍵字 → UI **必須**包含搜尋框

---

## 操作結果對應

| DSL Then | UI 處理 |
|----------|---------|
| `操作成功` | Toast success + 導向 |
| `操作失敗` | Toast error |
| `系統顯示 "..."` | 顯示錯誤訊息 |
| `系統回傳 ...` | 儲存到 state |

---

## 禁止事項

| 禁止 | 正確做法 |
|------|----------|
| 自行定義網站名稱 | 從 `project.name` 讀取 |
| 寫死色彩值 | 從 `theme.colors` 讀取 |
| 寫死 Toast 時間 | 從 `toast.duration` 讀取 |
| 直接用 `color="blue"` | 用語意化 `color="primary"` |
| 查詢頁沒搜尋框 | 「查詢」必須有搜尋框 |
| `@theme` 不加 `static` | 必須 `@theme static` |
| 使用 `text-white` 固定白色 | 使用 `text-neutral-900 dark:text-white` |
| 使用 `bg-neutral-900` 固定深色背景 | 使用 `bg-white dark:bg-neutral-900` |
| UFormField 不預留錯誤訊息空間 | 加上 `class="relative mb-8"` 和 `:ui="{ error: 'absolute top-full left-0 mt-1' }"` |

---

## 表單範本

```vue
<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { z } from 'zod'

const schema = z.object({
  account: z.string().trim().min(1, '請輸入帳號'),
  password: z.string().min(1, '請輸入密碼'),
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  account: '',
  password: '',
})

const loading = ref(false)
const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: event.data,
    })
    toast.add({ title: '登入成功', color: 'success' })
    await navigateTo('/')
  }
  catch (error: any) {
    const message = error?.data?.message || '操作失敗'
    toast.add({ title: '登入失敗', description: message, color: 'error' })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField
      label="帳號"
      name="account"
      class="relative mb-8"
      :ui="{ error: 'absolute top-full left-0 mt-1' }"
    >
      <UInput v-model="state.account" class="w-full" />
    </UFormField>
    <UFormField
      label="密碼"
      name="password"
      class="relative mb-8"
      :ui="{ error: 'absolute top-full left-0 mt-1' }"
    >
      <UInput v-model="state.password" type="password" class="w-full" />
    </UFormField>
    <UButton type="submit" :loading="loading">
      登入
    </UButton>
  </UForm>
</template>
```

---

## 密碼欄位範本

```vue
<script setup>
const showPassword = ref(false)
</script>

<template>
  <UFormField
    label="密碼"
    name="password"
    class="relative mb-8"
    :ui="{ error: 'absolute top-full left-0 mt-1' }"
  >
    <UInput
      v-model="state.password"
      :type="showPassword ? 'text' : 'password'"
      class="w-full"
    >
      <template #trailing>
        <UButton
          :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
          color="neutral"
          variant="link"
          size="sm"
          :padded="false"
          @click="showPassword = !showPassword"
        />
      </template>
    </UInput>
  </UFormField>
</template>
```

---

## 深淺模式（Dark/Light Mode）規範

所有 UI 必須同時支援深色和淺色模式，使用響應式 Tailwind class：

### 文字顏色

```vue
<!-- ❌ 錯誤：只在深色模式可見 -->
<h1 class="text-white">標題</h1>

<!-- ✅ 正確：深淺模式都可見 -->
<h1 class="text-neutral-900 dark:text-white">標題</h1>

<!-- 次要文字 -->
<p class="text-neutral-500 dark:text-neutral-400">描述</p>
```

### 背景顏色

```vue
<!-- ❌ 錯誤：只適合深色模式 -->
<div class="bg-neutral-900">...</div>

<!-- ✅ 正確：響應式背景 -->
<div class="bg-white dark:bg-neutral-900">...</div>
<div class="bg-neutral-100 dark:bg-neutral-800">...</div>
```

### 邊框顏色

```vue
<!-- ❌ 錯誤 -->
<div class="border border-neutral-800">...</div>

<!-- ✅ 正確 -->
<div class="border border-neutral-200 dark:border-neutral-800">...</div>
```

### 例外：彩色背景上的文字

在 `bg-success-500`、`bg-error-500`、`bg-primary-500` 等彩色背景上，可以固定使用 `text-white`，因為這些背景在深淺模式下都是深色。

---

## 技術注意事項

### Server 端 Import

```typescript
// ❌ 錯誤
import { mockUsers } from '~/server/mock/data/users'

// ✅ 正確
import { mockUsers } from '../../mock/data/users'
```

### Pinia Store + Persist

```typescript
// ❌ 錯誤：persist 無法恢復 readonly
return { accessToken: readonly(accessToken) }

// ✅ 正確
return { accessToken }
```

### Tailwind v4 !important

```
❌ 舊語法：[&_td]:!h-12
✅ 新語法：[&_td]:h-12!
```

### Icons 套件

```bash
npm i -D @iconify-json/heroicons @iconify-json/lucide
```
