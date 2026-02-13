# Nuxt UI Page Builder 規範

> 配色、深淺模式、Nuxt UI 類型、API 規範、Pinia store 規範 → 詳見 [rules.md](rules.md)
>
> 色彩主題設定（app.config.ts、main.css）→ 詳見 [phase-2-theme.md](phases/phase-2-theme.md)

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
| `排序 XXX` / `調整順序` | vuedraggable（拖曳） | drag handle icon |
| `篩選 XXX` | USelect / USelectMenu | 篩選條件選項 |
| `批次刪除` / `批次操作` | UTable checkbox + 批次按鈕 | 全選/取消全選 |
| `上傳 XXX` | UInput type="file" / 拖放區 | 檔案格式提示 |
| `切換狀態` / `啟用/停用` | UToggle / USwitch | 狀態標籤文字 |
| `匯出 XXX` | UButton（下載觸發） | loading 狀態 |

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
| app.vue 缺少 UApp 或 NuxtLayout | Phase 4 建 Layout 後必須更新 app.vue |
| 自行定義網站名稱 | 從 `project.name` 讀取 |
| 寫死色彩值 | 從 `theme.colors` 讀取 |
| 寫死 Toast 時間 | 從 `toast.duration` 讀取 |
| 直接用 `color="blue"` | 用語意化 `color="primary"` |
| 查詢頁沒搜尋框 | 「查詢」必須有搜尋框 |
| `@theme` 不加 `static` | 必須 `@theme static` |
| UFormField 不預留錯誤訊息空間 | 加上 `class="relative mb-8"` 和 `:ui="{ error: 'absolute top-full left-0 mt-1' }"` |

> 完整禁止事項清單 → 詳見 [rules.md](rules.md)

---

## data-testid 命名規則

> testid 來源優先級與命名格式 → 詳見 [rules.md](rules.md) > testid 規範

### 從 Gherkin 推導

```gherkin
When 使用者以帳號 "coach1" 密碼 "pass123" 登入
```

→ `login-account`, `login-password`, `login-submit`

> **注意**：列表內的按鈕（如 `team-delete`）可以重複，E2E 測試時用 `first()`, `nth()`, 或 `hasText` 定位

---

## 表單範本

### 登入表單（含 Auth Store）

```vue
<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
// ⚠️ 重要：必須明確 import store，不可依賴 auto-import
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const schema = z.object({
  account: z.string().trim().min(1, '請輸入帳號'),
  password: z.string().min(1, '請輸入密碼'),
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  account: '',
  password: '',
})

const isSubmitting = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (isSubmitting.value) return  // 防止重複提交
  isSubmitting.value = true
  try {
    await authStore.login(event.data.account, event.data.password)
    toast.add({ title: '登入成功', color: 'success' })
    router.push('/')
  }
  catch (error: any) {
    const message = error?.data?.message || '帳號或密碼錯誤'
    toast.add({ title: '登入失敗', description: message, color: 'error' })
  }
  finally {
    isSubmitting.value = false
  }
}
</script>
```

### 一般表單

```vue
<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
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
  <UForm
    :schema="schema"
    :state="state"
    data-testid="login-form"
    class="space-y-4"
    @submit="onSubmit"
  >
    <UFormField
      label="帳號"
      name="account"
      class="relative mb-8"
      :ui="{ error: 'absolute top-full left-0 mt-1' }"
    >
      <UInput
        v-model="state.account"
        data-testid="login-account"
        class="w-full"
      />
    </UFormField>
    <UFormField
      label="密碼"
      name="password"
      class="relative mb-8"
      :ui="{ error: 'absolute top-full left-0 mt-1' }"
    >
      <UInput
        v-model="state.password"
        data-testid="login-password"
        type="password"
        class="w-full"
      />
    </UFormField>
    <UButton
      type="submit"
      data-testid="login-submit"
      :loading="loading"
    >
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
      data-testid="login-password"
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

## 技術注意事項

### Tailwind v4 !important

```
❌ 舊語法：[&_td]:!h-12
✅ 新語法：[&_td]:h-12!
```

### Icons 套件

```bash
npm i -D @iconify-json/heroicons @iconify-json/lucide
```
