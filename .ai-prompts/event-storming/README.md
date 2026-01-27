# Event Storming Workflow v7.0

將 PRD 文件轉換為 **DSL-Level Gherkin** 規格（Gherkin v6.x）。

## 版本更新

### v7.0 主要變更
- **簡化產出原則**：僅 `glossary.json`、`boundary-decisions.json`、`.feature` 為必須產出，其餘保留在對話記憶
- **分階段邊界問題確認**：Phase 1（Entity 層級）在 Stage 2 後確認，Phase 2（Field 層級）在 Stage 5 後確認
- **全域決策管理**：`globalDecisions` 支援跨 Epic 複用決策，避免重複確認
- **決策樹機制**：邊界決策自動觸發後續追問（如軟刪除→是否過濾查詢）
- **Hotspot 記錄**：在 Stage 7 視覺化時統一產出（若有需要）
- **Feature 依賴標籤**：用 `@requires`/`@publishes` 標籤取代 `feature-dependencies.json`
- **Policy-Rule 映射**：Stage 5 分析保留在對話記憶，直接用於 Stage 6
- **ErrorCode 多語系**：支援多語系訊息與 Gherkin 專用訊息
- **Background 使用準則**：明確定義何時使用 Background

### v6.0 變更（保留）
- **輸出層級調整**：產出 DSL-Level Gherkin，而非 ISA-Level
- DSL-Level 使用業務友善語言，無技術語法（`$`, `>`, `<`）
- 後續可透過專門流程轉換為 ISA-Level

### v5.0 變更（保留）
- Gherkin v6.x 語法：使用 `Example:` 取代 `Scenario:`，支援 `Rule:` 分組
- 強制邊界問題確認：Stage 6 前必須確認所有邊界問題
- 邊界決策記錄：決策存入 `_meta/boundary-decisions.json`

---

## 翻譯鏈定位

```
Event Storming → DSL-Level Gherkin → ISA-Level Gherkin → Test Code → Code
                 ^^^^^^^^^^^^^^^^
                 本流程產出層級
```

| 層級 | 職責 | 受眾 |
|------|------|------|
| **DSL-Level**（本流程） | 業務可讀的可執行規格 | 業務、QA、開發 |
| ISA-Level（後續轉換） | 技術可翻譯的精準規格 | 開發、AI |

---

## 支援的 AI 助手

| AI | 設定檔 | 觸發方式 |
|----|--------|----------|
| **GitHub Copilot** | `.github/copilot-instructions.md` | `do: <prd-file>` + `for: event storming` |
| **Claude Code** | `.claude/instructions.md` | `do: <prd-file>` + `for: event storming` |
| **Claude.ai** | 直接使用本目錄 prompts | 自然語言觸發 |

### 統一觸發語法

```
do: docs/user-stories/user-v1.md
for: event storming
```

可選參數：
- `epic: B` - 只處理指定的 Epic
- `mode: update` - 更新模式

---

## Pipeline 架構

```
Stage 0: PRD 解析 → 對話記憶
    |
Stage 1: 詞彙表建立 → glossary.json
    |
Stage 2: Feature 依賴分析 → 對話記憶（@requires/@publishes 標籤）
    |
+==========================+
| Phase 1 邊界問題確認      |  <-- Entity 層級
| - 刪除策略               |
| - 級聯處理               |
| - 名稱規則               |
| → boundary-decisions.json |
+==========================+
    |
[Per Epic Loop]
    Stage 3: Domain Events → 對話記憶
    Stage 4: Commands → 對話記憶
    Stage 5: Policies → 對話記憶
    |
    +==========================+
    | Phase 2 邊界問題確認      |  <-- Field 層級
    | - 唯一性範圍             |
    | - 數值範圍               |
    | → 更新 boundary-decisions |
    +==========================+
    |
    Stage 6: Gherkin (DSL) → ⭐ .feature 檔案（主要產出）
    |
+------------------+
| 完成報告          |
| - 覆蓋度摘要     |
| - Hotspot 列表   |
+------------------+
    |
Stage 7: PlantUML 視覺化（可選）→ _diagrams/*.puml
```

---

## Stage 說明

| Stage | 名稱 | 輸入 | 輸出 |
|-------|------|------|------|
| 0 | PRD Analyst | PRD markdown | 對話記憶（不產出檔案） |
| 1 | Glossary Manager | PRD 分析結果 | `_meta/glossary.json` |
| 2 | Feature Dependency Analyst | PRD 分析結果 | 對話記憶（用 @requires/@publishes 標籤） |
| 3 | Event Expert | Epic + glossary | 對話記憶（不產出檔案） |
| 4 | Command Expert | Events + glossary | 對話記憶（不產出檔案） |
| 5 | Policy Expert | Events + commands | 對話記憶（不產出檔案） |
| - | **邊界問題確認** | 對話記憶 | `_meta/boundary-decisions.json` |
| 6 | BDD Expert | 對話記憶 + decisions | `.feature` files (DSL) ⭐ 主要產出 |
| 7 | Visualizer | .feature + glossary | PlantUML diagrams, `_meta/terminology-mapping.md`（可選）|

---

## 邊界問題確認

在 Stage 6 之前，Facilitator 會強制詢問以下類型的邊界問題：

### 問題類型

1. **唯一性約束**：欄位在什麼範圍內需要唯一
2. **刪除策略**：軟刪除或硬刪除
3. **級聯處理**：刪除父項目時子項目如何處理
4. **名稱規則**：是否區分大小寫
5. **預設排序**：新建項目的預設排序方式
6. **數值範圍**：數值欄位的有效範圍

### 範例互動

```
---
邊界問題確認（Stage 6 前必須完成）

**回答方式**：
- 直接選擇：`Q1=A, Q2=B`
- 追問解釋：`Q1=?` 或 `Q1=?A`（我會解釋後等你確認）
- 自由輸入：`Q1=其他:你的描述`
- 複選題用逗號分隔：`Q3=A,B`

---

Q1: 球員的背號唯一性範圍？（單選）
- [ ] A) 在同一球隊內唯一（推薦）
- [ ] B) 全系統唯一
- [ ] C) 不需要唯一
- [ ] D) 其他：_______________

Q2: 刪除球隊時，其下的球員如何處理？（單選）
- [ ] A) 禁止刪除 - 必須先移除所有球員（推薦）
- [ ] B) 級聯刪除 - 一併刪除所有球員
- [ ] C) 孤立保留 - 球員保留但失去關聯
- [ ] D) 其他：_______________

請回答所有問題後繼續。
如需了解任何選項的詳細說明，請使用追問格式（如 `Q1=?A`）。
---
```

### 追問互動範例

```
使用者: Q1=?A

AI 回應:
---
**選項 A 詳細說明：在同一球隊內唯一**

**這個選項代表什麼？**
同一球隊內不能有兩個相同背號的球員，但不同球隊可以有相同背號。

**選擇這個選項後的行為**：
1. 新增球員時，系統檢查該球隊內是否已有相同背號
2. 不同球隊的球員可以使用相同背號（如：閃電隊 1 號、雷霆隊 1 號）
3. 球員轉隊時，若新球隊已有該背號，需要選擇新背號

**範例場景**：
- ✅ 閃電隊新增 1 號球員，雷霆隊也有 1 號球員 → 允許
- ❌ 閃電隊已有 1 號，再新增 1 號 → 拒絕

確認選擇 A 嗎？
---
```

---

## 輸出結構

### 簡化產出原則

v7.0 簡化了中繼檔案產出，僅保留必要的持久化檔案：

| 類別 | 檔案 | 說明 |
|------|------|------|
| **必須** | `glossary.json` | 跨 Epic 詞彙一致性 |
| **必須** | `boundary-decisions.json` | 避免重複決策 |
| **必須** | `*.feature` | ⭐ 主要產出 |
| 可選 | `terminology-mapping.md` | Stage 7 視覺化時產出 |
| 可選 | `*.puml` | Stage 7 視覺化時產出 |

**不產出檔案（保留在對話記憶）**：
- Stage 0 PRD 結構分析
- Stage 2 Feature 依賴（用 `@requires`/`@publishes` 標籤取代）
- Stage 3-5 Events/Commands/Policies 分析

### 目錄結構

```
docs/gherkin-spec/
├── _meta/
│   ├── glossary.json              <-- 必須：詞彙表（含 ErrorCode 多語系）
│   ├── boundary-decisions.json    <-- 必須：邊界決策記錄
│   └── terminology-mapping.md     <-- 可選：Stage 7 產出
├── epic-a/
│   └── {command-name}.feature     <-- ⭐ 主要產出
├── epic-b/
│   └── {command-name}.feature
├── ...
└── _diagrams/                     <-- 可選：Stage 7 產出
    ├── {epic-id}-event-flow.puml
    ├── {epic-id}-command-event.puml
    ├── {epic-id}-entity-relation.puml
    └── README.md
```

---

## Gherkin v6.x 語法（DSL-Level）

### 關鍵變更

| 舊語法 | 新語法（v6.x） |
|--------|----------------|
| `Scenario:` | `Example:` |
| - | `Rule:` |

### DSL-Level 範例

```gherkin
@epic-b @team @command
Feature: 建立球隊
  身為 教練
  我想要 建立新球隊
  以便 管理球員名單

  Rule: 球隊名稱必須唯一

    @happy-path
    Example: 成功建立球隊
      Given 系統中沒有球隊 "閃電隊"
      When 教練 建立球隊 "閃電隊"
      Then 球隊 "閃電隊" 應該存在
      And 球隊 "閃電隊" 狀態應為 "ACTIVE"

    @error-handling
    Example: 建立重複名稱的球隊應失敗
      Given 系統中存在球隊 "閃電隊"
      When 教練 建立球隊 "閃電隊"
      Then 應回傳錯誤 "球隊名稱已被使用"
```

---

## 快速開始

### GitHub Copilot

```
do: docs/user-stories/user-v1.md
for: event storming
```

### Claude Code

```bash
/event-storming docs/user-stories/user-v1.md
```

或使用統一語法：
```
do: docs/user-stories/user-v1.md
for: event storming
```

### Claude.ai

1. 上傳此目錄的 prompt 檔案
2. 上傳 PRD 文件
3. 輸入：「請執行 Event Storming 流程」

---

## DSL 格式快速參考

詳見 [dsl-format.md](./dsl-format.md)

### Given（前置條件）
```gherkin
Given 系統中存在球隊 "閃電隊"
Given 球隊 "閃電隊" 有球員 "王小明"，背號 1
Given 系統中沒有任何球隊
```

### When（執行動作）
```gherkin
When 教練 建立球隊 "閃電隊"
When 教練 查詢球隊列表
When 教練 刪除球隊 "閃電隊"
```

### Then（驗證結果）
```gherkin
Then 球隊 "閃電隊" 應該存在
Then 應回傳 2 筆球隊
Then 應回傳錯誤 "球隊名稱已被使用"
```

---

## DSL vs ISA 對照

| 特性 | DSL-Level（本流程） | ISA-Level |
|------|---------------------|-----------|
| **Key 識別** | `"閃電隊"` | `$Team.id` |
| **變數語法** | 無 | `>`, `<`, `$` |
| **技術參數** | 隱藏 | `(UID="$User.id")`, `call table:` |
| **DataTable 欄位** | 中文 | camelCase |
| **目的** | 業務驗收 | 技術翻譯 |

---

## Prompt 檔案結構

```
.ai-prompts/event-storming/
├── README.md                 # 本文件
├── facilitator.md            # 流程協調者（含強制邊界問題確認）
├── dsl-format.md             # DSL-Level Gherkin 格式規範
├── isa-format.md             # ISA-Level Gherkin 格式參考（供後續轉換）
└── stages/
    ├── stage0-prd-analyst.md
    ├── stage1-glossary-manager.md
    ├── stage2-epic-analyst.md
    ├── stage3-event-expert.md
    ├── stage4-command-expert.md
    ├── stage5-policy-expert.md
    ├── stage6-bdd-expert.md
    └── stage7-visualizer.md
```

---

## 相關文件

- [DSL 格式規範](./dsl-format.md)
- [ISA 格式規範](./isa-format.md)（供後續轉換參考）
- [Copilot 整合說明](../../.github/copilot-instructions.md)
- [Claude 整合說明](../../.claude/instructions.md)
