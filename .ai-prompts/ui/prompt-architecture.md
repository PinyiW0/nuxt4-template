# UI Prompt 架構總覽

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
| 1 | `/feature-to-ui` Phase 0 | `ui-config-pm.yaml` + 所有 `*.dsl.feature` | `ui-config.yaml`（同步）+ `route-map.yaml`¹（含 `api_contract.types` + `api_contract.endpoints` + `enabled_features`）+ `app/types/api/*.ts`² + 功能清單（sync：`docs/sync-report.md`） |
| 2 | `/feature-to-ui` Phase 1 | `app/types/api/*.ts`²（Phase 0 已建立）+ `route-map.yaml > api_contract.endpoints` + `enabled_features` + `ui-config.yaml > testAccounts` + `rules.md [P1]` | `server/mock/data/*.ts` + `server/api/**/*.ts` |
| 3 | `/feature-to-ui` Phase 2 | `ui-config.yaml > theme.colors` + `project` + `meta` | `assets/css/main.css` + `app.config.ts` + `nuxt.config.ts`（SEO head） |
| 4 | `/feature-to-ui` Phase 3 | `route-map.yaml` + `.flow.md`（若存在）+ `rules.md [P3]` | `pages/*.vue`（空殼，含 testid） |
| 5 | `/feature-to-ui` Phase 4 | `route-map.yaml > routes` + `ui-config.yaml > responsive.sidebar` + `rules.md [P4]` | `layouts/*.vue` + 更新 `app.vue` |
| 6 | `/feature-to-ui` Phase 5 | `ui-config.yaml` 的 `table`、`delete` 區塊³ + `enabled_features` + `features.md`⁴ + `rules.md [P5]` | `components/common/*.vue`（含 additionalFeature 元件） |
| 7 | `/feature-to-ui` Phase 6 | `.dsl.feature` + `.flow.md` + `server/api/` + `types/api/` + `route-map.yaml > features_used` + `features.md`⁴ + `rules.md [P6]` | `pages/*.vue`（完整實作） |
| 8 | `/test` BDD | `.dsl.feature` | `test/bdd/steps/**/*.ts` + Service 實作 |
| 9 | `/test e2e setup` | — | `test/e2e/helpers/`（actions, fixtures） |
| 10 | `/test e2e spec` | `.flow.md` + `_common.flow.md` | `test/e2e/specs/*.spec.ts` |
| 11 | `/test e2e red/green` | `.spec.ts` + 執行結果 | 診斷報告 / 修復 UI+mock+spec |
| 12 | `/test unit` | 程式碼檔案 | `test/unit/**/*.test.ts` 或 `test/nuxt/**/*.test.ts` |

> ¹ **API 合約快照**：持久化在 `route-map.yaml > api_contract` 中，包含：`response_conventions`（回傳格式）、`types`（型別欄位快照，作為 Sync diff 基準，程式碼層面的 SSoT 仍是 `app/types/api/*.ts`）、`endpoints`（方法 + 路徑 + Request/Response）。
>
> ² **API 合約型別**：Phase 0 直接產出 `app/types/api/*.ts`（TypeScript 原始碼），作為 mock data、API endpoint、頁面三層的合約依據。Phase 1 讀取這些型別檔驗證並建立 Mock API，不再從 YAML 翻譯型別。
>
> ³ **`table`、`delete` 區塊**：`ui-config.yaml` 中的兩個設定區塊。`table` — 表格設定（每頁筆數等）；`delete` — 刪除確認對話框設定（標題、按鈕文字等）。Phase 5 讀取這些設定來建立共用元件（ListContainer、ConfirmModal 等）。
>
> ⁴ **`features.md`**：定義 `additionalFeatures` 各功能（charts、dragAndDrop、richTextEditor 等）的套件、元件模板、使用方式。僅 `enabled_features` 有啟用時 Phase 5/6 才需讀取。

---

## 核心文件角色（Single Source of Truth）

| 文件 | 角色 | 來源 | 消費者 |
|------|------|------|--------|
| `*.dsl.feature` | 業務規格 | 外部提供 | `/feature-to-ui`、`/test` BDD |
| `*.flow.md` + `*.elements.md` | testid + 操作流程 | 外部提供 | `/feature-to-ui` Phase 3/6、`/test e2e spec` |
| `route-map.yaml` | 路由↔功能對照 + API 合約索引 + 啟用功能 | `/feature-to-ui` Phase 0 | `/feature-to-ui` Phase 1-6 |
| `app/types/api/*.ts` | API 合約型別（single source of truth） | `/feature-to-ui` Phase 0 | `/feature-to-ui` Phase 1、Phase 6 |
| `rules.md` | 跨 Phase 共用規則（以 `[Px]` tag 標注適用 Phase） | 工程師 | 各 Phase 按 tag 選擇性載入 |
| `features.md` | additionalFeatures 的元件模板 + 使用方式 | 工程師 | Phase 5（建元件）、Phase 6（用元件） |

### `.flow.md` 使用規則

- 若 `.flow.md` 存在 → 必須以它為準，testid 不能自行命名
- 若 `.flow.md` 不存在 → 可依 `rules.md` 命名規則自行定義 testid
- Phase 6 實作每個功能前，強制讀取對應的 `.flow.md` 和 `_common.flow.md`

## 設定檔分工

| 文件 | 填寫者 | 用途 | 消費者 |
|------|--------|------|--------|
| `ui-config-pm.yaml` | PM | 品牌色彩、SEO/Meta、UX 偏好、測試帳號、額外功能需求 | Phase 0 讀取後同步到 ↓ |
| `ui-config.yaml` | 工程師 / AI | 技術細節、CSS 配置、組件設定 | Phase 1-6 全部讀取此檔 |

---

## 情境與使用時機

### 情境 A：新建專案（從零開始）

> 前提：已取得所有 `.dsl.feature` 和 `.flow.md`，放入對應目錄。

```
1. PM 填寫 ui-config-pm.yaml
2. /feature-to-ui               → Phase 0 → 1 → 2 → 3 → 4 → 5 → 6（逐一）
3. /test e2e setup              → Playwright 基礎架構
4. /test e2e spec               → *.spec.ts（逐一）
5. /test e2e green              → 紅綠燈修復
6. /test BDD pipeline           → Service 層（可與 3-5 並行）
7. /test unit auto              → 單元測試補足覆蓋
```

### 情境 B：新增功能（已有專案，透過 Sync 模式）

> 外部提供新的 `.dsl.feature` + `.flow.md`，放入對應目錄後執行 Sync。

```
1. 將新的 .dsl.feature 放入 docs/gherkin-spec/features/
2. 將新的 .flow.md 放入 docs/e2e-flows/
3. /feature-to-ui 0               → Phase 0 sync 偵測「新增」→ 產出 sync-report.md
4. /feature-to-ui 1               → 增量：建立新型別 + 新端點
5. /feature-to-ui 3               → 增量：建立新路由骨架
6. /feature-to-ui 6               → build 模式：實作新頁面
7. /test e2e spec <feature>       → 生成 E2E 測試
8. /test e2e green <feature>      → 修復至通過
9. /test unit pipeline <target>   → 新程式碼的單元測試
```

> Phase 2/5 在 sync-report 的「Phase 執行建議」通常標記為「跳過」。**Phase 4 只要有新增路由就必須執行**（加入 sidebar 導航），與 Phase 3 觸發條件相同。

### 情境 C：修改既有功能（透過 Sync 模式）

> 外部更新既有的 `.dsl.feature`（+ `.flow.md` 若操作流程有變），覆蓋原檔後執行 Sync。

```
1. 用更新後的 .dsl.feature 覆蓋原檔（欄位調整、Scenario 修改等）
2. 若操作流程有變，同步更新 .flow.md
3. /feature-to-ui 0               → Phase 0 sync 偵測變更程度（patch / rebuild）
4. /feature-to-ui 1               → 增量：更新受影響的型別和端點
5. /feature-to-ui 6               → patch（小改）或 rebuild（大改）受影響頁面
6. /test e2e spec <feature>       → 重新生成受影響的 E2E 測試
7. /test e2e green <feature>      → 修復至通過
```

> **patch vs rebuild** 由 Phase 0 根據機械式規則判定（欄位增減數、Scenario 新增/刪除等），不是 AI 猜測。

### 情境 D：修 Bug

#### 決策流程

```
Bug 出現
  ├─ 業務規則本身錯了？            → D1（請外部修正 .feature，從 Phase 0 sync 開始）
  ├─ 操作流程/testid 定義錯了？    → D2（請外部修正 .flow.md，或直接手改）
  ├─ UI 畫面/邏輯問題？           → D3（直接改 Vue — hotfix）
  ├─ Mock 資料或 API 有誤？       → D4（改 server/api/ — hotfix）
  ├─ AI 每次產出都有同樣問題？      → D5（改 Skill 規範）
  └─ 主題/設定不符預期？           → D6（改 yaml 設定檔）
```

#### 各子情境詳細

| 子情境 | 問題根源 | 該做什麼 | 不需要做 |
|--------|---------|---------|---------|
| **D1. 規格錯誤** | `.feature` 寫錯業務規則 | 請外部修正 `.feature` → 覆蓋原檔 → **從 Phase 0 sync 開始**（偵測 feature 變更 → 增量更新型別/端點/頁面） | — |
| **D2. Flow/testid 錯誤** | `.flow.md` 操作流程或 testid 不正確 | 請外部修正或手動修 `.flow.md` / `*.elements.md` → 重跑 `/feature-to-ui 6` → 重跑 `/test e2e spec` | — |
| **D3. UI 實作 Bug** | 頁面邏輯/樣式/元件問題 | 直接修改 Vue 檔案，或 `/test e2e green` 自動修復 | 不需動 feature/flow/prompt |
| **D4. Mock API 不正確** | 測試資料或 API 端點問題 | 直接修 `server/api/` 或 `types/api/`，或重跑 `/feature-to-ui 1` | 不需動 feature/flow |
| **D5. Prompt/Skill 需調整** | AI 產出品質不佳、規範不足 | 修改 `.claude/skills/*/` 下的 `.md` 規範檔（rules.md、phase-*.md、components.md 等） | 不需重跑指令（下次執行自動吃到新規範） |
| **D6. 設定檔問題** | 色彩、Layout、表格等 UI 設定不對 | 修 `ui-config-pm.yaml` 或 `ui-config.yaml` → 重跑受影響的 Phase（色彩→P2、Layout→P4） | 不需動 feature/flow |

#### D3/D4 Hotfix 說明

D3（直接改 Vue）和 D4（直接改 API）屬於 **hotfix**：

- 下次 sync 時，若對應 feature 有變更，sync 會偵測到 content_hash 不同
- **patch 模式**：只改受影響部分，hotfix 中不相關的修改會保留
- **rebuild 模式**：整頁覆蓋，hotfix 修改會消失（**這是預期行為**）
- 若希望 hotfix 永久保留 → 正確做法是回推到外部修正 `.feature`（即 D1 流程）
