# BDD 測試指南

## 什麼是 BDD？

**BDD（Behavior-Driven Development，行為驅動開發）** 是一種以「業務行為」為核心的開發方法論。它用**自然語言**描述系統應有的行為，再將這些描述直接轉化為可執行的測試。

核心理念：**先寫行為規格（Gherkin），再讓測試驅動實作**。

---

## 在本專案中的定位

本專案採用**三層測試覆蓋**架構，BDD 位於最底層，負責驗證**純業務規則**：

```
┌─────────────────────────────────────────────────┐
│  E2E（使用者流程）— Playwright + Gherkin          │  ← 瀏覽器操作
├─────────────────────────────────────────────────┤
│  單元測試（個別單元）                              │  ← HTTP、Store、UI
│  ├─ API Handler：狀態碼、參數驗證                  │
│  ├─ Store：狀態流轉                               │
│  ├─ Middleware：路由守衛                           │
│  └─ Component：props、emit、互動                  │
├─────────────────────────────────────────────────┤
│  BDD（業務規則）— Gherkin + quickpickle           │  ← 純邏輯，無 UI/HTTP
└─────────────────────────────────────────────────┘
```

| 層級 | 測試什麼 | 測試環境 |
|------|---------|---------|
| **BDD** | Domain Service 的業務規則（登入鎖定、權限檢查等） | Node（純記憶體） |
| **單元測試** | 各程式碼單元（API Handler、Store、Page） | Node / Nuxt |
| **E2E** | 完整使用者操作流程 | Node + Chromium |

---

## 翻譯鏈

BDD 的核心概念是一條「翻譯鏈」，將業務需求轉化為可執行的測試：

```
Event Storming（事件風暴）
       ↓
DSL Gherkin（自然語言規格）    ← .feature 檔案
       ↓
Step Definitions（步驟定義）    ← TypeScript 測試程式碼
       ↓
Implementation（業務實作）      ← Service / Repository
```

---

## Gherkin 語法

Gherkin 是 BDD 使用的**領域特定語言（DSL）**，用接近自然語言的方式描述系統行為。

### 基本結構

```gherkin
Feature: 使用者登入

  Background:
    Given 系統中有以下使用者：
      | account | password | role   |
      | coach1  | pass123  | 管理者 |

  Rule: 正確的帳號密碼可以登入

    Example: 成功登入
      When 使用者以帳號 "coach1" 密碼 "pass123" 登入
      Then 操作成功
      And 系統回傳 Access Token

  Rule: 連續登入失敗 5 次會鎖定帳號

    Example: 第 5 次登入失敗後鎖定
      Given 使用者 "coach1" 已連續登入失敗 4 次
      When 使用者以帳號 "coach1" 密碼 "wrong" 登入
      Then 操作失敗
      And 帳號 "coach1" 被鎖定 15 分鐘
```

### 關鍵字說明

| 關鍵字 | 用途 | 對應概念 |
|--------|------|---------|
| **Feature** | 功能名稱 | 一個完整的業務功能 |
| **Background** | 共用前置條件 | 每個 Example 執行前都會跑 |
| **Rule** | 業務規則 | 描述一條明確的規則 |
| **Example** | 具體情境 | 一個可執行的測試案例 |
| **Given** | 前置條件 | 系統在什麼狀態下 |
| **When** | 觸發動作 | 使用者做了什麼操作 |
| **Then** | 預期結果 | 系統應該產生什麼結果 |
| **And** | 額外條件/結果 | 繼承前一個 Given/When/Then |

---

## Step Definition（步驟定義）

每一行 Gherkin 都對應一個 TypeScript 的 Step Definition：

```typescript
// test/bdd/steps/commands/auth.ts
import type { TestWorld } from '../../helpers/world'
import { When } from 'quickpickle'

When('使用者以帳號 {string} 密碼 {string} 登入', async (world: TestWorld, account: string, password: string) => {
  try {
    world.loginResult = world.authService.login({ account, password })
    world.operationResult = { success: true }
  }
  catch (error) {
    world.operationResult = { success: false, message: error.message }
  }
})
```

### 目錄結構與分類

```
test/bdd/
├── helpers/
│   └── world.ts              # TestWorld 類型（測試的共享狀態）
└── steps/
    ├── index.ts              # 匯入所有 step definitions
    ├── aggregate_given/      # Given → 建立實體初始狀態
    ├── commands/             # When → 寫入操作（建立、更新、刪除）
    ├── query/                # When → 讀取操作（查詢、列出）
    ├── common_then/          # Then → 通用驗證（成功/失敗/訊息）
    ├── aggregate_then/       # Then → 驗證實體狀態變化
    └── readmodel_then/       # Then → 驗證查詢回傳值
```

### 分類決策樹

```
Gherkin 語句
├── Given
│   ├── 描述初始資料狀態 → aggregate_given/
│   └── 描述已完成的動作 → commands/
├── When
│   ├── 寫入操作（修改狀態）→ commands/
│   └── 讀取操作（查詢資料）→ query/
└── Then
    ├── 成功/失敗/訊息 → common_then/
    ├── 驗證實體屬性 → aggregate_then/
    └── 驗證查詢結果 → readmodel_then/
```

---

## 紅-綠-藍（RGR）開發週期

BDD 遵循經典的三階段 TDD 循環：

### 🔴 紅燈（Red）— 先寫失敗的測試

**目標**：生成 Step Definition 樣板，測試必須**失敗**。

做什麼：
1. 解析 `.feature` 檔案中的 Gherkin 語句
2. 掃描現有的 Step Definition（避免覆蓋）
3. 生成缺少的 Step Definition 樣板
4. 每個步驟內部用 `throw new Error('紅燈階段：尚未實作')` 佔位

```typescript
When('使用者以帳號 {string} 密碼 {string} 登入', async (world: TestWorld, account: string, password: string) => {
  // TODO: [事件風暴部位: Command - login]
  throw new Error('紅燈階段：尚未實作')
})
```

驗證：執行測試，所有新步驟都應該**失敗**。

### 🟢 綠燈（Green）— 最小實作讓測試通過

**目標**：用**最少量**的程式碼讓測試通過。

核心原則：
- **最小增量**：只寫測試要求的程式碼，不多做
- **Trial-and-Error**：執行→失敗→修正→再執行，一步步推進
- **允許醜陋**：hardcode、簡單 if-else 都可以，只求「能動」
- **依賴注入**：Service 必須透過建構子注入 Repository

```typescript
// Repository（資料存取，記憶體模擬）
export function createUserRepository() {
  const users = new Map()
  return {
    save(user) { users.set(user.account, user) },
    findByAccount(account) { return users.get(account) },
  }
}

// Service（業務邏輯，注入 Repository）
export function createAuthService({ userRepository }) {
  return {
    login({ account, password }) {
      const user = userRepository.findByAccount(account)
      if (!user || user.password !== password)
        throw new Error('帳號或密碼錯誤')
      return { accessToken: 'token', refreshToken: 'refresh' }
    }
  }
}
```

驗證：執行測試，所有測試都應該**通過**。

### 🔵 藍燈（Blue）— 重構改善品質

**目標**：在測試保護下重構，改善品質但**不改變行為**。

做什麼：
1. 清除所有 `TODO` 註記
2. 提取共用邏輯到 helpers
3. 改善命名、加入型別定義
4. 遵守 SOLID 設計原則
5. 消除重複邏輯、提取常數

**關鍵**：每次小改動後都執行測試，確保持續通過。如果紅了就回滾。

---

## 依賴注入的重要性

BDD 測試的核心架構原則是**依賴注入（DI）**，讓測試和 Service 共用同一個 Repository：

```typescript
// Step Definition 中：
Given('系統中有以下使用者：', async (world, dataTable) => {
  // 1. 建立 Repository
  world.userRepository = createUserRepository()

  // 2. 注入到 Service
  world.authService = createAuthService({
    userRepository: world.userRepository
  })

  // 3. 存入初始資料
  dataTable.hashes().forEach((row) => {
    world.userRepository.save(row)
  })
})

When('使用者以帳號 {string} 密碼 {string} 登入', async (world, account, password) => {
  // Service 內部使用的是同一個 Repository
  world.loginResult = world.authService.login({ account, password })
})

Then('登入失敗次數重置為 0', async (world) => {
  // 透過同一個 Repository 驗證狀態變化
  const user = world.userRepository.findByAccount(world.currentUser)
  expect(user.failedAttempts).toBe(0)
})
```

這樣 Given 存入的資料、When 操作的資料、Then 驗證的資料，全部來自同一個 Repository 實例。

---

## TestWorld（測試世界）

`TestWorld` 是測試的**共享狀態容器**，在同一個 Example 的 Given → When → Then 之間傳遞資料：

```typescript
export interface TestWorld extends QuickPickleWorld {
  // 服務實例（在 Given 中建立）
  userRepository: any
  authService: any

  // 操作結果（在 When 中設定）
  operationResult?: { success: boolean, message?: string }
  loginResult?: { accessToken: string, refreshToken: string }
  queryResult?: any

  // 當前上下文
  currentUser?: string
}
```

---

## 執行指令

### 單一階段執行

```bash
/test map <feature>      # 架構盤點：Gherkin → Step Definition 對應表
/test red <feature>      # 紅燈：生成 Step Definition 樣板
/test green <feature>    # 綠燈：最小實作讓測試通過
/test blue <feature>     # 藍燈：重構改善品質
```

### 自動化執行

```bash
/test pipeline <feature>       # 單一 feature 完整流程 (map→red→green→blue)
/test batch <start> <end>      # 批次處理指定範圍 (如 03 到 10)
/test auto [--limit N]         # 自動偵測並處理未完成的 features
```

### 測試執行

```bash
npm run test:run -- --project bdd                      # 執行所有 BDD 測試
npm run test:run -- --project bdd "docs/**/*.feature"  # 執行特定 feature
npm run test -- --project bdd                          # Watch 模式
```

---

## 使用的技術工具

| 工具 | 用途 |
|------|------|
| **quickpickle** | Gherkin → Vitest 整合（Step Definition 框架） |
| **Vitest** | 測試執行器 |
| **Gherkin** | 行為規格語言（`.feature` 檔案） |

---

## 與傳統單元測試的差異

| 項目 | BDD 測試 | 傳統單元測試 |
|------|---------|-------------|
| **語言** | 自然語言（Gherkin） | 程式碼（describe/it） |
| **視角** | 業務行為（使用者做了什麼，應該發生什麼） | 技術實作（函式輸入/輸出） |
| **測試對象** | Domain Service（業務規則） | 任意程式碼單元 |
| **可讀性** | 非技術人員也能讀懂 | 需要看懂程式碼 |
| **抽象層次** | 高（描述 What） | 低（描述 How） |

---

## 快速入門範例

假設你要測試「查詢球隊列表」這個功能：

### 1. 寫 Gherkin 規格

```gherkin
# docs/gherkin-spec/features/03-查詢球隊列表.feature

Feature: 查詢球隊列表

  Background:
    Given 系統中有以下球隊：
      | name   | createdBy |
      | 紅龍隊 | coach1    |
      | 藍鷹隊 | coach1    |

  Rule: 教練可以查看自己的球隊列表

    Example: 查詢到 2 支球隊
      When 教練查詢球隊列表
      Then 查詢結果應包含 2 筆球隊
```

### 2. 執行完整流程

```bash
/test pipeline 03
```

這會自動依序執行：
1. **MAP** — 分析 Gherkin，產出對應表
2. **RED** — 生成 Step Definition 樣板（測試失敗）
3. **GREEN** — 實作 Service/Repository（測試通過）
4. **BLUE** — 重構改善品質（測試持續通過）

---

## 總結

BDD 測試在本專案中的價值：

1. **業務規則的活文件** — `.feature` 檔案既是規格也是測試，永遠與實作同步
2. **驅動乾淨架構** — 強制使用依賴注入，Service 和 Repository 職責分明
3. **保護重構安全** — 藍燈階段在測試保護下重構，不怕破壞行為
4. **三層覆蓋互補** — BDD 測業務規則、單元測試測技術細節、E2E 測使用者流程
