# 共用規則（跨 Phase 權威來源）

> 所有 Phase 共用的規則集中在此。各 phase 檔和 page-builder.md、components.md 引用此檔，不重複定義。
>
> **Phase Tag 說明**：每個段落標題標注 `[Px, Py]` 表示該段落適用的 Phase。
> 各 Phase 只需讀取標有自己編號的段落，以節省 context window。

---

## 配色策略 `[P2, P4, P5, P6]`

UI 配色以 **primary + neutral** 為主（佔 90%），語意色只用在狀態回饋（佔 10%）。

| 顏色 | 使用場景 |
|------|---------|
| `primary` | 按鈕 solid、連結、active 狀態、hover 強調、sidebar active |
| `neutral` | 背景、文字、邊框、分隔線、ghost 按鈕 |
| `success` | toast 成功、狀態 badge |
| `error` | toast 失敗、刪除按鈕、表單驗證錯誤 |
| `warning` | toast 警告、注意 badge |

```vue
<!-- ✅ 主要按鈕 primary，次要 neutral，刪除 error -->
<UButton color="primary">儲存</UButton>
<UButton color="neutral" variant="outline">取消</UButton>
<UButton color="error" @click="handleDelete">刪除</UButton>

<!-- ✅ hover 用 primary -->
<NuxtLink class="hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950 dark:hover:text-primary-400">
```

> 禁止用 `secondary`、`accent`、具體色名（`blue`、`purple`）做配色。

---

## 深淺模式與對比色 `[P2, P4, P5, P6]`

所有顏色必須使用響應式 Tailwind class，不可寫死單一模式。

### 常用顏色 class

| 用途 | Tailwind class |
|------|---------------|
| 主要文字 | `text-neutral-900 dark:text-white` |
| 次要文字 | `text-neutral-500 dark:text-neutral-400` |
| 頁面背景 | `bg-neutral-100 dark:bg-neutral-950` |
| 卡片/側欄背景 | `bg-white dark:bg-neutral-900` |
| 邊框 | `border-neutral-200 dark:border-neutral-800` |
| Primary 強調文字 | `text-primary-600 dark:text-primary-400` |
| Success 文字 | `text-success-600 dark:text-success-400` |
| Error 文字 | `text-error-600 dark:text-error-400` |

```vue
<!-- ❌ 固定 500 在某個模式下對比不足 -->
<span class="text-primary-500">文字</span>

<!-- ✅ 600/400 組合確保雙模式 WCAG AA -->
<span class="text-primary-600 dark:text-primary-400">文字</span>
```

> 例外：在 `bg-success-500` 等彩色背景上，可固定使用 `text-white`。

---

## Zod v4 規範 `[P6]`

```typescript
// ❌ Zod v3（禁止 required_error、invalid_type_error）
z.number({ required_error: '請輸入背號' })

// ✅ Zod v4：用 error 或 validator message
z.number({ error: '請輸入背號' })
z.string().min(1, '請輸入姓名')  // 推薦
```

---

## Nuxt UI 類型規範 `[P5, P6]`

### TableColumn

```typescript
import type { TableColumn } from '@nuxt/ui'
// ✅ v3+：accessorKey + header
const columns: TableColumn<MyItem>[] = [{ accessorKey: 'name', header: '名稱' }]
// ❌ v2：id + label
```

### UTable @select

```typescript
// ✅ 接收 (event, row) 兩個參數
function handleSelect(_e: Event, row: { original: MyItem }) { ... }
```

### UButton color 類型

```typescript
// ✅ 用 union type，不用 string
confirmColor?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
```

### UCheckbox @update:model-value

```typescript
// ✅ 參數必須包含 'indeterminate'
(val: boolean | 'indeterminate') => selection[row.index] = val === true
```

### USelect value 不可為空字串

Nuxt UI v3 的 `<USelect>` **禁止** `value: ''`。「全部/不篩選」用 `undefined` + `placeholder`：

```typescript
// ❌ { label: '全部球隊', value: '' }  → 報錯
// ✅
const selected = ref<string | undefined>(undefined)
```

```vue
<USelect v-model="selected" :items="options" value-key="value" placeholder="全部球隊" />
```

> API query 判斷：`...(selected.value ? { team_id: selected.value } : {})`

### FormSubmitEvent

```typescript
import type { FormSubmitEvent } from '@nuxt/ui'
async function onSubmit(event: FormSubmitEvent<MySchema>) { ... }
```

---

## 表單型別安全模式 `[P5, P6]`

### USelect options 不標窄型別

USelect 從 items 的 value 推斷 v-model 型別。窄型別會和 Zod 的 `string` 衝突。

```typescript
// ✅ 用 string[]
const positionOptions = ['投手', '捕手', '一壘手', '游擊手']
// ❌ 標 Position[] → 和 Zod 的 string 打架
```

> 窄型別（Position、Status）只用於 `types/api/` 定義，不用於表單 options。

### useFetch 陣列資料用 computed 標型別

```typescript
// ✅ 避免 template v-for 推斷為 unknown
const heatMapPoints = computed<HeatMapPoint[]>(() => analysis.value?.heat_map_data ?? [])
```

---

## API 規範 `[P6]`

實作頁面前，**必須先 `glob server/api/**/*.ts` 確認實際 API 路徑**。

| 規則 | 說明 |
|------|------|
| 禁止假設路徑 | 先確認檔案存在再呼叫 |
| 禁止 `globalThis.$fetch` | 用正確路徑，不繞過型別 |
| 禁止定義 local interface | 從 `~/types/api/` import |
| API 不存在 | 先建 API，不跳過 |

### 檔案結構 → 呼叫路徑

| 檔案 | 路徑 | 方法 |
|------|------|------|
| `server/api/teams/index.get.ts` | `/api/teams` | GET |
| `server/api/teams/[id].put.ts` | `/api/teams/${id}` | PUT |
| `server/api/ai/start.post.ts` | `/api/ai/start` | POST |

---

## Server API 類型規範 `[P1]`

```typescript
// event 必須標 H3Event
import type { H3Event } from 'h3'
export default defineEventHandler(async (event: H3Event) => { ... })

// noUncheckedIndexedAccess：陣列用 ! 斷言
const item = items[index]!
item.name = 'new'
```

### Mock API 回傳慣例 `[P1]`（穩定迭代核心規則）

> ⚠️ 此規則確保 `types/api/` ↔ `mock data` ↔ `API 回傳` ↔ `頁面消費` 四層永遠對齊。
> 不管全量模式或 sync 模式，都必須遵循。

**API 端點直接回傳 mock data，禁止手動 `.map()` 挑選欄位：**

```typescript
// ✅ 直接回傳（型別自動對齊 types/api/）
const paged = items.slice(start, start + pageSize)
return { status: 'success' as const, data: paged, meta: { total, page, page_size } }

// ❌ 禁止手動 map（容易和型別定義不一致，導致 TypeScript 報錯）
return { status: 'success' as const, data: paged.map(m => ({ id: m.id, ... })) }
```

**對齊鏈路：**
1. `types/api/*.ts` 定義型別（single source of truth）
2. `server/mock/data/*.ts` 的 mock 資料結構必須與型別一致
3. `server/api/**/*.ts` 直接回傳 mock data，不做欄位轉換
4. `app/pages/*.vue` import 型別後直接使用，無需 workaround

---

## 第三方元件必須手動 import `[P5, P6]`

Nuxt 不自動註冊第三方套件元件，必須手動 import：

```typescript
import Draggable from 'vuedraggable'
```

---

## Pinia Store 規範 `[P6]`

```typescript
// ❌ 依賴 auto-import → "useAuthStore is not defined"
const authStore = useAuthStore()

// ✅ 明確 import
import { useAuthStore } from '~/stores/auth'
const authStore = useAuthStore()

// ✅ 登入用 store 方法（狀態自動 persist），不直接 $fetch
await authStore.login(account, password)
```

---

## TypeCheck 規範 `[P6]`

頁面實作完成後，**必須執行 `npx nuxi typecheck`** 確認無型別錯誤。若有錯誤，修復後重新檢查。

---

## testid 規範 `[P3, P6]`

### 來源優先級

1. `docs/e2e-flows/pages/{page}.elements.md`（最高，權威定義）
2. 下方命名規則（elements.md 不存在時的備用）

### 命名格式：`{page}-{element}`

| 類型 | 範例 |
|------|------|
| 頁面容器 | `teams-page` |
| 輸入欄位 | `team-name` |
| 按鈕 | `team-create`, `team-save`, `team-edit`, `team-delete` |
| 列表 | `team-list` |
| 確認彈窗 | `confirm-modal`, `confirm-ok`, `confirm-cancel` |

> 確認彈窗 testid 以 `docs/e2e-flows/_common.flow.md` 為準。

---

## Layout 規範 `[P4]`

### Sidebar

1. **可收合**：展開 `w-64` / 收合 `w-16`，收合按鈕在 sidebar 內
2. **底部功能區**：會員名稱、登出、深淺切換，固定底部
3. **收合時**：`flex-col` + `UTooltip` 垂直排列
4. **配色**：hover 用 `primary`，不混語意色

### Mobile Top Bar

- **禁止** `fixed`/`absolute` 定位漢堡按鈕
- 使用 in-flow（`lg:hidden`）+ `shrink-0` + `border-b`
