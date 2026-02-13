# 測試系統指南

## 目錄

- [架構總覽](#架構總覽)
- [三層測試覆蓋](#三層測試覆蓋)
- [Prompt 清單與用途](#prompt-清單與用途)
- [建議執行順序](#建議執行順序)
- [程式碼被修改後 — 該跑哪些測試？](#程式碼被修改後--該跑哪些測試)
- [測試失敗時 — 該修應用程式碼還是測試程式碼？](#測試失敗時--該修應用程式碼還是測試程式碼)
- [指令速查表](#指令速查表)
- [檔案結構](#檔案結構)

---

## 架構總覽

```
┌───────────────────────────────────────────────────────┐
│  E2E（使用者流程）— Playwright + Gherkin                │
│  驗證：完整 UI 操作流程                                  │
├───────────────────────────────────────────────────────┤
│  單元測試（個別單元）— Vitest                            │
│  驗證：API Handler / Store / Middleware / Page / Comp  │
├───────────────────────────────────────────────────────┤
│  BDD（業務規則）— Gherkin + quickpickle                 │
│  驗證：Service / Repository 的業務邏輯                   │
└───────────────────────────────────────────────────────┘
```

每層有各自的 TDD 流程（map → red → green → blue），互不重疊。

---

## 三層測試覆蓋

| 層級 | 測試對象 | 驗證重點 | 測試框架 | Vitest 專案 |
|------|---------|---------|---------|------------|
| **BDD** | Service、Repository | 業務規則（鎖定、狀態流轉） | Gherkin + quickpickle | `bdd` |
| **單元 A** | API Handler | HTTP 行為（狀態碼、參數驗證） | Vitest | `unit` |
| **單元 B** | Store | 狀態流轉（login→isAuthenticated） | Vitest | `nuxt` |
| **單元 C** | Middleware | 路由守衛分支 | Vitest | `nuxt` |
| **單元 D** | Page | computed、事件 handler | Vitest | `nuxt` |
| **單元 E** | Component | props、emit、互動 | Vitest | `nuxt` |
| **E2E** | 瀏覽器 UI | 完整使用者操作流程 | Playwright + Gherkin | `e2e` |

---

## Prompt 清單與用途

### 1. BDD 測試（Service 層）

| Prompt 檔案 | 階段 | 用途 |
|------------|------|------|
| `bdd/mapping.md` | **map** | 讀取 `.feature` 檔，盤點所需的 helpers 和 step definitions，產出 `.mapping.md` |
| `bdd/red.md` | **red** | 根據 mapping 生成 step definition 樣板（空函式），測試應失敗 |
| `bdd/green.md` | **green** | 最小實作讓測試通過，建立 helpers（service / repository） |
| `bdd/blue.md` | **blue** | 重構改善品質，消除重複、提升可讀性，測試持續通過 |
| `bdd/pipeline.md` | **自動化** | 定義 pipeline / batch / auto 三種批次模式的執行規則 |

### 2. E2E 測試（UI 層）

| Prompt 檔案 | 階段 | 用途 |
|------------|------|------|
| `e2e/setup.md` | **setup** | 首次建立 E2E 架構（helpers、hooks、selectors） |
| `e2e/mapping.md` | **map** | 盤點 feature 所需的頁面元素、testid、步驟 |
| `e2e/steps.md` | **red/green** | 生成並實作 step definitions（Playwright 操作） |

### 3. 單元測試

| Prompt 檔案 | 階段 | 用途 |
|------------|------|------|
| `unit/audit.md` | **audit** | 掃描所有可測檔案，按分類（A-E）列出清單 |
| `unit/scan.md` | **scan** | 針對單一檔案，推導測試案例 |
| `unit/red.md` | **red** | 生成測試樣板（空殼，測試失敗） |
| `unit/green.md` | **green** | 實作測試，讓測試通過 |

### 4. 理論參考文件

| 檔案 | 用途 |
|------|------|
| `docs/ut/01-Feature-to-測試樣板.md` | Gherkin → 測試樣板的翻譯規則 |
| `docs/ut/02-紅燈.md` | 紅燈理論（空介面設計） |
| `docs/ut/03-綠燈.md` | 綠燈理論（最小實作） |
| `docs/ut/04-重構.md` | 重構理論（SOLID 原則） |
| `docs/ut/handlers/*.md` | 各類 Handler 設計參考（Command、Query、Aggregate 等） |

---

## 建議執行順序

### 全新專案 — 從零開始

```
Step 1: BDD 測試（建立業務規則基礎）
  ├─ /test map <feature>       → 逐一盤點每個 feature
  ├─ /test red <feature>       → 生成 step 樣板
  ├─ /test green <feature>     → 實作 service/repository
  └─ /test blue <feature>      → 重構
  ⚡ 快速模式: /test pipeline <feature>  （一次跑完 map→red→green→blue）
  ⚡ 批次模式: /test batch 01 05         （連續處理 feature 01~05）
  ⚡ 全自動:   /test auto                （偵測未完成的 feature 自動處理）

Step 2: 單元測試（細粒度覆蓋）
  ├─ /test unit audit           → 盤點所有可測檔案
  ├─ /test unit scan <target>   → 推導測試案例
  ├─ /test unit red <target>    → 生成測試樣板
  └─ /test unit green <target>  → 實作測試
  ⚡ 快速模式: /test unit pipeline <target>
  ⚡ 批次模式: /test unit batch A         （批次處理 API Handler）

Step 3: E2E 測試（端到端驗證）
  ├─ /test e2e setup            → 首次建立架構（只需一次）
  ├─ /test e2e map <feature>    → 盤點 UI 元素和步驟
  ├─ /test e2e red <feature>    → 生成 step 樣板
  └─ /test e2e green <feature>  → 實作 Playwright 測試
  ⚡ 快速模式: /test e2e pipeline <feature>
```

### 已有部分測試 — 接續開發

```
1. 先確認現狀
   /test auto --limit 0        → 列出所有未完成的 BDD feature
   /test unit audit             → 列出缺少測試的檔案

2. 補齊 BDD 測試
   /test auto --limit 3        → 自動處理 3 個未完成 feature

3. 補齊單元測試
   /test unit auto --limit 5   → 自動處理 5 個未測檔案

4. 補齊 E2E 測試
   /test e2e pipeline <feature>
```

### 新增功能時

```
1. 寫好 .feature 檔（Gherkin）

2. BDD 先行
   /test pipeline <新feature>

3. 實作完程式碼後，補單元測試
   /test unit pipeline <新檔案>

4. UI 完成後，補 E2E
   /test e2e pipeline <新feature>
```

### 程式碼被修改後 — 該跑哪些測試？

依修改範圍決定，**不需要每次都跑完三層**：

| 修改了什麼 | 該跑的測試 | 指令 |
|-----------|-----------|------|
| `server/services/*` | BDD → Unit → E2E | `test:run --project bdd` → `unit` → `test:e2e` |
| `server/api/*` | Unit → E2E | `test:run --project unit` → `test:e2e` |
| `app/stores/*` | Unit → E2E | `test:run --project nuxt` → `test:e2e` |
| `app/middleware/*` | Unit → E2E | `test:run --project nuxt` → `test:e2e` |
| `app/pages/*` | Unit → E2E | `test:run --project nuxt` → `test:e2e` |
| `app/components/*` | Unit → E2E | `test:run --project nuxt` → `test:e2e` |
| 多處大改 / 不確定 | **全跑（快→慢）** | `bdd` → `unit` → `nuxt` → `test:e2e` |

原則：**改哪裡跑哪裡，不確定就全跑，順序由快到慢。**

### 測試失敗時 — 該修應用程式碼還是測試程式碼？

| 失敗原因 | 修改對象 | 範例 |
|---------|---------|------|
| 業務邏輯改變（預期行為變了） | **測試程式碼** | 需求調整，原測試案例已不適用 |
| 業務邏輯 bug（非預期行為） | **應用程式碼** | Service 回傳值錯誤 |
| API 參數 / 回傳格式變了 | **測試程式碼** | 欄位重新命名，mock 資料需更新 |
| API 行為 bug | **應用程式碼** | 狀態碼錯誤、缺少驗證 |
| UI 缺少 `data-testid` | **應用程式碼** | 元件沒加 testid 屬性 |
| UI 行為不符合規格 | **應用程式碼** | 路由跳轉錯誤、資料沒顯示 |
| Playwright 操作邏輯錯誤 | **測試程式碼** | 選擇器寫錯、等待不足 |
| Gherkin 規格本身過時 | **Feature 檔案** | 需求已變更，`.feature` 需同步更新 |

判斷口訣：**測試是需求的唯一真相來源 — 先假設程式碼有問題，確認需求已變才改測試。**

---

## 指令速查表

### BDD 指令

| 指令 | 說明 |
|------|------|
| `/test map <feature>` | 架構盤點，產出 mapping.md |
| `/test red <feature>` | 紅燈：生成 step definition 樣板 |
| `/test green <feature>` | 綠燈：最小實作讓測試通過 |
| `/test blue <feature>` | 藍燈：重構改善品質 |
| `/test pipeline <feature>` | 一次跑完 map→red→green→blue |
| `/test batch <start> <end>` | 批次處理多個 feature |
| `/test auto [--limit N]` | 自動偵測並處理未完成 feature |

### 單元測試指令

| 指令 | 說明 |
|------|------|
| `/test unit audit [category]` | 盤點可測檔案（A-E 分類） |
| `/test unit scan <target>` | 掃描推導測試案例 |
| `/test unit red <target>` | 生成測試樣板 |
| `/test unit green <target>` | 實作測試 |
| `/test unit pipeline <target>` | 一次跑完 scan→red→green |
| `/test unit batch <category>` | 批次處理某分類 |
| `/test unit auto [--limit N]` | 自動偵測並處理 |

### E2E 指令

| 指令 | 說明 |
|------|------|
| `/test e2e setup` | 首次建立架構（只需執行一次） |
| `/test e2e map <feature>` | 盤點 UI 元素、testid |
| `/test e2e red <feature>` | 生成 step definition 樣板 |
| `/test e2e green <feature>` | 實作 Playwright 測試 |
| `/test e2e pipeline <feature>` | 一次跑完 map→red→green |

### 執行測試（終端機）

```bash
# BDD
npm run test:run -- --project bdd

# 單元測試
npm run test:run -- --project unit     # API Handler
npm run test:run -- --project nuxt     # Store/Page/Component

# E2E
npm run test:e2e                       # headless
npm run test:e2e:headed                # 有頭模式
npm run test:e2e:ui                    # Vitest UI

# Watch 模式
npm run test -- --project unit
npm run test -- --project bdd
```

---

## 檔案結構

```
.claude/skills/test/
├── SKILL.md                    # 測試系統總入口
├── bdd/
│   ├── mapping.md              # BDD map 階段規則
│   ├── red.md                  # BDD red 階段規則
│   ├── green.md                # BDD green 階段規則
│   ├── blue.md                 # BDD blue 階段規則
│   └── pipeline.md             # 批次執行規則
├── e2e/
│   ├── setup.md                # E2E 架構建立
│   ├── mapping.md              # E2E map 階段規則
│   └── steps.md                # E2E step 生成規則
└── unit/
    ├── audit.md                # 盤點規則
    ├── scan.md                 # 掃描規則
    ├── red.md                  # 紅燈規則
    └── green.md                # 綠燈規則

test/
├── bdd/
│   ├── helpers/                # BDD 測試輔助（service/repository）
│   ├── steps/                  # Step Definitions
│   │   ├── aggregate_given/    # Given：建立實體狀態
│   │   ├── aggregate_then/     # Then：驗證實體狀態
│   │   ├── commands/           # When：寫入操作
│   │   ├── query/              # When：讀取操作
│   │   ├── common_then/        # Then：通用驗證
│   │   └── readmodel_then/     # Then：查詢結果驗證
│   └── *.mapping.md            # 各 feature 盤點文件
├── e2e/
│   ├── helpers/                # E2E 輔助（selectors/fixtures）
│   ├── steps/                  # Playwright step definitions
│   └── features/               # .feature 檔案
└── unit/                       # 單元測試（待建立）

docs/ut/
├── 01-Feature-to-測試樣板.md   # Gherkin 翻譯規則
├── 02-紅燈.md                  # 紅燈理論
├── 03-綠燈.md                  # 綠燈理論
├── 04-重構.md                  # 重構理論
└── handlers/                   # Handler 設計參考
    ├── Command-Handler.md
    ├── Query-Handler.md
    ├── Aggregate-Given-Handler.md
    ├── Aggregate-Then-Handler.md
    ├── Success-Failure-Handler.md
    ├── ReadModel-Then-Handler.md
    └── Event-Then-Handler.md
```

---

## 核心設計原則

1. **TDD 紅綠藍**：紅燈（測試失敗）→ 綠燈（最小實作通過）→ 藍燈（重構）
2. **依賴注入**：測試和 Service 共用同一 Repository 實例
3. **不覆蓋既有 Step**：red 階段前先掃描現有步驟，只生成缺少的
4. **Step 使用中文**：Gherkin 步驟一律使用中文描述
5. **分層不重疊**：BDD 測業務規則、單元測個別行為、E2E 測使用者流程
