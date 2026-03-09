# UI Prompt 架構總覽

> `/feature-to-ui` 的完整 Input/Output 對照、Phase 流程、資料流與使用情境。

---

## 端到端產出鏈

```
外部提供
  *.dsl.feature（業務規格）
  *.flow.md + *.elements.md（操作流程 + testid）
  ↓
  ├─→ /feature-to-ui (Phase 0-6)
  │     ├─ 首次（無 route-map.yaml）→ 全量模式 → 完整 UI
  │     └─ 後續（有 route-map.yaml）→ Sync 模式 → 變更報告 → 增量更新
  ├─→ /test e2e spec              → Playwright .spec.ts
  ├─→ /test BDD                   → Step Definitions + Service 實作
  └─→ PM/QA 確認
```

> **外部提供**：`.dsl.feature` 和 `.flow.md` 由外部流程（SDD 工具、團隊協作等）產出，放入 `docs/gherkin-spec/features/` 和 `docs/e2e-flows/` 後，即可執行後續 Skill。

---

## Input / Output 對照表

| # | Skill（指令） | Input | Output |
|---|--------------|-------|--------|
| 1 | `/feature-to-ui` Phase 0 | `ui-config-pm.yaml` + 所有 `*.dsl.feature` | `ui-config.yaml`（同步）+ `route-map.yaml`¹ + `app/types/api/*.ts`² + 功能清單（sync：`docs/sync-report.md`） |
| 2 | `/feature-to-ui` Phase 1 | `app/types/api/*.ts`² + `route-map.yaml > endpoints` + `testAccounts` + `rules.md [P1]` | `server/mock/data/*.ts` + `server/api/**/*.ts` |
| 3 | `/feature-to-ui` Phase 2 | `ui-config.yaml > theme.colors` + `project` + `meta` | `assets/css/main.css` + `app.config.ts` + `nuxt.config.ts`（SEO head） |
| 4 | `/feature-to-ui` Phase 3 | `route-map.yaml` + `.flow.md`（若存在）+ `rules.md [P3]` | `pages/*.vue`（空殼，含 testid） |
| 5 | `/feature-to-ui` Phase 4 | `route-map.yaml > routes` + `ui-config.yaml > responsive.sidebar` + `rules.md [P4]` | `layouts/*.vue` + 更新 `app.vue` |
| 6 | `/feature-to-ui` Phase 5 | `ui-config.yaml > table/delete` + `enabled_features` + `features.md`³ + `rules.md [P5]` | `components/common/*.vue`（含 additionalFeature 元件） |
| 7 | `/feature-to-ui` Phase 6 | `.dsl.feature` + `.flow.md` + `server/api/` + `types/api/` + `route-map.yaml > features_used` + `features.md`³ + `rules.md [P6]` | `pages/*.vue`（完整實作） |
| 8 | `/test` BDD | `.dsl.feature` | `test/bdd/steps/**/*.ts` + Service 實作 |
| 9 | `/test e2e setup` | — | `test/e2e/helpers/`（actions, fixtures） |
| 10 | `/test e2e spec` | `.flow.md` + `_common.flow.md` | `test/e2e/specs/*.spec.ts` |
| 11 | `/test e2e red/green` | `.spec.ts` + 執行結果 | 診斷報告 / 修復 UI+mock+spec |
| 12 | `/test unit` | 程式碼檔案 | `test/unit/**/*.test.ts` 或 `test/nuxt/**/*.test.ts` |

> ¹ **API 合約快照**：持久化在 `route-map.yaml > api_contract`，包含 `response_conventions`（回傳格式）、`types`（欄位快照，Sync diff 基準）、`endpoints`（方法+路徑+Request/Response）。程式碼層面的 SSoT 仍是 `app/types/api/*.ts`。
>
> ² **API 合約型別**：Phase 0 直接產出 `app/types/api/*.ts`（TypeScript 原始碼），Phase 1 讀取這些型別檔驗證並建立 Mock API，不再從 YAML 翻譯型別。
>
> ³ **`features.md`**：定義 `additionalFeatures` 各功能（charts、dragAndDrop 等）的套件、元件模板。僅 `enabled_features` 有啟用時才需讀取。

---

## 資料流

```
                    ┌────────────────────────────────────────┐
                    │           外部輸入                      │
                    │  *.dsl.feature   *.flow.md              │
                    │  ui-config-pm.yaml                      │
                    └──────┬────────────┬─────────────────────┘
                           │            │
                    ┌──────▼────────────▼─────────────────────┐
                    │  Phase 0: 準備工作                       │
                    │  產出: route-map.yaml                    │
                    │       app/types/api/*.ts                 │
                    │       ui-config.yaml（同步）              │
                    │       [sync: sync-report.md]             │
                    └──┬───────┬────────┬─────────────────────┘
                       │       │        │
          ┌────────────▼┐  ┌──▼─────┐  ┌▼───────────────────┐
          │  Phase 1    │  │Phase 2 │  │ Phase 3            │
          │  Mock API   │  │色彩主題  │  │ 路由骨架            │
          │  server/    │  │main.css│  │ pages/*.vue 空殼    │
          │  api/ mock/ │  │app.cfg │  │                    │
          └─────────────┘  └────────┘  └────────────────────┘
                                                   │
                    ┌────────────────────────┐     │
                    │  Phase 4: Layout       │     │
                    │  layouts/*.vue         │     │
                    │  app.vue 更新           │     │
                    └────────────────────────┘     │
                                                   │
                    ┌────────────────────────┐     │
                    │  Phase 5: 共用元件      │     │
                    │  components/common/    │     │
                    └───────────┬────────────┘     │
                                │                  │
                    ┌───────────▼──────────────────▼──────────┐
                    │  Phase 6: 頁面實作                       │
                    │  讀取: feature + flow + API + type      │
                    │       + 共用元件 + store                 │
                    │  產出: pages/*.vue（完整功能）            │
                    └─────────────────────────────────────────┘
```

---

## 核心文件角色（Single Source of Truth）

| 文件 | 角色 | 產出者 | 消費者 |
|------|------|--------|--------|
| `*.dsl.feature` | 業務規格 | 外部提供 | Phase 0（分析）、Phase 6（實作）、`/test BDD` |
| `*.flow.md` + `*.elements.md` | testid + 操作流程 | 外部提供 | Phase 3/6（testid）、`/test e2e spec` |
| `route-map.yaml` | 路由↔功能對照 + API 合約索引 + 啟用功能 | Phase 0 | Phase 1-6 全部 |
| `app/types/api/*.ts` | API 合約型別（SSoT） | Phase 0 | Phase 1（建 mock）、Phase 6（import 型別） |
| `sync-report.md` | 變更報告 + Phase 執行建議 | Phase 0 Sync | Phase 1/3/6（增量決策） |
| `rules.md` | 跨 Phase 共用規則 | 工程師維護 | 各 Phase 按 `[Px]` tag 載入 |
| `ui-config.yaml` | UI 技術設定 | Phase 0 同步 + 工程師 | Phase 1-6 全部 |

### `.flow.md` 使用規則

- `.flow.md` **存在** → testid 必須以它為準，不能自行命名
- `.flow.md` **不存在** → 依 `rules.md` 命名規則自行定義
- Phase 6 實作每個功能前，**強制讀取**對應的 `.flow.md` 和 `_common.flow.md`

---

## 設定檔分工

| 文件 | 填寫者 | 用途 | 消費者 |
|------|--------|------|--------|
| `ui-config-pm.yaml` | PM | 品牌色彩、SEO/Meta、UX 偏好、測試帳號、額外功能需求 | Phase 0 讀取後同步到 ↓ |
| `ui-config.yaml` | 工程師 / AI | 技術細節、CSS 配置、組件設定 | Phase 1-6 全部讀取此檔 |

### PM → 工程師 同步對照

| PM yaml 欄位 | 轉換 | ui-config.yaml 欄位 |
|-------------|------|---------------------|
| `project.name` | 直接複製 | `project.name` |
| `project.description` | 直接複製 | `project.description` |
| `project.locale` | 直接複製 | `project.locale` |
| `theme.colors.*` | hex 覆蓋，空值保留 | `theme.colors.*` |
| `colorMode.default` | 直接複製 | `colorMode.default` |
| `colorMode.enableToggle` | 直接複製 | `colorMode.enabled` |
| `toast.displaySeconds` | ×1000 | `toast.duration` |
| `toast.position`（中文） | 翻譯為英文 | `toast.position` |
| `table.itemsPerPage` | 直接複製 | `table.pagination.defaultPageSize` |
| `deleteConfirmation.*` | 直接複製 | `delete.confirmation.*` |
| `testAccounts` | 直接複製 | `testAccounts` |
| `additionalFeatures.*` | 直接複製 | `additionalFeatures.*.required` |

---

## Phase 詳細流程

### Phase 0: 準備工作

| 項目 | 內容 |
|------|------|
| **模式判斷** | `route-map.yaml` 不存在 → 全量；存在 → [Sync 模式](#sync-模式增量更新) |
| **Input** | `ui-config-pm.yaml` + 所有 `*.dsl.feature` |
| **Output** | `ui-config.yaml`（同步）、`route-map.yaml`、`app/types/api/*.ts`；Sync 另產 `sync-report.md` |
| **規範檔** | `phase-0-prep.md`（全量）、`phase-0-sync.md`（Sync） |

**全量模式步驟：**

1. 讀取 PM 設定，同步到 `ui-config.yaml`
2. 掃描所有 `.dsl.feature`，提取實體、欄位、操作
3. 產出功能清單（含 DSL Command 類型判斷）
4. 規劃路由結構（路由 + Layout + API 端點）
5. **直接建立** `app/types/api/*.ts`（snake_case、日期用 string、每資源一檔 + index.ts）
6. 產生 `route-map.yaml`（含 API 合約快照、content_hash、啟用功能）
7. 自檢 checklist（7 項）→ 詢問確認

**route-map.yaml 結構：**

```yaml
generated_at: "2026-01-20"
version: 1
enabled_features: [charts, dragAndDrop]

api_contract:
  response_conventions:     # list / single / action / error 回傳格式
  types:                    # 型別欄位快照（Sync diff 基準）
  endpoints:                # method + path + request + response

routes:
  - path: "/teams"
    page: "app/pages/teams/index.vue"
    layout: "default"
    features:
      - file: "03-查詢球隊列表.dsl.feature"
        content_hash: "a1b2c3d4"       # Sync 比對用
    api_endpoints: ["GET /api/teams"]
    components: ["PageHeader", "ListContainer"]
    store: null
    features_used: []
```

---

### Phase 1: Mock API

| 項目 | 內容 |
|------|------|
| **Input** | `app/types/api/*.ts` + `route-map.yaml > endpoints` + `testAccounts` |
| **Output** | `server/mock/data/*.ts` + `server/api/**/*.ts` |
| **規範檔** | `phase-1-mock-api.md` + `rules.md [P1]` |

**關鍵規則：**

- 列表 Mock 資料 ≥ 11 筆（測分頁）、關聯 ≥ 3 筆、下拉 ≥ 3 項
- 回傳格式嚴格符合 `types/api/` 定義
- **禁止 `.map()` 轉換** — 直接回傳 mock data（四層對齊：types → mock → API → 頁面）
- event 標 `H3Event`，陣列索引用 `!` 斷言

---

### Phase 2: 基礎設定

| 項目 | 內容 |
|------|------|
| **Input** | `ui-config.yaml > theme.colors` + `project` + `meta` |
| **Output** | `assets/css/main.css` + `app.config.ts` + `nuxt.config.ts`（SEO） |
| **規範檔** | `phase-2-theme.md` |

**色彩翻譯規則：**

| ui-config.yaml 值 | main.css | app.config.ts |
|-------------------|----------|---------------|
| `"#hex"` | `@theme static { --color-{名稱}-50~950 }` | `'{語義色名}'` |
| `"名稱"` (如 `"red"`) | 不產生 CSS | `'{Tailwind 色名}'` |
| `""` (空值) | 不產生 CSS | 預設 Tailwind 內建色 |

**空值預設：** primary→green、success→green、warning→amber、error→red、info→blue

---

### Phase 3: 路由骨架

| 項目 | 內容 |
|------|------|
| **Input** | `route-map.yaml` + `.flow.md`（若存在） |
| **Output** | `pages/*.vue`（空殼，含 testid + definePageMeta） |
| **規範檔** | `phase-3-skeleton.md` + `rules.md [P3]` |

根路由 `/` **必建**（Phase 6 填入 `navigateTo` 重導向）。

---

### Phase 4: Layout 建置

| 項目 | 內容 |
|------|------|
| **Input** | `route-map.yaml > routes` + `ui-config.yaml > responsive.sidebar` |
| **Output** | `layouts/*.vue` + 更新 `app.vue` |
| **規範檔** | `phase-4-layout.md` + `rules.md [P4]` |

**app.vue 條件式更新：** 有 Layout → 加 `<NuxtLayout>`；無 Layout → 只有 `<NuxtPage />`。

---

### Phase 5: 共用元件

| 項目 | 內容 |
|------|------|
| **Input** | `ui-config.yaml > table/delete` + `enabled_features` + `features.md` |
| **Output** | `components/common/*.vue` |
| **規範檔** | `phase-5-components.md` + `components.md` + `features.md` + `rules.md [P5]` |

**固定產出：** ListContainer、ConfirmModal、PageHeader、EmptyState

**額外功能（依 enabled_features）：** ChartWrapper、DraggableList、RichTextEditor、DateRangePicker、FileUpload、InfiniteScroll

---

### Phase 6: 頁面實作

| 項目 | 內容 |
|------|------|
| **Input** | `.dsl.feature` + `.flow.md` + API + types + 共用元件 + store |
| **Output** | `pages/*.vue`（完整功能） |
| **規範檔** | `phase-6-pages.md` + `page-builder.md` + `components.md` + `features.md` + `rules.md [P6]` |

**每個功能的流程：**

1. 讀取 `.dsl.feature` → 分析欄位、驗證規則、錯誤訊息
2. **強制前置讀取**：`glob server/api/**/*.ts` → 讀取 types、共用元件、store、`.flow.md`
3. **產出 Feature → UI 對照表**（code review checklist）
4. 實作頁面
5. **功能覆蓋驗證** → **規範合規檢查** → `npx nuxi typecheck`
6. 詢問確認 → 下一個功能

**DSL Command → UI 元件對照（page-builder.md）：**

| DSL 關鍵字 | UI 元件 |
|-----------|--------|
| `登入` | 表單 + 密碼眼睛 icon |
| `建立 XXX` | 表單 + Modal |
| `編輯 XXX` | 表單（預填） |
| `刪除 XXX` | 確認 Modal |
| `查詢 XXX 列表` | UTable + **必須有搜尋框** |
| `排序 XXX` | vuedraggable |
| `篩選 XXX` | USelect |
| `批次刪除` | UTable checkbox + 批次按鈕 |
| `匯出 XXX` | UButton（下載觸發） |

---

## Sync 模式（增量更新）

### 觸發條件

`docs/route-map.yaml` **存在** → 自動進入 Sync 模式

### 變更偵測流程

```
讀取現有 route-map.yaml
  ↓
掃描新版 *.dsl.feature
  ↓
逐一比對 content_hash
  ├─ 不存在於 route-map → 「新增」(build)
  ├─ hash 不同 → 判定變更程度 → patch 或 rebuild
  ├─ hash 相同 → 「無變化」(skip)
  └─ route-map 有但檔案不存在 → 「刪除」(delete)
  ↓
推導下游影響（types → API → 頁面）
  ↓
產出 sync-report.md + 更新 route-map.yaml
```

### 變更程度判定（機械式 Checklist）

遇到即停止，不繼續往下判斷：

| # | 條件 | 判定 |
|---|------|------|
| 1 | 端點路徑有變更 | **rebuild** |
| 2 | 全新 Command 類型（如新增「排序」） | **rebuild** |
| 3 | 欄位增減 > 2 | **rebuild** |
| 4a | 新增 Scenario — 欄位驗證型 | **patch** |
| 4b | 新增 Scenario — 新功能型 | **rebuild** |
| 5 | 僅措辭/數值微調 | **patch** |

### Phase 執行建議的強制規則

| Phase | 觸發條件 | 未觸發 |
|-------|---------|--------|
| Phase 1 | 型別或端點有任何新增/修改 | 跳過 |
| Phase 2 | 設定變更到 `theme.colors`、`project`、`meta` | 跳過 |
| Phase 3 | 路由有新增 | 跳過 |
| **Phase 4** | **路由有新增** 或設定變更到 `sidebar` | 跳過 |
| Phase 5 | 新路由需未建立的共用元件，或 `table`/`delete` 設定變更 | 跳過 |
| Phase 6 | 頁面實作指令有 build/patch/rebuild | 跳過 |

### Phase 6 增量模式

| 模式 | 觸發 | 行為 |
|------|------|------|
| **build** | 新增 feature | 完整走 build 流程 |
| **patch** | 小幅修改 | 用 Edit tool 局部修改（定位失敗 → 自動升級為 rebuild） |
| **rebuild** | 大幅變更 | 讀取舊程式碼風格 → 整檔覆蓋 |
| **delete** | feature 被刪除 | 向用戶確認 → 刪除檔案 + 清理 route-map |

---

## 使用情境

### 情境 A：新建專案（全量模式）

> 前提：所有 `.dsl.feature` 和 `.flow.md` 已放入對應目錄。

```
1. PM 填寫 ui-config-pm.yaml
2. /feature-to-ui               → Phase 0 → 1 → 2 → 3 → 4 → 5 → 6（逐一）
3. /test e2e setup              → Playwright 基礎架構
4. /test e2e spec               → *.spec.ts（逐一）
5. /test e2e green              → 紅綠燈修復
6. /test BDD pipeline           → Service 層（可與 3-5 並行）
7. /test unit auto              → 單元測試補足覆蓋
```

### 情境 B：新增功能（Sync — build）

```
1. 將新 .dsl.feature 放入 docs/gherkin-spec/features/
2. 將新 .flow.md 放入 docs/e2e-flows/
3. /feature-to-ui 0               → sync 偵測「新增」→ sync-report.md
4. /feature-to-ui 1               → 增量：新型別 + 新端點
5. /feature-to-ui 3               → 增量：新路由骨架
6. /feature-to-ui 6               → build 模式：實作新頁面
7. /test e2e spec <feature>       → 生成 E2E 測試
```

> Phase 2/5 通常跳過。**Phase 4 只要有新路由就要執行**（補 sidebar 導航）。

### 情境 C：修改既有功能（Sync — patch / rebuild）

```
1. 用更新後的 .dsl.feature 覆蓋原檔
2. 若操作流程有變，同步更新 .flow.md
3. /feature-to-ui 0               → sync 偵測變更程度（patch / rebuild）
4. /feature-to-ui 1               → 增量：受影響型別 + 端點
5. /feature-to-ui 6               → patch（小改）或 rebuild（大改）
6. /test e2e spec <feature>       → 重新生成 E2E 測試
```

> patch vs rebuild 由 Phase 0 的機械式 checklist 判定，不是 AI 猜測。

### 情境 D：修 Bug

```
Bug 出現
  ├─ D1. 業務規則錯了      → 修 .feature → Phase 0 sync 開始
  ├─ D2. testid 錯了      → 修 .flow.md → 重跑 Phase 6
  ├─ D3. UI 畫面 Bug      → 直接改 Vue（hotfix）
  ├─ D4. Mock API 有誤    → 直接改 server/api/（hotfix）
  ├─ D5. AI 產出品質差     → 修 Skill 規範（rules.md 等）
  └─ D6. 設定不符預期      → 修 yaml → 重跑受影響 Phase
```

| 子情境 | 問題根源 | 該做什麼 | 不需要做 |
|--------|---------|---------|---------|
| **D1** | `.feature` 寫錯業務規則 | 修正 `.feature` → Phase 0 sync → 增量更新 | — |
| **D2** | `.flow.md` 操作流程或 testid 不正確 | 修 `.flow.md` → 重跑 Phase 6 → 重跑 `/test e2e spec` | — |
| **D3** | 頁面邏輯/樣式/元件問題 | 直接改 Vue，或 `/test e2e green` 自動修復 | 不需動 feature/flow/prompt |
| **D4** | 測試資料或 API 端點問題 | 改 `server/api/` 或 `types/api/`，或重跑 Phase 1 | 不需動 feature/flow |
| **D5** | AI 產出品質不佳 | 修 `.claude/skills/*/` 的 `.md` 規範 | 不需重跑（下次自動吃到） |
| **D6** | 色彩、Layout 等設定不對 | 修 yaml → 重跑受影響 Phase | 不需動 feature/flow |

**Hotfix 注意：** D3/D4 修改在下次 sync 時，patch 模式會保留不相關修改，rebuild 模式會覆蓋（預期行為）。若要永久保留 → 回推修正 `.feature`（D1 流程）。

---

## 輸出結構

```
app/
├── app.vue                        # 根組件（UApp + NuxtLayout）
├── app.config.ts                  # 色彩主題映射
├── assets/css/main.css            # 自訂色階（@theme static）
├── types/api/                     # API 合約型別（SSoT）
│   ├── index.ts                   # 統一 re-export
│   ├── auth.ts
│   ├── teams.ts
│   └── ...
├── layouts/
│   ├── default.vue                # 主要 Layout（含 Sidebar）
│   └── auth.vue                   # 登入頁 Layout
├── components/common/
│   ├── PageHeader.vue
│   ├── ListContainer.vue
│   ├── ConfirmModal.vue
│   └── EmptyState.vue
├── pages/
│   ├── index.vue                  # 首頁（重導向）
│   ├── login.vue
│   └── ...                        # 功能頁面
└── stores/
    └── auth.ts                    # 認證 store

server/
├── mock/data/                     # Mock 資料
└── api/                           # API 端點

docs/
├── route-map.yaml                 # 路由對照表（Phase 0 產生）
└── sync-report.md                 # 變更報告（Sync 模式產生，用完可刪）
```
