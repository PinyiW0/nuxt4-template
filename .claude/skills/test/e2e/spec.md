# E2E Spec 生成（Phase: e2e spec）

## 目標

將 `.flow.md` 操作流程轉換為 Playwright `.spec.ts` 測試檔案，**以實際實作（mock data + Vue 頁面）為準**。

---

## 輸入 / 輸出

### 輸入

```
必讀（結構來源）：
1. docs/e2e-flows/{NN}-{name}.flow.md  — 操作流程文件（測試結構）
2. docs/e2e-flows/_common.flow.md      — 共用步驟
3. test/e2e/helpers/actions.ts         — 共用操作（login 等）
4. test/e2e/helpers/fixtures.ts        — 測試資料

必讀（實作比對）：
5. server/mock/data/*.ts               — 實際 mock 資料（團隊名、球員名、日期、數值等）
6. app/pages/{相關頁面}.vue             — 實際 testid、toast 文字、表單互動流程
7. server/api/{相關 API}.ts            — 實際錯誤訊息（createError 的 message）
```

### 輸出

```
1. test/e2e/specs/{NN}-{name}.spec.ts  — Playwright 測試檔案
2. test/e2e/helpers/fixtures.ts        — 更新（如有新路由/帳號）
```

---

## 核心原則

1. **一個 `.flow.md` 對應一個 `.spec.ts`**
2. **不使用 quickpickle / Gherkin**：直接生成 Playwright `test.describe` / `test` 結構
3. **共用操作從 helpers import**：login / selectOption / confirmDelete 不在 spec 內定義
4. **testid 以 Vue 頁面實際值為準**：若 `.flow.md` 的 testid 與 Vue 頁面不同，**以 Vue 頁面為準**
5. **每個 spec 獨立可執行**：透過 `test.beforeEach` reset mock data，不依賴其他 spec 的執行順序
6. **⚠️ 資料值以 mock data 為準**：`.flow.md` 中的球隊名、球員名、日期、數值等可能是假設值，**必須替換為 `server/mock/data/*.ts` 中的實際值**

---

## 執行步驟

### Step 1：讀取 .flow.md

解析 `.flow.md` 結構：

```
├── 頁面資訊（名稱、路由）
├── 元素定義表
├── 共用前置條件
└── 規則[]
    └── 情境[]
        ├── 跳過？（⏭️ 整個情境跳過）
        ├── 前置條件[]
        ├── 操作步驟[]
        └── 預期結果[]
```

### Step 2：交叉比對實作（⚠️ 關鍵步驟）

在生成 spec 之前，**必須讀取實際實作**來校正 `.flow.md` 中的假設值。

#### 2a. 掃描 mock data

讀取 `server/mock/data/*.ts`，提取：

| 資料類型 | 檔案 | 提取內容 |
|---------|------|---------|
| 使用者 | `users.ts` | 帳號、密碼、角色 |
| 球隊 | `teams.ts` | id、name、created_by、status |
| 球員 | `players.ts` | id、name、number、team_id、position、status |
| 訓練 | `trainings.ts` | id、date、player_id、team_id、ai_status、created_by |
| 投球 | `pitches.ts` | training_id、velocity、spin_rate、is_strike 等 |

**建立對應關係表**：
- coach1 建立的球隊有哪些？名稱是什麼？
- coach1 球隊的球員有哪些？背號是什麼？
- 今天日期之後（未來）的訓練有哪些？
- 訓練 N 有幾筆投球？好球率多少？

#### 2b. 掃描 Vue 頁面

讀取 `.flow.md` 涉及的 Vue 頁面，提取：

```bash
# 提取 testid
grep 'data-testid' app/pages/{相關頁面}.vue

# 提取 toast 文字
grep "toast.add" app/pages/{相關頁面}.vue

# 提取 select option 格式（label 可能含格式化）
grep -A5 "Options\|options\|items" app/pages/{相關頁面}.vue

# 提取表單必填欄位和條件顯示（v-if）
grep "v-if\|v-show\|UFormField" app/pages/{相關頁面}.vue
```

#### 2c. 掃描 API 錯誤訊息

讀取相關 API handler，提取 `createError` 的 message：

```bash
grep "createError" server/api/{相關路徑}/*.ts
```

#### 2d. 產出校正表

對比 `.flow.md` 與實際實作，列出所有差異：

```
⚠️ 校正表：
- flow 球隊名 "紅龍隊" → 實際 mock: "金龍隊"（coach1 建立的）
- flow testid "training-page" → 實際 Vue: "training-detail-page"
- flow toast "操作成功" → 實際 Vue: "球隊已新增"
- flow 球速 "128.3" → 實際 mock pitches: 128.5（training 1, pitch 2）
- flow 缺少步驟：新增球員時需先 selectOption 選球隊
- flow 錯誤訊息 "該背號已被使用" → 實際 API: "該球隊已有此背號"
```

### Step 3：更新 fixtures.ts

若 `.flow.md` 涉及新的路由或測試帳號，更新 `fixtures.ts`。

### Step 4：生成 .spec.ts（使用校正後的值）

---

## .spec.ts 結構

```typescript
import { expect, test } from '@playwright/test'
import { confirmDelete, login, selectOption } from '../helpers'

// Mock data reset：確保每個 spec 從乾淨狀態開始
test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：{Rule 名稱}', () => {
  test('{Example 名稱}', async ({ page }) => {
    // Given：{前置條件原文}
    await login(page, 'coach1', 'pass123')
    await page.goto('/teams', { waitUntil: 'networkidle' })

    // When：{操作步驟原文}
    // ...

    // Then：{預期結果原文}
    // ...
  })

  test.skip('{跳過的 Example 名稱}', async () => {
    // 跳過：{原因}
  })
})
```

### 必遵守規則（⚠️ 違反任一條都會產生有問題的 spec）

1. **`login` / `selectOption` / `confirmDelete` 從 helpers import**，**禁止**在 spec 內重複定義
2. **`page.goto()` 必須加 `{ waitUntil: 'networkidle' }`**（Nuxt SSR hydration）
3. **Toast 斷言用 `{ exact: true }`**，**禁止 regex**
4. **`test.skip` callback 用 `async () =>`**，**禁止** `async ({ page }) =>`
5. **`test.beforeEach` 必須呼叫 mock data reset**
6. **確認彈窗統一用 `confirmDelete(page)`**，**禁止** `getByText('確定要刪除')` + `getByRole('button')` 模式
7. **列表行定位用 `tbody tr`**：`locator('tbody tr', { hasText: '...' })`（避免 UTable header 干擾）
8. **⚠️ flow 中的資料值不可直接使用**：球隊名、球員名、日期、球速等必須替換為 mock data 實際值
9. **⚠️ flow 中的 testid 不可直接使用**：必須與 Vue 頁面的 `data-testid` 比對，以 Vue 為準
10. **⚠️ toast 文字不可猜測**：必須從 Vue 頁面的 `toast.add({ title: '...' })` 取得實際文字
11. **⚠️ API 錯誤訊息不可猜測**：必須從 `server/api/` 的 `createError({ message: '...' })` 取得實際文字
12. **⚠️ 防止 strict mode violation**：若同一文字可能同時出現在 toast 和頁面其他位置（如 Badge），使用 `page.getByRole('alert').getByText('...')` 定位 toast

---

## Flow → Playwright 轉換規則

### 操作動詞轉換

| Flow 動詞 | Playwright 程式碼 |
|-----------|------------------|
| `前往{頁面} → /path` | `await page.goto('/path', { waitUntil: 'networkidle' })` |
| `點擊「{元素}」→ #id` | `await page.getByTestId('id').click()` |
| `輸入 {value} → #id` | `await page.getByTestId('id').fill('value')` |
| `清空並輸入 {value} → #id` | `await page.getByTestId('id').clear()` + `.fill('value')` |
| `勾選「{描述}」→ #id` | 見「批次勾選」 |
| `取消勾選「{描述}」→ #id` | 見「批次勾選」 |
| `等待{描述}出現 → #id` | `await expect(page.getByTestId('id')).toBeVisible()` |
| `等待跳轉到{頁面} → /path` | `await page.waitForURL('**/path')` |

### 驗證詞轉換（與 SPEC.md 固定 8 個驗證詞對應）

| Flow 驗證詞 | Playwright 程式碼 |
|------------|------------------|
| `→ 顯示成功提示「{text}」` | `await expect(page.getByText('text', { exact: true })).toBeVisible()` |
| `→ 顯示成功提示` | ⚠️ **禁止猜測**，必須從 Vue 頁面的 `toast.add` 取得實際文字 |
| `→ 顯示錯誤提示「{text}」` | `await expect(page.getByText('text', { exact: true })).toBeVisible()` |
| `→ 顯示錯誤提示` | ⚠️ **禁止猜測**，必須從 API 的 `createError` 取得實際文字 |
| `→ 文字「{text}」可見` | `await expect(page.getByText('text')).toBeVisible()` |
| `→ 文字「{text}」不可見` | `await expect(page.getByText('text')).not.toBeVisible()` |
| `→ #{id} 包含「{text}」` | `await expect(page.getByTestId('id')).toContainText('text')` |
| `→ #{id} 不包含「{text}」` | `await expect(page.getByTestId('id')).not.toContainText('text')` |
| `→ #{id} 中「{rowText}」那列包含「{text}」` | 見下方「行內驗證」 |
| `→ 跳轉到 {path}` | `await expect(page).toHaveURL('**/path')` |
| `→ 前往 {path}，#{id} 不包含「{text}」` | 見下方「跨頁驗證」 |
| `→ 前往 {path}，#{id} 包含「{text}」` | 見下方「跨頁驗證」 |
| `→ 前往 {path}，文字「{text}」可見` | 見下方「跨頁驗證」 |
| `→ ⏭️ 跳過（{reason}）` | `// 跳過：{reason}` |

> **重要**：Toast 斷言一律使用 `{ exact: true }`，**禁止**使用 regex（如 `/成功|已建立/`）。
> 若 `.flow.md` 未指定具體 toast 文字（只寫 `顯示成功提示`），**必須從 Vue 頁面讀取 `toast.add` 的實際文字**。

---

## 特殊操作轉換

### 列表中定位特定行

```markdown
Flow:
  1. 在球隊列表中找到「藍鷹隊」那列 → #team-list
  2. 點擊該列的「編輯」按鈕 → #team-edit
```

```typescript
const row = page.getByTestId('team-list').locator('tbody tr', { hasText: '藍鷹隊' })
await row.getByTestId('team-edit').click()
```

> **注意**：`hasText` 的值必須是 mock data 中實際存在的值。若 flow 寫 "紅龍隊" 但 mock 中不存在，必須替換為實際球隊名。

### 行內驗證

```typescript
const row = page.getByTestId('team-list').locator('tbody tr', { hasText: '藍鷹隊' })
await expect(row).toContainText('coach1')
```

### 批次勾選

```typescript
await page.getByTestId('history-row').filter({ hasText: 'T001' }).locator('input[type="checkbox"]').check()
```

### 確認彈窗

```typescript
// 使用 helpers 的 confirmDelete
await confirmDelete(page)
```

> **禁止**使用 `getByText('確定要刪除')` + `getByRole('button', { name: '刪除' })` 的模式。
> 統一使用 `confirmDelete(page)` helper。

### 跨頁驗證

```typescript
await page.goto('/players', { waitUntil: 'networkidle' })
await expect(page.getByTestId('player-list')).not.toContainText('王小明')
```

### 引用共用步驟

```typescript
// 從 helpers import 的 login
await login(page, 'coach1', 'pass123')
```

### USelect 下拉選單

```typescript
// 從 helpers import 的 selectOption
await selectOption(page, 'training-team', '藍鷹隊')
```

> **注意**：option label 可能經過格式化（如球員選項為 `"1 - 王小明"` 而非 `"王小明"`）。
> 必須檢查 Vue 頁面的 `options` / `items` computed 來確認實際 label 格式。

---

## 防止 Strict Mode Violation

Playwright strict mode 要求 `getByText` 只匹配一個元素。以下情況容易觸發 violation：

### 1. Toast 文字與頁面文字重複

當 toast 文字與頁面上的 Badge / Label 相同時（如 `AI 已停止` 同時出現在 Badge 和 Toast）：

```typescript
// ❌ strict mode violation：匹配到 Badge + Toast 兩個元素
await expect(page.getByText('AI 已停止', { exact: true })).toBeVisible()

// ✅ 限定在 toast 區域
await expect(page.getByRole('alert').getByText('AI 已停止')).toBeVisible()
```

### 2. 數值同時出現在多處

當球速等數值同時出現在資訊卡片和圖表標註時：

```typescript
// ❌ strict mode violation：匹配到 info card "130.1 km/h" + velocity label "130.1"
await expect(page.getByText('130.1')).toBeVisible()

// ✅ 限定在特定 testid
await expect(page.getByTestId('pitch-velocity-label')).toContainText('130.1')
```

### 判斷準則

生成 spec 時，對每個 `getByText` 斷言思考：**這段文字是否可能在頁面上出現多次？** 如果可能，改用更精確的定位器。

---

## UI 功能缺失處理

若 `.flow.md` 描述的操作在 UI 中尚未實作（如拖曳排序、特定按鈕不存在），將該測試標記為 skip：

```typescript
test.skip('成功調整球員排序', async () => {
  // 跳過：UI 尚未實作拖曳排序功能
})
```

判斷方式：在 Step 2 掃描 Vue 頁面時，確認 flow 中引用的 testid 和互動元素是否都存在。

---

## 統計數據驗證

驗證好球率、平均球速等計算值時，**必須從 mock data 手動計算**，不使用 flow 中的數值：

```
mock pitches (training_id=1):
- pitch 1: velocity=130.1, is_strike=true
- pitch 2: velocity=128.5, is_strike=true
- pitch 3: velocity=125.5, is_strike=false
- pitch 4: velocity=127.3, is_strike=true
- pitch 5: velocity=126.5, is_strike=false

計算：
- 總投球數 = 5
- 好球數 = 3
- 好球率 = Math.round(3/5 * 100) = 60%
- 平均球速 = (130.1+128.5+125.5+127.3+126.5) / 5 = 127.58 → 127.6
```

> **注意**：Vue 頁面可能使用 `Math.round` 或 `toFixed`，確認實際的格式化方式。

---

## 跳過情境

### 整個情境跳過

```typescript
test.skip('帳號鎖定後重新登入', async () => {
  // 跳過：需要控制時間（鎖定過期），E2E 無法快轉時間
})
```

> **注意**：`test.skip` 的 callback 必須是 `async () =>`，**不帶** `{ page }` 參數。

### 單一驗證步驟跳過

```typescript
// 跳過：系統產生 "球隊已建立" 事件（內部事件）
```

---

## ESLint Import 排序（必遵守）

```typescript
// ✅ 正確排序
import { expect, test } from '@playwright/test'
import { confirmDelete, login } from '../helpers'
```

排序規則：
1. `import type` 在前
2. 外部套件按字母排序
3. 相對路徑按字母排序
4. named imports 按字母排序

---

## 完整範例（含交叉比對）

### Step 1 輸入：`.flow.md`

```markdown
## 規則：教練只能查詢自己建立的球隊

### 情境：教練查詢球隊列表

前置條件：
- 「教練 "coach1" 已登入」→ （共用步驟，見 _common.flow.md）

操作步驟：
- 「教練查詢球隊列表」
  1. 前往球隊管理頁 → /teams
  2. 等待頁面載入 → #teams-page

預期結果：
- 「回傳以下球隊」→ #team-list 包含「紅龍隊」
- → #team-list 包含「藍鷹隊」
- → #team-list 不包含「白虎隊」
```

### Step 2 交叉比對

```
讀取 server/mock/data/teams.ts:
- { id: 1, name: '藍鷹隊', created_by: 'coach1' }
- { id: 2, name: '紅虎隊', created_by: 'coach2' }
- { id: 3, name: '金龍隊', created_by: 'coach1' }

⚠️ 校正表：
- flow "紅龍隊" → mock 中不存在，coach1 的球隊為「藍鷹隊」和「金龍隊」→ 改為「金龍隊」
- flow "白虎隊" → mock 中不存在，coach2 的球隊為「紅虎隊」→ 改為「紅虎隊」

讀取 app/pages/teams/index.vue:
- testid "teams-page" ✅ 存在
- testid "team-list" ✅ 存在
```

### Step 4 輸出：`.spec.ts`（使用校正後的值）

```typescript
import { expect, test } from '@playwright/test'
import { login } from '../helpers'

test.beforeEach(async ({ request }) => {
  await request.post('/api/__test__/reset')
})

test.describe('規則：教練只能查詢自己建立的球隊', () => {
  test('教練查詢球隊列表', async ({ page }) => {
    // Given：教練 "coach1" 已登入
    await login(page, 'coach1', 'pass123')

    // When：教練查詢球隊列表
    await page.goto('/teams', { waitUntil: 'networkidle' })
    await expect(page.getByTestId('teams-page')).toBeVisible()

    // Then：回傳 coach1 建立的球隊（藍鷹隊、金龍隊）
    await expect(page.getByTestId('team-list')).toContainText('金龍隊')
    await expect(page.getByTestId('team-list')).toContainText('藍鷹隊')
    await expect(page.getByTestId('team-list')).not.toContainText('紅虎隊')
  })
})
```

> 注意：flow 中的「紅龍隊」→「金龍隊」、「白虎隊」→「紅虎隊」，皆依據 mock data 校正。

---

## Lint Gate（必須通過）

生成 `.spec.ts` 後，**必須執行 lint 修復並確認零錯誤**：

```bash
npm run lint --fix
npm run lint    # 確認 0 errors
```

常見需手動修的問題：
- `unused-imports/no-unused-imports`：`test.skip` 導致 `expect` 或 `login` 未使用
- `unused-imports/no-unused-vars`：未使用參數加 `_` 前綴

> **重要**：若所有測試都 `test.skip`，則 `expect` 和 `login` 的 import 會變成未使用。此時應移除未使用的 import。

---

## 檢查清單

### 基本規則
- [ ] fixtures.ts 已包含所需的路由和測試帳號
- [ ] import 排序符合 ESLint perfectionist 規則
- [ ] 共用操作從 `../helpers` import（login / selectOption / confirmDelete）
- [ ] **spec 內不存在** login / selectOption / confirmDelete 的本地定義
- [ ] `test.beforeEach` 呼叫 `request.post('/api/__test__/reset')`
- [ ] 每個 test 有 Given/When/Then 註解
- [ ] `test.skip` callback 是 `async () =>`（不帶 `{ page }`）
- [ ] 跳過的驗證步驟有 `// 跳過：{reason}` 註解
- [ ] `page.goto()` 加 `{ waitUntil: 'networkidle' }`
- [ ] Toast 斷言使用 `{ exact: true }`，**不含 regex**
- [ ] 確認彈窗使用 `confirmDelete(page)`，不用 getByText + getByRole
- [ ] 列表行定位使用 `locator('tbody tr', { hasText })` 模式
- [ ] `npm run lint` 零錯誤

### ⚠️ 交叉比對（每個 spec 必須通過）
- [ ] 所有球隊名、球員名、日期 — 已與 `server/mock/data/*.ts` 比對
- [ ] 所有 testid — 已與 Vue 頁面的 `data-testid` 比對
- [ ] 所有 toast 文字 — 已從 Vue 頁面的 `toast.add({ title })` 取得
- [ ] 所有 API 錯誤訊息 — 已從 `createError({ message })` 取得
- [ ] 所有統計數值（好球率、平均球速等）— 已從 mock data 手動計算
- [ ] 所有 select option label — 已確認 Vue 頁面的格式化方式
- [ ] 表單互動流程 — 已確認必填欄位順序和條件顯示（v-if）
- [ ] getByText 斷言 — 已檢查是否可能觸發 strict mode violation
- [ ] flow 中引用的 UI 功能 — 已確認 Vue 頁面中存在（不存在則 skip）
