# Event Storming

執行 Event Storming 工作流程，將 PRD 文件轉換為 **DSL-Level Gherkin** 測試規格。

## 翻譯鏈定位

```
Event Storming → DSL-Level Gherkin → ISA-Level Gherkin → Test Code → Code
                 ^^^^^^^^^^^^^^^^
                 本流程產出層級
```

## 使用方式

### 標準語法（推薦，與 Copilot 相容）

```
do: <prd-file>
for: event storming
```

### Slash Command

```bash
/event-storming <prd-file> [options]
```

### 參數

| 參數 | 說明 | 範例 |
|------|------|------|
| `<prd-file>` | PRD 文件路徑 | `docs/user-stories/user-v1.md` |
| `epic: <id>` | 只處理指定的 Epic | `epic: B` |
| `mode: <mode>` | 執行模式 (full/update) | `mode: update` |

### 範例

```
# 完整流程
do: docs/user-stories/user-v1.md
for: event storming

# 只處理 Epic B
do: docs/user-stories/user-v1.md
for: event storming
epic: B

# 更新模式
do: docs/user-stories/user-v1.md
for: event storming
mode: update
```

## 執行流程

```
1. 讀取 PRD 文件
2. Stage 0: 解析 PRD 結構 → prd-structure.json
3. Stage 1: 建立詞彙表 → glossary.json
4. Stage 2: 分析 Epic 依賴 → epic-dependencies.json
5. [Per Epic]
   - Stage 3: 識別 Domain Events → {epic}-events.json
   - Stage 4: 萃取 Commands → {epic}-commands.json
   - Stage 5: 定義 Policies → {epic}-policies.json
   - 邊界問題確認（強制步驟）→ boundary-decisions.json
   - Stage 6: 產生 Gherkin (DSL) → .feature files
6. Stage 7: PlantUML 視覺化（可選）
```

## Prompt 參考

所有 prompts 位於 `.ai-prompts/event-storming/`：

- `facilitator.md` - 流程協調者
- `dsl-format.md` - DSL-Level Gherkin 格式規範
- `isa-format.md` - ISA-Level Gherkin 格式參考（供後續轉換）
- `stages/stage0-prd-analyst.md` - PRD 解析
- `stages/stage1-glossary-manager.md` - 詞彙表
- `stages/stage2-epic-analyst.md` - Epic 分析
- `stages/stage3-event-expert.md` - Domain Events
- `stages/stage4-command-expert.md` - Commands
- `stages/stage5-policy-expert.md` - Policies
- `stages/stage6-bdd-expert.md` - Gherkin 生成 (DSL)
- `stages/stage7-visualizer.md` - PlantUML

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

## DSL 格式

詳見 `.ai-prompts/event-storming/dsl-format.md`

### 快速參考

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

## 相關文檔

- [Event Storming README](.ai-prompts/event-storming/README.md)
- [DSL 格式規範](.ai-prompts/event-storming/dsl-format.md)
- [ISA 格式規範](.ai-prompts/event-storming/isa-format.md)（供後續轉換參考）
- [Copilot 整合](.github/copilot-instructions.md)
