# Copilot 專案指令

## Event Storming 自動化流程 v6.0

本流程引導非技術使用者完成 Event Storming，產出 **DSL-Level Gherkin** 規格檔案。

> **Prompt 來源**：所有 Event Storming prompts 位於 `.ai-prompts/event-storming/`
>
> 詳細文檔請參閱：[.ai-prompts/event-storming/README.md](../.ai-prompts/event-storming/README.md)

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

## 觸發指令

### 從 PRD 文件開始（完整流程）

```
do: docs/user-stories/user-v1.md
for: event storming
```

### 處理單一 Epic

```
do: docs/user-stories/user-v1.md
for: event storming
epic: B
```

### 更新模式

```
do: docs/user-stories/user-v1.md
for: event storming
mode: update
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

執行每個 Stage 時，請載入對應的 prompt 檔案：

| Stage | 角色 | Prompt 檔案 |
|-------|------|-------------|
| 協調者 | Facilitator | [.ai-prompts/event-storming/facilitator.md](../.ai-prompts/event-storming/facilitator.md) |
| 0 | PRD Analyst | [.ai-prompts/event-storming/stages/stage0-prd-analyst.md](../.ai-prompts/event-storming/stages/stage0-prd-analyst.md) |
| 1 | Glossary Manager | [.ai-prompts/event-storming/stages/stage1-glossary-manager.md](../.ai-prompts/event-storming/stages/stage1-glossary-manager.md) |
| 2 | Epic Analyst | [.ai-prompts/event-storming/stages/stage2-epic-analyst.md](../.ai-prompts/event-storming/stages/stage2-epic-analyst.md) |
| 3 | Event Expert | [.ai-prompts/event-storming/stages/stage3-event-expert.md](../.ai-prompts/event-storming/stages/stage3-event-expert.md) |
| 4 | Command Expert | [.ai-prompts/event-storming/stages/stage4-command-expert.md](../.ai-prompts/event-storming/stages/stage4-command-expert.md) |
| 5 | Policy Expert | [.ai-prompts/event-storming/stages/stage5-policy-expert.md](../.ai-prompts/event-storming/stages/stage5-policy-expert.md) |
| 6 | BDD Expert | [.ai-prompts/event-storming/stages/stage6-bdd-expert.md](../.ai-prompts/event-storming/stages/stage6-bdd-expert.md) |
| 7 | Visualizer | [.ai-prompts/event-storming/stages/stage7-visualizer.md](../.ai-prompts/event-storming/stages/stage7-visualizer.md) |

---

## 輸出結構

```
docs/gherkin-spec/
├── _meta/
│   ├── prd-structure.json
│   ├── glossary.json
│   ├── epic-dependencies.json
│   ├── boundary-decisions.json
│   ├── events/
│   ├── commands/
│   └── policies/
├── epic-a/
├── epic-b/
└── _diagrams/
```

---

## DSL Gherkin 快速參考

詳細語法請參閱：[.ai-prompts/event-storming/dsl-format.md](../.ai-prompts/event-storming/dsl-format.md)

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

## 標籤規範

```gherkin
# Epic 標籤
@epic-a, @epic-b, @epic-c, ...

# Entity 標籤
@team, @player, @training, ...

# 場景類型標籤
@happy-path      # 正常流程
@error-handling  # 錯誤處理
@boundary        # 邊界條件
```

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

## Epic 處理順序

| 順序 | Epic | 名稱 | 依賴 |
|------|------|------|------|
| 1 | A | 登入/登出與權限控管 | 無 |
| 2 | B | 球隊/球員資料管理 | A |
| 3 | C | 訓練建立與 AI 控制 | A, B |
| 4 | D | 訓練紀錄頁（即時投球檢視） | A, C |
| 5 | E | 影像數據分析（歷史訓練） | A, C |
| 6 | F | 選手分析（長期表現追蹤） | A, B |
| 7 | G | 影像播放（Live / Replay） | A, C |

---

## 驗證檢查清單

### DSL 格式相容性
- [ ] 使用 `Example:` 而非 `Scenario:`（Gherkin v6.x）
- [ ] 可選使用 `Rule:` 分組相關 Examples
- [ ] Given 使用業務語言（如：`系統中存在球隊 "閃電隊"`）
- [ ] When 使用 Actor + 動詞 + 對象（如：`教練 建立球隊 "閃電隊"`）
- [ ] Then 使用業務語言驗證（如：`球隊 "閃電隊" 應該存在`）
- [ ] **不使用** 技術語法（無 `$`, `>`, `<`）
- [ ] DataTable 欄位使用**中文**

### Glossary 驗證
- [ ] 所有 Entity 都已定義
- [ ] 所有 ErrorCode 都已定義
- [ ] 跨 Feature 詞彙一致

---

## 其他專案指令

（其他 Copilot 指令可以在這裡添加）
