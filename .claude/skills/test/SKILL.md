---
name: test
description: BDD 測試開發流程 - 根據 .feature 檔案生成 quickpickle step definitions
disable-model-invocation: true
argument-hint: "<phase> [feature]"
context: fork
agent: general-purpose
---

# BDD 測試開發流程（quickpickle 版本）

根據 `.feature` 檔案執行 BDD 三階段循環，結合事件風暴（Event Storming）概念。

## 翻譯鏈定位

```
Event Storming → DSL Gherkin → Step Definitions → Implementation
                               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                               本流程涵蓋範圍
```

## 使用方式

```bash
/test map <feature>      # 00. 架構盤點 - Gherkin → Step Definition 對應
/test red <feature>      # 01. 紅燈 - 生成 Step Definition 樣板（必須失敗）
/test green <feature>    # 02. 綠燈 - 最小實作（讓測試通過）
/test blue <feature>     # 03. 藍燈 - 重構改善品質
```

### 參數說明

- `<phase>`: `map` | `red` | `green` | `blue`
- `<feature>`: feature 檔案名稱或編號（如 `01` 或 `01-使用者登入`）

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

- [mapping-rules.md](mapping-rules.md) - 架構盤點規則（map）
- [red-phase.md](red-phase.md) - 紅燈階段規則（red）
- [green-phase.md](green-phase.md) - 綠燈階段規則（green）
- [blue-phase.md](blue-phase.md) - 藍燈階段規則（blue）

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

---

## quickpickle Step Definition 語法

```typescript
// test/bdd/steps/commands/auth.ts
import { When } from 'quickpickle'
import type { TestWorld } from '../../helpers/world'

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
