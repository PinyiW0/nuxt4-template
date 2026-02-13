---
name: test
description: 測試開發流程 - BDD / E2E / 單元測試三層覆蓋
---

# 測試開發流程

支援三種測試層級：
- **Service 層 BDD**：測試業務規則（`test/bdd/`）
- **E2E 層**：測試使用者操作流程（`test/e2e/`）
- **單元測試**：測試個別程式碼單元（`test/unit/` + `test/nuxt/`）

## 三層覆蓋地圖

```
┌─────────────────────────────────────────────────────┐
│  E2E（使用者流程）— Playwright Test Runner             │
├─────────────────────────────────────────────────────┤
│  單元測試（個別單元）                                  │
│  ├─ API Handler：HTTP 層（狀態碼、參數驗證、篩選）       │
│  ├─ Store：狀態流轉（login→isAuthenticated）          │
│  ├─ Middleware：路由守衛分支                          │
│  ├─ Page：computed、事件 handler、條件渲染             │
│  └─ Component：props、emit、互動行為                  │
├─────────────────────────────────────────────────────┤
│  BDD（業務規則）— Gherkin + quickpickle               │
└─────────────────────────────────────────────────────┘
```

## 翻譯鏈定位

```
Event Storming → DSL Gherkin → Step Definitions → Implementation
                               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                               BDD / E2E 流程涵蓋範圍
```

## 使用方式

### Service 層 BDD（單一階段）

```bash
/test map <feature>      # 00. 架構盤點 - Gherkin → Step Definition 對應
/test red <feature>      # 01. 紅燈 - 生成 Step Definition 樣板（必須失敗）
/test green <feature>    # 02. 綠燈 - 最小實作（讓測試通過）
/test blue <feature>     # 03. 藍燈 - 重構改善品質
```

### Service 層 BDD（批次執行）

```bash
/test pipeline <feature>           # 單一 feature 完整流程 (map→red→green→blue)
/test batch <start> <end>          # 批次處理指定範圍的 features
/test auto [--limit N]             # 自動偵測並處理未完成的 features
```

### E2E 測試

> **前置條件**：`.flow.md` 必須已由 `/feature-to-flow` 產出。

```bash
/test e2e setup                    # 建立 E2E 測試基礎架構（helpers、hooks）
/test e2e spec <feature>           # .flow.md → .spec.ts Playwright 測試生成
/test e2e batch <start> <end>      # 批次生成指定範圍的 spec
/test e2e auto [--limit N]         # 自動偵測已有 .flow.md 但缺 .spec.ts 的 feature
/test e2e red <feature>            # 紅燈 - 跑測試收集失敗，輸出診斷報告
/test e2e green <feature>          # 綠燈 - 分析失敗根因，修復 UI 讓測試通過
/test e2e pipeline <feature>       # 完整流程 (spec→red→green)
```

### 單元測試

```bash
/test unit audit [category]        # 盤點所有可測檔案（優先級 + 測試狀態）
/test unit scan <target>           # 掃描程式碼，推導測試案例清單
/test unit red <target>            # 生成測試樣板（必須失敗）
/test unit green <target>          # 實作測試（讓測試通過）
/test unit pipeline <target>       # 完整流程 (scan→red→green)
/test unit batch <category>        # 批次處理某分類（api/store/middleware/page/component）
/test unit auto [--limit N]        # 自動偵測未測試的程式碼
```

#### `<target>` 參數格式

| 格式 | 範例 | 說明 |
|------|------|------|
| 檔案路徑 | `server/api/auth/login.post.ts` | 指定單一檔案 |
| 簡寫路徑 | `auth/login` | 自動搜尋匹配的檔案 |
| 分類名稱 | `api` / `store` / `page` | 批次處理整個分類 |

#### 選項

| 選項 | 適用指令 | 說明 |
|------|---------|------|
| `--skip-blue` | pipeline, batch, auto | 跳過藍燈階段（加速） |
| `--limit N` | auto | 最多處理 N 個 features |
| `--continue-on-error` | batch | 失敗時繼續下一個（預設：停止） |

### 參數說明

- `<phase>`: `map` | `red` | `green` | `blue` | `pipeline` | `batch` | `auto` | `e2e` | `unit`
- `<feature>`: feature 檔案名稱或編號（如 `01` 或 `01-使用者登入`）
- `<target>`: 程式碼檔案路徑、簡寫路徑或分類名稱（單元測試用）
- `<start>`, `<end>`: feature 編號範圍（如 `03 10`）

## 現有 Feature 檔案

!`ls -1 docs/gherkin-spec/features/*.feature 2>/dev/null | head -15 || echo "(無)"`

---

## Step Definition 目錄結構

```
test/bdd/
├── helpers/
│   └── world.ts              # TestWorld 類型定義
└── steps/
    ├── index.ts              # 匯入所有 step definitions
    ├── aggregate_given/      # Given - 建立實體狀態
    ├── aggregate_then/       # Then - 驗證實體狀態
    ├── commands/             # When - 寫入操作（Command）
    ├── query/                # When - 讀取操作（Query）
    ├── common_then/          # Then - 通用驗證（成功/失敗/訊息）
    └── readmodel_then/       # Then - 驗證查詢結果
```

---

## Gherkin → Step Definition 對應表（Decision Tree）

```
┌─────────────┬──────────────────┬─────────────────────────────────────────────┐
│ Gherkin     │ 情境判斷          │ 目錄 / Handler                               │
├─────────────┼──────────────────┼─────────────────────────────────────────────┤
│ Given       │ 建立實體狀態       │ aggregate_given/                            │
│             │ 已完成的動作       │ commands/ (前置條件)                         │
├─────────────┼──────────────────┼─────────────────────────────────────────────┤
│ When        │ 寫入操作 (Command)│ commands/                                   │
│             │ 讀取操作 (Query)  │ query/                                      │
├─────────────┼──────────────────┼─────────────────────────────────────────────┤
│ Then        │ 操作成功/失敗      │ common_then/                                │
│             │ 系統顯示訊息       │ common_then/                                │
│             │ 系統產生事件       │ common_then/                                │
│             │ 驗證實體狀態       │ aggregate_then/                             │
│             │ 驗證查詢結果       │ readmodel_then/                             │
└─────────────┴──────────────────┴─────────────────────────────────────────────┘
```

### Command vs Query 區分

| 類型 | 特徵 | 回傳值 | 範例動詞 |
|------|------|--------|---------|
| **Command** | 修改系統狀態 | 無 | 建立、更新、刪除、提交、登入 |
| **Query** | 讀取資料 | 有 | 查詢、取得、列出、檢視 |

---

## 必讀文件

根據 phase 讀取對應文件：

### Service 層 BDD

- [bdd/mapping.md](bdd/mapping.md) - 架構盤點規則（map）
- [bdd/red.md](bdd/red.md) - 紅燈階段規則（red）
- [bdd/green.md](bdd/green.md) - 綠燈階段規則（green）
- [bdd/blue.md](bdd/blue.md) - 藍燈階段規則（blue）
- [bdd/pipeline.md](bdd/pipeline.md) - 批次執行規則（pipeline / batch / auto）

### E2E 測試

- [e2e/setup.md](e2e/setup.md) - Playwright 環境建立（e2e setup）
- [e2e/spec.md](e2e/spec.md) - Spec 生成規則（e2e spec）
- [e2e/pipeline.md](e2e/pipeline.md) - Batch / Auto / Pipeline 規則
- [e2e/red.md](e2e/red.md) - 紅燈階段規則（e2e red）
- [e2e/green.md](e2e/green.md) - 綠燈階段規則（e2e green）

> Flow 生成（`.feature` → `.flow.md`）已獨立為 `/feature-to-flow` skill。

### 單元測試

- [unit/audit.md](unit/audit.md) - 盤點階段規則（unit audit）
- [unit/scan.md](unit/scan.md) - 掃描階段規則（unit scan）
- [unit/red.md](unit/red.md) - 紅燈階段規則（unit red）
- [unit/green.md](unit/green.md) - 綠燈階段規則（unit green）
- [bdd/blue.md](bdd/blue.md) - 藍燈階段（共用，可選）

---

## 執行流程

### Phase: map（架構盤點）

1. 讀取 `.feature` 檔案
2. 識別 Background 層級（Feature-level vs Rule-level）
3. 解析 Given/When/Then，判斷對應的目錄和 Handler
4. 產出對應表到 `test/bdd/{feature}.mapping.md`

### Phase: red（紅燈）🔴

1. 讀取 mapping 或 `.feature` 檔案
2. **檢查現有 Step Definitions**（避免覆蓋）
3. 生成缺少的 Step Definition 樣板到對應目錄
4. 使用 `throw new Error('紅燈階段：尚未實作')` 作為佔位符
5. 執行 `npm run test:run -- --project bdd` 確認紅燈

### Phase: green（綠燈）🟢

1. 讀取紅燈 Step Definition 檔案
2. 實作**最小程式碼**讓測試通過
3. Repository 和 Service 必須支援**依賴注入**
4. 不追求完美，只追求「能動」
5. 執行測試確認綠燈

### Phase: blue（藍燈）🔵

1. 測試已通過（綠燈）
2. 清理 TODO 註記，保留業務邏輯
3. 提取共用邏輯到 helpers
4. 遵守 SOLID 原則重構
5. **測試必須持續通過**

### Phase: pipeline（完整流程）🚀

自動依序執行 map → red → green → blue，任一階段失敗則停止。

```
/test pipeline 03
```

### Phase: batch（批次處理）📦

對指定範圍的 features 依序執行 pipeline。

```
/test batch 03 10              # 處理 03 到 10
/test batch 03 10 --skip-blue  # 跳過藍燈加速
```

### Phase: auto（自動偵測）🤖

掃描所有 features，自動處理未完成的。

```
/test auto                     # 處理所有未完成
/test auto --limit 5           # 最多處理 5 個
```

判斷 feature 是否完成：
1. `test/bdd/{feature}.mapping.md` 存在
2. 執行測試全部通過

---

## quickpickle Step Definition 語法

```typescript
// test/bdd/steps/commands/auth.ts
import type { TestWorld } from '../../helpers/world'
import { When } from 'quickpickle'

When('使用者以帳號 {string} 密碼 {string} 登入', async (world: TestWorld, account: string, password: string) => {
  // 實作邏輯
})
```

### 參數類型

| Cucumber Expression | TypeScript 類型 | 說明 |
|---------------------|-----------------|------|
| `{string}` | `string` | 引號內的文字 |
| `{int}` | `number` | 整數 |
| `{float}` | `number` | 浮點數 |
| `{word}` | `string` | 單字（不含空格） |
| `DataTable` | `DataTable` | 表格資料 |

---

## 測試指令

```bash
npm run test:run -- --project bdd                    # 執行所有 BDD 測試
npm run test:run -- --project bdd "docs/**/*.feature" # 執行特定 feature
npm run test -- --project bdd                        # Watch 模式
```

---

## 核心原則

### 依賴注入

測試與 Service 必須共用同一個 Repository 實例：

```typescript
// step definition
Given('系統中有以下使用者：', async (world: TestWorld, dataTable: DataTable) => {
  world.userRepository = createUserRepository()
  world.authService = createAuthService({ userRepository: world.userRepository })
  // ...
})

When('使用者以帳號 {string} 密碼 {string} 登入', async (world: TestWorld, account, password) => {
  // 使用 world.authService（已注入 repository）
  world.loginResult = world.authService.login({ account, password })
})

Then('登入失敗次數重置為 0', async (world: TestWorld) => {
  // 使用同一個 world.userRepository 查詢驗證
  const user = world.userRepository.findByAccount(world.currentUser)
  expect(user?.failedAttempts).toBe(0)
})
```

### 永遠不覆蓋已存在的 Step Definition

執行 red phase 前，必須先掃描現有步驟，只生成缺少的。

---

# E2E 測試

## E2E 架構概覽

```
.feature（業務規則）
    ↓ /feature-to-flow（獨立 skill）
.flow.md（操作流程 + testid）← single source of truth
    ├─→ /test e2e spec → Playwright .spec.ts
    ├─→ /feature-to-ui → Vue 頁面（消費 testid）
    └─→ PM/QA 確認（自然語言可讀）
```

> **職責分離**：
> - `/feature-to-flow`：負責 `.feature` → `.flow.md` 轉換（testid 定義）
> - `/test e2e spec`：負責 `.flow.md` → `.spec.ts` 生成（測試程式碼）
> - `/feature-to-ui`：消費 `.flow.md` 的 testid（UI 生成）

## E2E 測試目錄結構

```
test/e2e/
├── helpers/
│   ├── selectors.ts          # testid → CSS 選擇器（集中管理）
│   ├── fixtures.ts           # 測試資料（帳號、路由）
│   └── index.ts              # 匯出
├── specs/                    # Playwright 測試檔案（由 /test e2e spec 產出）
│   ├── 01-使用者登入.spec.ts
│   └── ...
├── test-results/             # Playwright 測試結果
└── screenshots/              # 測試失敗截圖
```

## E2E 執行流程

### Phase: e2e setup（測試基礎架構）

建立 Playwright 環境和 `test/e2e/helpers/`（selectors、fixtures）。

### Phase: e2e spec（Spec 生成）

1. 讀取 `.flow.md` + `_common.flow.md`（由 `/feature-to-flow` 產出）
2. 動詞→Playwright 轉換（前往→goto、點擊→click、輸入→fill...）
3. 更新 `selectors.ts` 和 `fixtures.ts`
4. 產出 Playwright `.spec.ts`

### Phase: e2e batch / auto

- batch：對指定範圍依序生成 spec
- auto：掃描已有 `.flow.md` 但缺 `.spec.ts` 的 feature，依序生成

### Phase: e2e red（紅燈）🔴

1. 執行 `.spec.ts`，收集測試失敗
2. 對每個失敗測試進行根因分析（testid 缺失 / 文字不匹配 / 元素不存在...）
3. 輸出結構化診斷報告，含修復範圍摘要

### Phase: e2e green（綠燈）🟢

1. 自動先跑紅燈收集失敗（如果全部通過則結束）
2. 分析失敗根因，決定修復方向（修 UI / 修 mock / 修 spec）
3. 最小侵入修復（加 testid、調整模板、修正 mock 數據）
4. Trial-and-Error 循環：修復 → 重跑 → 還有失敗？→ 繼續修
5. 最大迭代 5 次，超過則輸出剩餘失敗報告

### Phase: e2e pipeline（完整流程）🚀

自動依序執行 spec → red → green，任一階段失敗則停止。

```bash
/test e2e pipeline 03         # 單一 feature
/test e2e pipeline 03 10      # 批次（03 到 10）
```

## E2E testid 策略

採用 **策略 C**：簡單 testid + Playwright 定位能力

- 唯一元素：`{page}-{element}`（如 `login-submit`）
- 列表內元素：可重複，用 `filter({ hasText })` 定位
- testid 命名規則定義在 `_common.flow.md`
- 同一頁面的 testid 由 `pages/*.elements.md` 集中管理（Option B）

## E2E 測試指令

```bash
npm run test:e2e              # 執行 E2E 測試（headless，自動啟動 dev server）
npm run test:e2e:headed       # 有頭模式（可看到瀏覽器）
npm run test:e2e:ui           # Playwright UI 模式（互動式除錯）
npx playwright show-report    # 查看 HTML 測試報告
```

> **注意**：`playwright.config.ts` 已設定 `webServer`，會自動啟動 dev server，不需手動執行 `npm run dev`。

---

# 單元測試

## 定位

補足 BDD 和 E2E 之間的覆蓋缺口：

| 層級 | 視角 | 測試什麼 |
|------|------|---------|
| **BDD** | 業務規則 | Domain Service 邏輯 |
| **單元測試** | 個別單元 | HTTP 層、Store 狀態、UI 邏輯、元件行為 |
| **E2E** | 使用者流程 | 完整操作路徑 |

## 單元測試目錄結構

```
test/unit/                              # Vitest unit 專案（node 環境）
└── server/api/                         # API Handler 測試
    ├── auth/
    │   ├── login.post.test.ts
    │   └── refresh.post.test.ts
    ├── ai/
    │   ├── start.post.test.ts
    │   ├── stop.post.test.ts
    │   └── status.get.test.ts
    ├── trainings/
    │   ├── index.get.test.ts
    │   ├── history.get.test.ts
    │   └── batch-delete.post.test.ts
    ├── players/
    │   ├── index.get.test.ts
    │   └── sort.put.test.ts
    ├── teams/
    │   └── index.get.test.ts
    └── player-analysis/
        └── index.get.test.ts

test/nuxt/                              # Vitest nuxt 專案（nuxt 環境）
├── stores/
│   └── auth.test.ts
├── middleware/
│   └── auth.global.test.ts
├── pages/
│   ├── login.test.ts
│   ├── index.test.ts
│   ├── teams/index.test.ts
│   ├── players/index.test.ts
│   ├── trainings/history.test.ts
│   ├── trainings/[id]/index.test.ts
│   ├── analysis/index.test.ts
│   └── ...
└── components/common/
    ├── ConfirmModal.test.ts
    └── ListContainer.test.ts
```

## 分類判斷（Decision Tree）

```
讀取檔案路徑
↓
server/api/**     → 分類 A：API Handler（test/unit/，node 環境）
app/stores/**     → 分類 B：Store（test/nuxt/，nuxt 環境）
app/middleware/** → 分類 C：Middleware（test/nuxt/，nuxt 環境）
app/pages/**      → 分類 D：Page（test/nuxt/，nuxt 環境）
app/components/** → 分類 E：Component（test/nuxt/，nuxt 環境）
```

## 單元測試執行流程

### Phase: unit audit（盤點）📋

1. 掃描所有分類目錄，找出可測試檔案
2. 檢查鏡像路徑是否已有測試
3. 評估優先級（高/中/跳過）
4. 輸出盤點報告，含建議執行順序

```bash
/test unit audit              # 全部分類
/test unit audit api          # 只看 API Handler
```

### Phase: unit scan（掃描）🔍

1. 讀取目標程式碼檔案
2. 識別分類（A-E）
3. 逐行掃描條件分支（if/else、try/catch、computed、v-if）
4. 對照 BDD/E2E 已覆蓋範圍，排除重複
5. 產出測試案例表到 `.scan.md`

### Phase: unit red（紅燈）🔴

1. 讀取 `.scan.md`
2. **檢查現有測試檔案**（避免覆蓋）
3. 生成測試樣板到鏡像路徑
4. 設定分類對應的 Mock 框架
5. 使用 `throw new Error('紅燈：尚未實作')` 作為佔位符
6. 執行測試確認紅燈

### Phase: unit green（綠燈）🟢

1. 讀取紅燈測試檔案
2. 逐一實作 `it` block（AAA 模式）
3. Trial-and-Error：執行→實作→再執行
4. 執行測試確認綠燈

### Phase: unit pipeline（完整流程）🚀

自動依序執行 scan → red → green → (blue?)，任一階段失敗則停止。

GREEN 通過後，自動檢查是否觸發 BLUE：

| # | 觸發條件 | 重構動作 |
|---|---------|---------|
| 1 | TODO / FIXME 殘留 | 清除或實作 |
| 2 | ≥3 個 it 共用相同 mock setup | 提取到 `beforeEach` 或 helper |
| 3 | 測試檔超過 150 行 | 拆分 describe 或提取 helpers |
| 4 | 相同 magic value 出現 ≥3 次 | 提取為常數或 fixture |

以上皆無命中 → 跳過 BLUE。詳見 [unit/green.md](unit/green.md) 的 Decision Tree。

### Phase: unit batch（批次處理）📦

對指定分類的所有檔案依序執行 pipeline。

```bash
/test unit batch api        # 所有 API Handler
/test unit batch store      # 所有 Store
/test unit batch page       # 所有 Page
```

### Phase: unit auto（自動偵測）🤖

掃描所有可測試檔案，找出缺少測試的，依序執行 pipeline。

判斷是否已有測試：
1. 對應鏡像路徑的 `.test.ts` 存在
2. 執行測試全部通過

## 單元測試指令

```bash
npm run test:run -- --project unit                    # 執行所有 unit 測試
npm run test:run -- --project nuxt                    # 執行所有 nuxt 測試
npm run test:run -- --project unit "test/unit/**/*"    # 執行指定路徑
npm run test -- --project unit                        # Watch 模式
```

## 三層測試 vs 測試指令對照

| 層級 | 測試框架 | 指令 |
|------|---------|------|
| Service BDD | Vitest + quickpickle | `npm run test:run -- --project bdd` |
| E2E | Playwright Test Runner | `npm run test:e2e` |
| 單元測試（API） | Vitest (node) | `npm run test:run -- --project unit` |
| 單元測試（Store/Page/Component） | Vitest (nuxt) | `npm run test:run -- --project nuxt` |
