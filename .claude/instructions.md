# Claude 專案指令

## Event Storming 自動化流程 v6.0

本流程引導非技術使用者完成 Event Storming，產出 **DSL-Level Gherkin** 規格檔案。

> **Prompt 來源**：所有 Event Storming prompts 位於 `.ai-prompts/event-storming/`
>
> 詳細文檔：[.ai-prompts/event-storming/README.md](.ai-prompts/event-storming/README.md)

### 翻譯鏈定位

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

## 觸發方式

### 標準語法（推薦，與 Copilot 相容）

```
do: docs/user-stories/user-v1.md
for: event storming
```

```
do: docs/user-stories/user-v1.md
for: event storming
epic: B
```

```
do: docs/user-stories/user-v1.md
for: event storming
mode: update
```

### Slash Command

```bash
/event-storming docs/user-stories/user-v1.md
/event-storming docs/user-stories/user-v1.md --epic B
```

### 自然語言

```
執行 Event Storming 流程，PRD 檔案：docs/user-stories/user-v1.md
```

---

## 執行流程

```
Stage 0: PRD 解析
    ↓
Stage 1: 詞彙表建立 (Glossary)
    ↓
Stage 2: Epic 分析
    ↓
[Per Epic Loop]
    Stage 3: Domain Events
    Stage 4: Commands
    Stage 5: Policies
    +------------------+
    | 邊界問題確認      |  <-- 強制步驟
    +------------------+
    Stage 6: Gherkin (DSL)
    ↓
Stage 7: PlantUML 視覺化（可選）
```

---

## Stage 參考

執行每個 Stage 時，請先讀取對應的 prompt 檔案：

| Stage | 角色 | Prompt 檔案 |
|-------|------|-------------|
| 協調者 | Facilitator | `.ai-prompts/event-storming/facilitator.md` |
| 0 | PRD Analyst | `.ai-prompts/event-storming/stages/stage0-prd-analyst.md` |
| 1 | Glossary Manager | `.ai-prompts/event-storming/stages/stage1-glossary-manager.md` |
| 2 | Epic Analyst | `.ai-prompts/event-storming/stages/stage2-epic-analyst.md` |
| 3 | Event Expert | `.ai-prompts/event-storming/stages/stage3-event-expert.md` |
| 4 | Command Expert | `.ai-prompts/event-storming/stages/stage4-command-expert.md` |
| 5 | Policy Expert | `.ai-prompts/event-storming/stages/stage5-policy-expert.md` |
| 6 | BDD Expert | `.ai-prompts/event-storming/stages/stage6-bdd-expert.md` |
| 7 | Visualizer | `.ai-prompts/event-storming/stages/stage7-visualizer.md` |

---

## Claude 使用指引

### 上下文管理

1. **讀取 Prompt**：執行每個 Stage 前，先讀取對應的 prompt 檔案
2. **維持狀態**：在整個流程中維持 Glossary 和已處理的 Epic 狀態
3. **互動確認**：遇到邊界問題時，與使用者互動確認

### 執行步驟

```
1. 讀取 PRD 檔案
2. 讀取 .ai-prompts/event-storming/facilitator.md
3. 依序執行 Stage 0-2
4. 對每個 Epic 執行 Stage 3-6
5. 詢問是否執行 Stage 7
```

### 輸出檔案

將中間產物輸出到 `docs/gherkin-spec/_meta/`：

```
docs/gherkin-spec/
├── _meta/
│   ├── prd-structure.json
│   ├── glossary.json
│   ├── epic-dependencies.json
│   ├── boundary-decisions.json
│   ├── events/{epic-id}-events.json
│   ├── commands/{epic-id}-commands.json
│   └── policies/{epic-id}-policies.json
├── epic-{x}/
│   └── us-{id}-{name}.feature
└── _diagrams/
```

---

## DSL Gherkin 快速參考

詳細語法：[.ai-prompts/event-storming/dsl-format.md](.ai-prompts/event-storming/dsl-format.md)

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

### DSL vs ISA 對照

| 特性 | DSL-Level（本流程） | ISA-Level |
|------|---------------------|-----------|
| **Key 識別** | `"閃電隊"` | `$Team.id` |
| **變數語法** | 無 | `>`, `<`, `$` |
| **技術參數** | 隱藏 | `(UID="$User.id")`, `call table:` |
| **DataTable 欄位** | 中文 | camelCase |
| **目的** | 業務驗收 | 技術翻譯 |

---

## 邊界問題互動

當遇到需要確認的問題時，使用以下格式：

```markdown
---
### 需要確認

**關於 [問題主題]**

**Q[編號]: [問題描述]**
- [ ] **A)** [最可能的選項] (推薦)
- [ ] **B)** [次可能的選項]
- [ ] **C)** 其他：_______________

請選擇：
---
```

---

## 其他專案指令

（其他 Claude 指令可以在這裡添加）
