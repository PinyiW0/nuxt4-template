# 掃描階段規則（Phase: unit scan）🔍

## 目標

分析目標程式碼檔案，識別所有條件分支，推導測試案例清單。

---

## 核心原則

### ✅ 要做的事

1. **讀取完整原始碼**：識別所有 if/else、try/catch、switch、三元運算、computed 條件
2. **識別分類**：根據檔案路徑判斷 API/Store/Middleware/Page/Component
3. **列出所有測試案例**：每個條件分支至少一個案例
4. **標註來源行號**：方便對照原始碼
5. **識別 Mock 需求**：列出需要 mock 的依賴

### ❌ 不要做的事

1. **不要寫測試程式碼**：只產出測試計畫
2. **不要測試框架行為**：只測試自己寫的邏輯
3. **不要重複 BDD/E2E 已覆蓋的**：聚焦 HTTP 層/UI 層行為

---

## 分類判斷（Decision Tree）

```
讀取檔案路徑
↓
server/api/**     → API Handler（unit 專案，node 環境）
app/stores/**     → Store（nuxt 專案）
app/middleware/** → Middleware（nuxt 專案）
app/pages/**      → Page（nuxt 專案）
app/components/** → Component（nuxt 專案）
```

---

## 分支識別規則

### 條件分支 → 測試案例

| 程式碼模式 | 測試案例 |
|-----------|---------|
| `if (!param)` throw/return | 缺少參數時的行為 |
| `if (!entity)` + createError(404) | 查無資料時回傳 404 |
| `if (status === 'X')` | 特定狀態下的行為 |
| `try { } catch { }` | 成功路徑 + 錯誤路徑 |
| computed（`isAdmin`、`isAuthenticated`） | true/false 兩種情境 |
| `.filter(condition)` | 篩選邏輯的各種條件 |
| `.sort(comparator)` | 排序正確性 |
| 三元運算 `a ? b : c` | 兩種結果 |
| `watch(source, callback)` | source 變化時 callback 的行為 |
| `v-if="condition"` | condition 為 true/false 的渲染差異 |

### 忽略的部分

- 純型別定義（type/interface）
- import 語句
- 常數宣告（無邏輯）
- 純模板結構（無 v-if 的靜態區塊）
- Props 預設值（除非有複雜邏輯）

---

## 與 BDD/E2E 的界線

### API Handler

| BDD 已測 | 單元測試要測 |
|---------|------------|
| 業務規則邏輯（鎖定機制） | HTTP 層行為（狀態碼、參數驗證、回傳格式） |
| Service.login() 行為 | handler 的 readBody/getQuery 處理 |
| — | 篩選/排序/分頁的正確性 |
| — | query params 組合篩選 |

### Page / Component

| E2E 已測 | 單元測試要測 |
|---------|------------|
| 完整使用者操作流程 | 個別 computed 正確性 |
| 畫面跳轉成功 | 條件渲染邏輯（v-if 分支） |
| 表單提交完整流程 | 事件 handler 的 mock 呼叫 |
| — | 資料轉換函式（formatDate、getHeatColor） |
| — | 搜尋過濾 + 分頁邏輯 |
| — | 批次選取邏輯（toggleSelect、isAllSelected） |

### Store / Middleware

| E2E 已測 | 單元測試要測 |
|---------|------------|
| 登入後可訪問頁面 | Store 狀態流轉（login→setAuth→isAuthenticated） |
| 未登入被導向 login | Middleware 的每個路由分支 |
| — | logout 失敗仍清除狀態（finally） |
| — | refresh 失敗自動 clearAuth |

---

## Page 特有：邏輯分類

掃描 Page 時，將邏輯分為可獨立測試的類別：

| 類別 | 範例 | 測試策略 |
|------|------|---------|
| **搜尋過濾** | `filteredItems` computed | 測試 computed 輸出 |
| **分頁** | `paginatedItems` computed | 測試切片邏輯 |
| **批次選取** | `toggleSelect`、`isAllSelected` | 測試 Set 操作 |
| **表單提交** | `onFormSubmit` | 測試 $fetch 呼叫和 toast |
| **CRUD 操作** | `handleDelete`、`toggleAi` | 測試 API 呼叫和狀態更新 |
| **資料轉換** | `formatDate`、`getHeatColor`、`stats` | 測試輸入→輸出 |
| **條件渲染** | `v-if="paginatedItems.length > 0"` | 測試元件存在性 |
| **權限分支** | `authStore.isAdmin` 影響 query params | 測試兩種角色 |

---

## 輸出格式

產出到 `test/{project}/{mirror-path}.scan.md`。

路徑鏡像規則：

| 原始檔案 | 掃描輸出 |
|---------|---------|
| `server/api/auth/login.post.ts` | `test/unit/server/api/auth/login.post.scan.md` |
| `app/stores/auth.ts` | `test/nuxt/stores/auth.scan.md` |
| `app/pages/teams/index.vue` | `test/nuxt/pages/teams/index.scan.md` |

### 模板

```markdown
# {檔案路徑} - 單元測試掃描

## 基本資訊

| 項目 | 值 |
|------|---|
| 分類 | API Handler / Store / Middleware / Page / Component |
| 測試檔案 | test/unit/server/api/auth/login.post.test.ts |
| Vitest 專案 | unit / nuxt |

## 測試案例

### describe('{功能描述}')

| # | it | 來源 | 預期行為 |
|---|-----|------|---------|
| 1 | 描述 | L行號: `程式碼片段` | 預期結果 |

## Mock 需求

| 依賴 | 來源 | Mock 方式 |
|------|------|----------|
| readBody | h3 | vi.mock('h3') |
```

---

## 範例

### API Handler 掃描

輸入：`server/api/auth/login.post.ts`

```markdown
# server/api/auth/login.post.ts - 單元測試掃描

## 基本資訊

| 項目 | 值 |
|------|---|
| 分類 | API Handler |
| 測試檔案 | test/unit/server/api/auth/login.post.test.ts |
| Vitest 專案 | unit |

## 測試案例

### describe('POST /api/auth/login')

#### 參數驗證

| # | it | 來源 | 預期行為 |
|---|-----|------|---------|
| 1 | 缺少 account 應回傳 400 | L15: `if (!body.account \|\| !body.password)` | statusCode: 400 |
| 2 | 缺少 password 應回傳 400 | L15 | statusCode: 400 |

#### 帳號查找

| # | it | 來源 | 預期行為 |
|---|-----|------|---------|
| 3 | 帳號不存在應回傳 401 | L20: `if (!user)` | statusCode: 401 |

#### 鎖定機制（HTTP 層）

| # | it | 來源 | 預期行為 |
|---|-----|------|---------|
| 4 | 帳號已鎖定應回傳 403 | L25: `locked_until > now` | statusCode: 403 |
| 5 | 鎖定過期應允許繼續登入 | L30: `locked_until <= now` | 不拋 403 |

#### 密碼驗證

| # | it | 來源 | 預期行為 |
|---|-----|------|---------|
| 6 | 密碼錯誤應累加 failed_attempts | L35: `password !== user.password` | failed_attempts + 1 |
| 7 | 第5次失敗應設定 locked_until | L38: `failed_attempts >= 5` | locked_until 非 null |

#### 成功路徑

| # | it | 來源 | 預期行為 |
|---|-----|------|---------|
| 8 | 成功應回傳 token 和使用者 | L45: happy path | 回傳 access_token、user |
| 9 | 成功應重置 failed_attempts | L43 | failed_attempts = 0 |

## Mock 需求

| 依賴 | 來源 | Mock 方式 |
|------|------|----------|
| readBody | h3 | vi.mock('h3') |
| createError | h3 | vi.mock('h3') |
| mockUsers | ~/server/mock/data | 直接 import 並在 beforeEach 重置 |
```

### Page 掃描

輸入：`app/pages/teams/index.vue`

```markdown
# app/pages/teams/index.vue - 單元測試掃描

## 基本資訊

| 項目 | 值 |
|------|---|
| 分類 | Page |
| 測試檔案 | test/nuxt/pages/teams/index.test.ts |
| Vitest 專案 | nuxt |

## 測試案例

### describe('TeamsPage')

#### 搜尋過濾

| # | it | 來源 | 預期行為 |
|---|-----|------|---------|
| 1 | 應根據球隊名稱過濾 | computed: filteredItems | keyword 匹配 name |
| 2 | 應根據建立者過濾 | computed: filteredItems | keyword 匹配 created_by |
| 3 | 無匹配時應回傳空陣列 | computed: filteredItems | [] |
| 4 | 搜尋時應重置頁數為 1 | watch(searchQuery) | currentPage = 1 |

#### 分頁

| # | it | 來源 | 預期行為 |
|---|-----|------|---------|
| 5 | 應正確切片分頁資料 | computed: paginatedItems | 第 N 頁對應正確區間 |

#### CRUD 操作

| # | it | 來源 | 預期行為 |
|---|-----|------|---------|
| 6 | 新增成功應 refresh 並顯示 toast | onFormSubmit (!isEditing) | $fetch POST 被呼叫 |
| 7 | 編輯成功應 refresh 並顯示 toast | onFormSubmit (isEditing) | $fetch PUT 被呼叫 |
| 8 | 刪除成功應 refresh 並顯示 toast | handleDelete | $fetch DELETE 被呼叫 |
| 9 | API 錯誤應顯示 error toast | catch block | toast.add({ color: 'error' }) |

#### 條件渲染

| # | it | 來源 | 預期行為 |
|---|-----|------|---------|
| 10 | 無資料時應顯示 EmptyState | v-if: paginatedItems.length | EmptyState 存在 |

## Mock 需求

| 依賴 | 來源 | Mock 方式 |
|------|------|----------|
| useFetch | nuxt | vi.mock 或 registerEndpoint |
| $fetch | nuxt | vi.stubGlobal |
| useAuthStore | ~/stores/auth | vi.mock |
| useToast | @nuxt/ui/runtime | vi.mock |
```

### Store 掃描

輸入：`app/stores/auth.ts`

```markdown
# app/stores/auth.ts - 單元測試掃描

## 基本資訊

| 項目 | 值 |
|------|---|
| 分類 | Store |
| 測試檔案 | test/nuxt/stores/auth.test.ts |
| Vitest 專案 | nuxt |

## 測試案例

### describe('useAuthStore')

#### computed

| # | it | 來源 | 預期行為 |
|---|-----|------|---------|
| 1 | 有 token 和 user 時 isAuthenticated 應為 true | computed: isAuthenticated | true |
| 2 | 缺少 token 時 isAuthenticated 應為 false | computed: isAuthenticated | false |
| 3 | role 為管理者時 isAdmin 應為 true | computed: isAdmin | true |
| 4 | role 為教練時 isAdmin 應為 false | computed: isAdmin | false |

#### login

| # | it | 來源 | 預期行為 |
|---|-----|------|---------|
| 5 | 成功應設定 token 和 user | login() 成功路徑 | state 更新 |
| 6 | 失敗應不改變 state | login() 錯誤路徑 | state 不變，拋出錯誤 |

#### logout

| # | it | 來源 | 預期行為 |
|---|-----|------|---------|
| 7 | 成功應清除所有 state | logout() 成功 | token/user 為 null |
| 8 | API 失敗仍應清除 state | logout() finally | token/user 為 null |

#### refresh

| # | it | 來源 | 預期行為 |
|---|-----|------|---------|
| 9 | 成功應更新 token | refresh() 成功 | 新 token |
| 10 | 失敗應清除認證並回傳 false | refresh() catch | clearAuth + return false |

## Mock 需求

| 依賴 | 來源 | Mock 方式 |
|------|------|----------|
| $fetch | nuxt | vi.stubGlobal |
```

---

## 執行流程

1. 讀取目標檔案完整原始碼
2. 根據路徑判斷分類
3. 逐行掃描條件分支
4. 對照 BDD/E2E 已覆蓋範圍，排除重複
5. 輸出測試案例表到 `.scan.md`

---

## 檢查清單

- [ ] 已讀取完整原始碼
- [ ] 已正確識別分類（API/Store/Middleware/Page/Component）
- [ ] 所有條件分支都有對應測試案例
- [ ] 已標註來源行號
- [ ] 不與 BDD/E2E 重複（參照界線表）
- [ ] Mock 需求已完整列出
- [ ] 輸出到正確路徑（鏡像規則）
