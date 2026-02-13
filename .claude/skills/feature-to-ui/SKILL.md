---
name: feature-to-ui
description: 根據 .feature 檔搭配 NuxtUI 產生完整 UI 畫面（分階段：骨架優先，細節後填）
metadata:
  disable-model-invocation: true
  argument-hint: "[phase]"
  context: fork
  agent: general-purpose
---

# Feature to UI 工作流程

根據 .feature 規格檔，使用 NuxtUI 產生完整的前端介面。

## 使用方式

```bash
/feature-to-ui              # 從 Phase 0 開始
/feature-to-ui 0            # Phase 0: 準備工作（產出 route-map.yaml）
/feature-to-ui 1            # Phase 1: Mock API
/feature-to-ui 2            # Phase 2: 基礎設定
/feature-to-ui 3            # Phase 3: 路由骨架
/feature-to-ui 4            # Phase 4: Layout 建置
/feature-to-ui 5            # Phase 5: 共用元件
/feature-to-ui 6 [功能名]   # Phase 6: 頁面實作（指定功能）
```

## 現有 Feature 檔案

!`ls -1 docs/gherkin-spec/features/*.feature 2>/dev/null || echo "(無)"`

---

## Phase 概覽

| Phase | 名稱 | 輸出 | 必讀規範 |
|-------|------|------|----------|
| 0 | 準備工作 | 功能清單、路由規劃、**route-map.yaml** | [phase-0](phases/phase-0-prep.md) |
| 1 | Mock API | **types/api/**, server/mock/, server/api/ | [phase-1](phases/phase-1-mock-api.md) + [rules.md](rules.md) |
| 2 | 基礎設定 | app.config.ts, main.css | [phase-2](phases/phase-2-theme.md) + [style-presets.yaml](../../.ai-prompts/ui/style-presets.yaml) |
| 3 | 路由骨架 | 所有 pages/*.vue 空殼（含 testid） | [phase-3](phases/phase-3-skeleton.md) + [rules.md](rules.md) |
| 4 | Layout 建置 | layouts/*.vue | [phase-4](phases/phase-4-layout.md) + [rules.md](rules.md) + [responsive.md](responsive.md) |
| 5 | 共用元件 | components/common/*.vue | [phase-5](phases/phase-5-components.md) + [components.md](components.md) + [rules.md](rules.md) |
| 6 | 頁面實作 | 逐一填充 pages 內容 | [phase-6](phases/phase-6-pages.md) + [page-builder.md](page-builder.md) + [components.md](components.md) + [rules.md](rules.md) |

**設計理念**：骨架優先，細節後填。每個 Phase 只載入必要的規範，避免 context 過載。`types/api/` 作為 API 合約的單一真相來源，串接 mock data、API endpoint、頁面三層。`route-map.yaml` 作為路由與 feature 對照的單一真相來源。`.flow.md` 作為 testid 的單一真相來源。

---

## 必讀文件

### 核心規範（按需讀取）

- **[rules.md](rules.md)** - 共用規則權威來源（配色、類型、API、Pinia、testid、Layout 規範）
- **[phases/](phases/)** - 各 Phase 的執行步驟與模板（**每個 Phase 開始前讀取對應的 phase 檔**）
- [page-builder.md](page-builder.md) - DSL 解析 + 表單範本（Phase 6 需要）
- [components.md](components.md) - 元件使用規範（Phase 5, 6 需要）
- [responsive.md](responsive.md) - 響應式規範（Phase 4, 5, 6 需要）

### E2E 測試元素定義（Phase 3, 6 需要）

- `docs/e2e-flows/_common.flow.md` - 共用 testid 命名規則 + 共用步驟
- `docs/e2e-flows/pages/*.elements.md` - 各頁面的 testid 定義（**testid 的 single source of truth**）
- `docs/e2e-flows/*.flow.md` - 各功能的操作流程（Phase 6 參考）

> ⚠️ 以上檔案由 `/feature-to-flow` 產出。若不存在，表示尚未執行 flow 轉換，此時 Phase 3/6 仍可自行按 rules.md 命名規則定義 testid，但**若檔案存在則必須以 `.flow.md` 為準**。

### 專案設定

@.ai-prompts/ui/ui-config-pm.yaml（PM 設定）
@.ai-prompts/ui/ui-config.yaml（完整規範）

### NuxtUI 文檔

執行 `/nuxt-ui` 載入官方文檔（Phase 4, 5, 6 需要）

---

## 快速指引

### Phase 0-2：基礎建設

1. **Phase 0**：分析所有 .feature，產出功能清單、路由規劃、**route-map.yaml**
2. **Phase 1**：建立 Mock API 和測試資料
3. **Phase 2**：設定色彩主題（app.config.ts + main.css）

### Phase 3-5：架構骨架

4. **Phase 3**：建立所有頁面的空殼（只有 template 佔位）
5. **Phase 4**：建立 Layout（default.vue, auth.vue）
6. **Phase 5**：建立共用元件（ListContainer, ConfirmModal 等）

### Phase 6：功能實作

7. **Phase 6**：逐一實作每個頁面的完整功能

---

## 注意事項

- **每個 Phase 完成後都要詢問確認**
- **Phase 6 每個功能完成後都要詢問確認**
- **每個 Phase 開始時只讀取該 Phase 的 phase 檔 + rules.md**
- 禁止自行決定網站名稱、色彩等設定
- 所有設定從 `ui-config.yaml` 讀取
- Phase 1 必須先建 `types/api/` 合約型別
- Phase 6 禁止定義 local interface，必須 import `types/api/`
- Phase 6 每個功能必須先讀取 API 原始碼、共用元件、store
- **Phase 3/6 若 `docs/e2e-flows/pages/*.elements.md` 存在，testid 必須以該檔案為準**
- **Phase 6 若 `docs/e2e-flows/*.flow.md` 存在，必須先讀取以了解操作流程和 testid**
