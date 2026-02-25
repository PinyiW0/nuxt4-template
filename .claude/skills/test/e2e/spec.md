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
3. test/e2e/helpers/actions.ts       — 共用操作（login 等）
4. test/e2e/helpers/fixtures.ts       — 測試資料

必讀（實作比對）：
5. server/mock/data/*.ts             — 實際 mock 資料（實體名稱、日期、數值等）
6. app/pages/{相關頁面}.vue           — 實際 testid、toast 文字、表單互動流程
7. server/api/{相關 API}.ts           — 實際錯誤訊息（createError 的 message）
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
6. **⚠️ 資料值以 mock data 為準**：`.flow.md` 中的實體名稱、日期、數值等可能是假設值，**必須替換為 `server/mock/data/*.ts` 中的實際值**

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

讀取 `server/mock/data/*.ts`，理解每個實體的欄位、關聯和實際資料值。建立對應關係表（如：哪個使用者建立了哪些資源、各資源的狀態和數值）。

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

#### 2c. 掃描 API 錯誤訊息（僅涉及錯誤場景時）

讀取相關 API handler，提取 `createError` 的 message：

```bash
grep "createError" server/api/{相關路徑}/*.ts
```

#### 2d. 產出校正表

對比 `.flow.md` 與實際實作，列出所有差異：

```
⚠️ 校正表：
- flow 實體名稱 "{flow值}" → 實際 mock: "{mock值}"
- flow testid "{flow-id}" → 實際 Vue: "{vue-id}"
- flow toast "{flow文字}" → 實際 Vue: "{vue文字}"
- flow 缺少步驟：{描述}
- flow 錯誤訊息 "{flow訊息}" → 實際 API: "{api訊息}"
- ⚠️ 未驗證：Vue 頁面尚未實作，暫用 flow 文字 "{text}"
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
    await page.goto('/items', { waitUntil: 'networkidle' })

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

---

## Playwright 必遵守規則

> ⚠️ 違反任一條都會產生有問題的 spec。此段落為 Playwright 規則的**唯一權威來源**，其他檔案（red.md、green.md）不再重複列出。

### 語法規則

| 規則 | 正確 | 禁止 |
|------|------|------|
| `page.goto()` | 加 `{ waitUntil: 'networkidle' }` | 不帶 waitUntil |
| Toast 斷言 | `{ exact: true }` | regex（如 `/成功/`） |
| `test.skip` callback | `async () =>` | `async ({ page }) =>` |
| `test.beforeEach` | 呼叫 `request.post('/api/__test__/reset')` | 省略 reset |
| 確認彈窗 | `confirmDelete(page)` | `getByText('確定要刪除')` + `getByRole('button')` |
| 列表行定位 | `locator('tbody tr', { hasText })` | 直接 `getByText`（會匹配 header） |
| `toHaveURL` | 用 `waitForURL('**/path')` 代替 | `toHaveURL` 不支援 glob |
| helpers | 從 `../helpers` import | 在 spec 內重複定義 login / selectOption / confirmDelete |

### 交叉比對規則

| 資料類型 | 來源 | Fallback（找不到時） |
|---------|------|---------------------|
| 實體名稱、日期、數值 | `server/mock/data/*.ts` | ❌ 不可省略，必定存在 |
| testid | Vue 頁面 `data-testid` | 用 flow 的 testid，加 `// ⚠️ 未驗證` 註解 |
| toast 文字 | Vue 頁面 `toast.add({ title })` | 用 flow 的文字，加 `// ⚠️ 未驗證：Vue 尚未實作` 註解 |
| API 錯誤訊息 | `server/api/` 的 `createError({ message })` | 用 flow 的文字，加 `// ⚠️ 未驗證：API 尚未實作` 註解 |
| select option label | Vue 頁面 `options` / `items` computed | 用 flow 的文字，加 `// ⚠️ 未驗證` 註解 |
| 統計數值 | 從 mock data 手動計算 | ❌ 不可省略，必須計算 |

> **Fallback 原則**：找不到實作時，用 flow 的值寫完整測試步驟並加 `// ⚠️ 未驗證` 註解。**禁止因為找不到而 skip 或留空。**

### Strict Mode Violation 防範

`getByText` 只能匹配一個元素。對每個 `getByText` 斷言思考：**這段文字是否可能在頁面上出現多次？**

```typescript
// ❌ toast 文字與 Badge 重複 → strict mode violation
await expect(page.getByText('狀態文字', { exact: true })).toBeVisible()

// ✅ 限定在 toast 區域
await expect(page.getByRole('alert').getByText('狀態文字')).toBeVisible()

// ❌ 數值出現在多處
await expect(page.getByText('128.5')).toBeVisible()

// ✅ 限定在特定 testid
await expect(page.getByTestId('{value-label}')).toContainText('128.5')
```

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

### 驗證詞轉換

| Flow 驗證詞 | Playwright 程式碼 |
|------------|------------------|
| `→ 顯示成功提示「{text}」` | `await expect(page.getByText('text', { exact: true })).toBeVisible()` |
| `→ 顯示成功提示` | 從 Vue 頁面的 `toast.add` 取得實際文字（找不到時套用 fallback） |
| `→ 顯示錯誤提示「{text}」` | `await expect(page.getByText('text', { exact: true })).toBeVisible()` |
| `→ 顯示錯誤提示` | 從 API 的 `createError` 取得實際文字（找不到時套用 fallback） |
| `→ 文字「{text}」可見` | `await expect(page.getByText('text')).toBeVisible()` |
| `→ 文字「{text}」不可見` | `await expect(page.getByText('text')).not.toBeVisible()` |
| `→ #{id} 包含「{text}」` | `await expect(page.getByTestId('id')).toContainText('text')` |
| `→ #{id} 不包含「{text}」` | `await expect(page.getByTestId('id')).not.toContainText('text')` |
| `→ #{id} 中「{rowText}」那列包含「{text}」` | 見下方「行內驗證」 |
| `→ 跳轉到 {path}` | `await page.waitForURL('**/path')` |
| `→ 前往 {path}，#{id} 不包含「{text}」` | 見下方「跨頁驗證」 |
| `→ 前往 {path}，#{id} 包含「{text}」` | 見下方「跨頁驗證」 |
| `→ 前往 {path}，文字「{text}」可見` | 見下方「跨頁驗證」 |
| `→ ⏭️ 跳過（{reason}）` | `// 跳過：{reason}` |

---

## 特殊操作轉換

### 列表中定位特定行

```typescript
const row = page.getByTestId('{entity}-list').locator('tbody tr', { hasText: '{item-name}' })
await row.getByTestId('{entity}-edit').click()
```

### 行內驗證

```typescript
const row = page.getByTestId('{entity}-list').locator('tbody tr', { hasText: '{item-name}' })
await expect(row).toContainText('{expected-text}')
```

### 批次勾選

```typescript
await page.getByTestId('{entity}-row').filter({ hasText: '{item-id}' }).locator('input[type="checkbox"]').check()
```

### 確認彈窗

```typescript
await confirmDelete(page)
```

### 跨頁驗證

```typescript
await page.goto('/items', { waitUntil: 'networkidle' })
await expect(page.getByTestId('{entity}-list')).not.toContainText('{deleted-name}')
```

### USelect 下拉選單

```typescript
await selectOption(page, '{field-id}', '{option-label}')
```

> **注意**：option label 可能經過格式化（如 `"1 - 項目名稱"` 而非 `"項目名稱"`），必須檢查 Vue 頁面確認實際格式。

---

## Skip 規則

### 允許 skip 的情況（僅限以下）

- API 層已過濾，UI 根本無法觸發的場景（如「使用者編輯他人的資源」）
- 需要外部系統配合且無法 mock（如 SSE 即時推送）
- 需要控制時間的場景（如帳號鎖定過期）

### 禁止 skip 的情況

**「UI 尚未實作」不是 skip 的理由。** 寫完整步驟，讓 Playwright 自然因找不到元素而失敗。E2E 測試報告就是功能完成度清單。

```typescript
// ❌ 禁止
test.skip('成功調整排序', async () => {
  // 跳過：UI 尚未實作
})

// ✅ 寫完整步驟
test('成功調整排序', async ({ page }) => {
  await login(page, 'coach1', 'pass123')
  await page.goto('/items/1/list', { waitUntil: 'networkidle' })
  await page.getByTestId('sort-handle').first()
    .dragTo(page.getByTestId('sort-handle').nth(2))
})
```

### test.skip 語法

```typescript
test.skip('帳號鎖定後重新登入', async () => {
  // 跳過：需要控制時間（鎖定過期）
})
```

> callback 必須是 `async () =>`，**不帶** `{ page }` 參數。

---

## ESLint / Lint Gate

```typescript
// ✅ import 排序：import type 在前、外部套件按字母、相對路徑按字母、named imports 按字母
import { expect, test } from '@playwright/test'
import { confirmDelete, login } from '../helpers'
```

生成後**必須執行**：

```bash
npm run lint --fix
npm run lint    # 確認 0 errors
```

常見問題：
- `test.skip` 導致 `expect` / `login` 未使用 → 移除未使用的 import
- 未使用參數 → 加 `_` 前綴

---

## 檢查清單

- [ ] fixtures.ts 已包含所需的路由和測試帳號
- [ ] import 排序符合 ESLint perfectionist 規則
- [ ] 共用操作從 `../helpers` import，spec 內無本地定義
- [ ] `test.beforeEach` 呼叫 mock data reset
- [ ] 每個 test 有 Given/When/Then 註解
- [ ] 所有語法規則已遵守（見「Playwright 必遵守規則 > 語法規則」表）
- [ ] 所有交叉比對已完成（見「Playwright 必遵守規則 > 交叉比對規則」表）
- [ ] getByText 斷言已檢查 strict mode violation 風險
- [ ] 未驗證的值已標註 `// ⚠️ 未驗證` 註解
- [ ] `npm run lint` 零錯誤
