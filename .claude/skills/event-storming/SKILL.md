---
name: event-storming
description: 執行 Event Storming 工作流程，將 PRD 文件轉換為 DSL-Level Gherkin 測試規格
disable-model-invocation: true
argument-hint: "[prd-file] [options]"
context: fork
agent: general-purpose
---

# Event Storming

將 PRD 文件轉換為 DSL-Level Gherkin 測試規格。

## 翻譯鏈定位

```
Event Storming → DSL-Level Gherkin → ISA-Level Gherkin → Test Code → Code
                 ^^^^^^^^^^^^^^^^
                 本流程產出層級
```

## 使用方式

```bash
/event-storming <prd-file>              # 完整流程
/event-storming <prd-file> epic:B       # 只處理 Epic B
/event-storming <prd-file> mode:update  # 更新模式
```

## 現有 Feature 檔案

!`ls -1 docs/gherkin-spec/features/*.feature 2>/dev/null | head -10 || echo "(無)"`

---

## 執行流程

**Input**: PRD 文件路徑
**Output**: `docs/gherkin-spec/` 下的 `.feature` 檔案

### 階段概覽

| Stage | 名稱 | 輸出 |
|-------|------|------|
| 0 | PRD 解析 | `_meta/prd-structure.json` |
| 1 | 詞彙表 | `_meta/glossary.json` |
| 2 | Epic 分析 | `_meta/epic-dependencies.json` |
| 3 | Domain Events | `_meta/events/{epic}.json` |
| 4 | Commands | `_meta/commands/{epic}.json` |
| 5 | Policies | `_meta/policies/{epic}.json` |
| 6 | Gherkin 生成 | `{epic}/*.feature` |
| 7 | PlantUML | `_diagrams/*.puml` (選用) |

### 每個 Epic 處理流程

1. Stage 3-5: 識別 Events → Commands → Policies
2. **邊界問題確認**（強制）→ `boundary-decisions.json`
3. Stage 6: 產生 DSL-Level Gherkin

---

## 必讀文件

執行前必須讀取以下文件：

@.ai-prompts/event-storming/facilitator.md
@.ai-prompts/event-storming/dsl-format.md

### Stage 專家 Prompts

- @.ai-prompts/event-storming/stages/stage0-prd-analyst.md
- @.ai-prompts/event-storming/stages/stage1-glossary-manager.md
- @.ai-prompts/event-storming/stages/stage2-epic-analyst.md
- @.ai-prompts/event-storming/stages/stage3-event-expert.md
- @.ai-prompts/event-storming/stages/stage4-command-expert.md
- @.ai-prompts/event-storming/stages/stage5-policy-expert.md
- @.ai-prompts/event-storming/stages/stage6-bdd-expert.md
- @.ai-prompts/event-storming/stages/stage7-visualizer.md

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
│   └── us-a1-xxx.feature
├── epic-b/
│   └── us-b1-xxx.feature
└── _diagrams/
```

---

## DSL 格式快速參考

詳見 @.ai-prompts/event-storming/dsl-format.md

```gherkin
# Given - 前置條件
Given 系統中存在球隊 "閃電隊"
Given 球隊 "閃電隊" 有球員 "王小明"，背號 1

# When - 執行動作
When 教練 建立球隊 "閃電隊"
When 教練 查詢球隊列表

# Then - 驗證結果
Then 球隊 "閃電隊" 應該存在
Then 應回傳 2 筆球隊
Then 應回傳錯誤 "球隊名稱已被使用"
```

---

## 注意事項

- 每個 Stage 完成後詢問用戶確認
- 邊界問題必須在 Stage 6 前解決
- DSL 格式不包含實作細節（API、DB 欄位）
