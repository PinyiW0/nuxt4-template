# 共用規則（跨 Phase 權威來源）

> 所有 Phase 共用的規則集中在此。各 phase 檔和 page-builder.md、components.md 引用此檔，不重複定義。

---

## 配色策略

### 核心原則：Primary + Neutral

UI 配色以 **primary 主色**搭配 **neutral（黑白灰）**為主，語意色只用在狀態回饋。

| 層級 | 顏色 | 佔比 | 使用場景 |
|------|------|------|---------|
| 第一層 | `primary` | 90% | 按鈕 solid、連結、active 狀態、hover 強調、sidebar active |
| 第一層 | `neutral` | 90% | 背景、文字、邊框、分隔線、ghost 按鈕 |
| 第二層 | `success` | 10% | toast 成功、狀態 badge |
| 第二層 | `error` | 10% | toast 失敗、刪除按鈕、表單驗證錯誤 |
| 第二層 | `warning` | 10% | toast 警告、注意 badge |

### 正確與錯誤範例

```vue
<!-- ✅ hover 用 primary -->
<NuxtLink class="hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950 dark:hover:text-primary-400">

<!-- ❌ hover 用 secondary 或 accent -->
<NuxtLink class="hover:bg-purple-100 hover:text-purple-600">

<!-- ✅ 主要按鈕用 primary，次要用 neutral -->
<UButton color="primary">儲存</UButton>
<UButton color="neutral" variant="outline">取消</UButton>

<!-- ❌ 次要按鈕用 secondary -->
<UButton color="secondary" variant="outline">取消</UButton>

<!-- ✅ 語意色只用在回饋 -->
<UBadge color="success">啟用</UBadge>
<UButton color="error" @click="handleDelete">刪除</UButton>

<!-- ❌ 一般區塊用語意色做裝飾 -->
<div class="bg-success-50 border-success-200">一般內容</div>
```

---

## 深淺模式（Dark/Light Mode）

所有顏色都必須使用響應式 Tailwind class，不可寫死單一模式的顏色。

### 常用顏色對照表

| 用途 | 淺色模式 | 深色模式 | Tailwind class |
|------|---------|---------|---------------|
| 主要文字 | neutral-900 | white | `text-neutral-900 dark:text-white` |
| 次要文字 | neutral-500 | neutral-400 | `text-neutral-500 dark:text-neutral-400` |
| 頁面背景 | neutral-100 | neutral-950 | `bg-neutral-100 dark:bg-neutral-950` |
| 卡片/側欄背景 | white | neutral-900 | `bg-white dark:bg-neutral-900` |
| 邊框 | neutral-200 | neutral-800 | `border-neutral-200 dark:border-neutral-800` |

### 例外

在 `bg-success-500`、`bg-error-500` 等彩色背景上，可固定使用 `text-white`。

---

## 無障礙對比色（WCAG AA）

對比問題是**雙向的**：
- **Light mode**：亮色（cyan、yellow）在白色背景對比不足
- **Dark mode**：深色在深色背景對比不足

```vue
<!-- ❌ 固定 500 在某個模式下可能對比不足 -->
<span class="text-primary-500">文字</span>

<!-- ✅ light mode 用深色變體，dark mode 用淺色變體 -->
<span class="text-primary-600 dark:text-primary-400">文字</span>
```

### 常用對比安全組合

| 用途 | Tailwind class |
|------|---------------|
| Primary 文字 | `text-primary-600 dark:text-primary-400` |
| Success 文字 | `text-success-600 dark:text-success-400` |
| Error 文字 | `text-error-600 dark:text-error-400` |
| Warning 文字 | `text-warning-600 dark:text-warning-500` |

---

## Zod v4 規範

本專案使用 **Zod v4**（`zod@^4.x`），語法與 v3 不同。

```typescript
// ❌ Zod v3 語法（已移除）
z.number({ required_error: '請輸入背號' })
z.string({ required_error: '請輸入姓名' })

// ✅ Zod v4 語法：用 error 取代 required_error
z.number({ error: '請輸入背號' })
z.string({ error: '請輸入姓名' })

// ✅ 或直接用 validator message（推薦，更簡潔）
z.string().min(1, '請輸入姓名')
z.number().min(0, '背號必須為 0-999')
```

> ⚠️ **禁止使用 `required_error`、`invalid_type_error`**，這些是 Zod v3 專屬參數，v4 會產生型別錯誤。

---

## Nuxt UI 類型規範

### UTable @select 事件簽名

```typescript
// ✅ @select 接收 (event, row) 兩個參數
function handleSelectRow(_e: Event, row: { original: MyItem }) {
  router.push(`/items/${row.original.id}`)
}
```

### UButton color 類型

```typescript
// ✅ 使用明確的 union type
type ButtonColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
confirmColor?: ButtonColor

// ❌ 使用 string
confirmColor?: string
```

### TableColumn 類型

```typescript
import type { TableColumn } from '@nuxt/ui'

// ✅ v3+ 語法
const columns: TableColumn<MyItem>[] = [
  { accessorKey: 'name', header: '名稱' },
]

// ❌ v2 舊語法
const columns = [{ id: 'name', label: '名稱' }]
```

### UCheckbox @update:model-value 類型

```vue
<!-- ✅ 參數類型必須包含 'indeterminate' -->
<UCheckbox
  @update:model-value="(val: boolean | 'indeterminate') => rowSelection[row.index] = val === true"
/>

<!-- ❌ 只用 boolean 會導致 vue-tsc 類型錯誤 -->
<UCheckbox
  @update:model-value="(val: boolean) => rowSelection[row.index] = val"
/>
```

### FormSubmitEvent 類型

```typescript
import type { FormSubmitEvent } from '@nuxt/ui'

async function onSubmit(event: FormSubmitEvent<MySchema>) {
  await $fetch('/api/items', { method: 'POST', body: event.data })
}
```

---

## 表單型別安全模式

### USelect options 不標窄型別

USelect 會從 items 的 value 型別推斷 v-model 型別。若 value 是窄型別（union type），v-model 也要求窄型別，但 Zod 的 `z.string()` 只輸出 `string`，會產生型別衝突。

```typescript
// ✅ options 用 string[]，USelect 推斷 v-model 為 string，和 Zod 一致
const positionOptions = ['投手', '捕手', '一壘手', '游擊手']

// ❌ 標了 Position[]，USelect 推斷 v-model 為 Position，和 Zod 的 string 打架
const positionOptions: Position[] = ['投手', '捕手', '一壘手', '游擊手']
```

> Position、Status 等窄型別只用於 API 型別定義，不用於表單 options 宣告。

### useFetch 陣列資料用 computed 明確標型別

`useFetch` 回傳的巢狀陣列在 template 的 `v-for` 中可能被推斷為 `unknown`。用明確標型別的 `computed` 包一層避免此問題。

```typescript
import type { HeatMapPoint } from '~/types/api/analysis'

// ❌ 直接在 template 用 v-for="point in analysis.heat_map_data"，point 可能是 unknown
// ✅ 用 computed 明確標型別
const heatMapPoints = computed<HeatMapPoint[]>(() => analysis.value?.heat_map_data ?? [])
```

---

## API 規範

### 禁止自行假設 API 路徑

實作頁面前，**必須先確認實際存在的 API 端點**：

```bash
glob server/api/**/*.ts
```

| ❌ 錯誤 | ✅ 正確 |
|--------|--------|
| 假設 `/api/trainings/${id}/ai/start` | 先確認有 `server/api/ai/start.post.ts` → 呼叫 `/api/ai/start` |
| 使用 `globalThis.$fetch` 繞過類型 | 使用正確的 API 路徑 |
| API 不存在就繼續實作 | 先建立 API 或修正路徑 |

### API 命名慣例對照

| 檔案結構 | 實際呼叫路徑 | HTTP 方法 |
|---------|-------------|----------|
| `server/api/teams/index.get.ts` | `/api/teams` | GET |
| `server/api/teams/[id].put.ts` | `/api/teams/${id}` | PUT |
| `server/api/ai/start.post.ts` | `/api/ai/start` | POST |

### 禁止定義 local interface

```typescript
// ❌ 在頁面中自定義 interface
interface Team { id: number; name: string }

// ✅ 從 types/api/ import
import type { TeamItem } from '~/types/api/teams'
```

---

## Server API 類型規範

### event 必須標註 H3Event

```typescript
import type { H3Event } from 'h3'
export default defineEventHandler(async (event: H3Event) => { ... })
```

### noUncheckedIndexedAccess 陣列安全存取

```typescript
// ❌ arr[index].prop 報 'Object is possibly undefined'
items[index].name = 'new'

// ✅ 先 ! 斷言再操作
const item = items[index]!
item.name = 'new'
```

---

## 第三方元件必須手動 import

Nuxt 只會自動註冊 `components/` 目錄下的元件和 Nuxt UI 元件。第三方套件的元件**必須在 `<script setup>` 中手動 import**。

```typescript
// ❌ 不會被自動註冊，渲染時找不到元件
<Draggable v-model="items" />

// ✅ 手動 import
import Draggable from 'vuedraggable'
```

---

## Pinia Store 規範

### 必須明確 import

```typescript
// ❌ 依賴 auto-import，會導致 "useAuthStore is not defined"
const authStore = useAuthStore()

// ✅ 明確 import
import { useAuthStore } from '~/stores/auth'
const authStore = useAuthStore()
```

### 登入必須使用 authStore.login()

```typescript
// ❌ 直接呼叫 API，狀態不會保存
await $fetch('/api/auth/login', { ... })

// ✅ 使用 store 方法，狀態會自動 persist
await authStore.login(account, password)
```

---

## testid 規範

### 來源優先級

| 優先級 | 來源 | 說明 |
|--------|------|------|
| 1（最高） | `docs/e2e-flows/pages/{page}.elements.md` | testid 的權威定義 |
| 2 | page-builder.md 命名規則 | elements.md 不存在時的備用 |

### 命名格式

`{page}-{element}`

| 元素類型 | 命名範例 |
|---------|---------|
| 頁面容器 | `login-page`, `teams-page` |
| 表單 | `login-form`, `team-form` |
| 輸入欄位 | `login-account`, `team-name` |
| 送出按鈕 | `login-submit`, `team-save` |
| 列表容器 | `team-list`, `player-list` |
| 新增按鈕 | `team-create`, `player-create` |
| 編輯/刪除 | `team-edit`, `team-delete` |
| 確認彈窗容器 | `confirm-modal` |
| 確認彈窗按鈕 | `confirm-ok`, `confirm-cancel` |

> 確認彈窗 testid 以 `docs/e2e-flows/_common.flow.md` 為準，此處必須與其保持一致。

---

## Layout 規範

### Sidebar 必備功能

1. **可收合**：展開 `w-64` / 收合 `w-16`，收合按鈕在 sidebar 內
2. **底部功能區**：會員名稱、登出按鈕、深淺模式切換，固定在 sidebar 底部
3. **收合時底部垂直排列**：user icon + logout icon 用 `flex-col` + `UTooltip`
4. **配色**：hover 使用 `primary` 色，不混入其他語意色

### Mobile Top Bar

- **禁止** `fixed`/`absolute` 定位漢堡按鈕
- 使用 **in-flow Mobile Top Bar**（`lg:hidden`），包含漢堡按鈕 + 網站名稱
- 用 `shrink-0` + `border-b` 確保不被壓縮且有視覺分隔
