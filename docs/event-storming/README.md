# Event Storming 自動化執行指南

## 快速開始

### 執行完整流程

在 Copilot Chat 中輸入：

```
@workspace 請對 docs/user-stories/us-teamAndPlayer.md 執行完整的 Event Storming 流程
```

Copilot 會自動：
1. 讀取 User Story
2. 依序執行 Stage 1-6
3. 產出所有 JSON 和 .feature 檔案

### 執行特定階段

```
@workspace 請執行 Event Storming Stage 1，分析 us-teamAndPlayer 的 Domain Events
```

## 輸出結果

所有產出檔案會儲存在：

```
docs/event-storming/examples/{story-id}/
├── 01-domain-events.json       # Stage 1 輸出
├── 02-commands.json            # Stage 2 輸出
├── 03-aggregates.json          # Stage 3 輸出
├── 04-policies.json            # Stage 4 輸出
├── 05-read-models.json         # Stage 5 輸出
└── 06-scenarios.feature        # Stage 6 輸出（最終 Gherkin DSL）
```

## Prompt Templates

所有 prompt templates 位於：`docs/event-storming/prompts/`

- `stage1-domain-events.md` - Domain Events 識別
- `stage2-commands.md` - Commands 萃取
- `stage3-aggregates.md` - Aggregates 定義
- `stage4-policies.md` - Business Rules 梳理
- `stage5-read-models.md` - Read Models 設計
- `stage6-gherkin.md` - Gherkin Scenarios 生成

## 給 PM 和非技術人員

只需要：
1. 撰寫 User Story（使用 `docs/user-stories/` 的模板）
2. 呼叫 Copilot 執行 Event Storming
3. 查看產出的 Gherkin DSL（`06-scenarios.feature`）

Gherkin DSL 是可讀的業務場景描述，方便驗證需求是否正確實現。

---

## 完整流程架構

```
User Story (PM)
    ↓
Stage 1: Domain Events 識別
    ↓
Stage 2: Commands 萃取
    ↓
Stage 3: Aggregates & Entities 定義
    ↓
Stage 4: Policies & Business Rules 梳理
    ↓
Stage 5: Read Models & Views 設計
    ↓
Stage 6: Gherkin Scenarios 生成
```

## 兩種系統邊界模型

### 1. 修改型操作（Command Operation）

```
Actor → [Command + Input] → Rules 驗證 → Aggregate 狀態改變 → Event 產生
```

**翻譯對應 Gherkin**：
| Event Storming | Gherkin |
|----------------|---------|
| Preconditions（前置條件） | **Given** |
| Command + Input | **When** |
| Postconditions + Event | **Then** |

### 2. 查詢型操作（Query Operation）

```
Actor → [Query] → 權限驗證 → Read Model 回傳
```

**翻譯對應 Gherkin**：
| Event Storming | Gherkin |
|----------------|---------|
| Preconditions（權限驗證） | **Given** |
| Query 請求 | **When** |
| Read Model 回傳資料 | **Then** |

## 從 Event 展開的 7 個步驟

```
Step 1：確定 Event（切入點）
    ↓
Step 2：Event 來源是什麼？（Actor 或 系統）
    ↓
Step 3：展開 Command + Actor
    ↓
Step 4：展開 Rules（前/後置條件）
    ↓
Step 5：確認 Input/Output 參數
    ↓
Step 6：建立 Aggregate（狀態）
    ↓
Step 7：展開 Read Model（查詢介面）
```

## Rules 前/後置條件對照表

| 類型 | 英文 | 定義 | 範例 |
|------|------|------|------|
| **前置條件** | Precondition | 執行操作前必須滿足的條件 | 學生有課程權限、進度只能單調遞增 |
| **後置條件** | Postcondition | 執行成功後系統應達到的狀態 | 進度更新為 100%、狀態變為 COMPLETED |

## Repository 結構

```
docs/event-storming/
├── README.md                    # 本文件
├── prompts/                     # 各階段 Prompt 模板
│   ├── stage1-domain-events.md
│   ├── stage2-commands.md
│   ├── stage3-aggregates.md
│   ├── stage4-policies.md
│   ├── stage5-read-models.md
│   └── stage6-gherkin.md
├── templates/                   # 通用模板
│   ├── user-story.template.md
│   └── output-schemas/          # 各階段輸出的 JSON Schema
│       ├── domain-events.schema.json
│       ├── commands.schema.json
│       ├── aggregates.schema.json
│       ├── policies.schema.json
│       ├── read-models.schema.json
│       └── gherkin.schema.json
├── examples/                    # 範例輸出
│   └── US-teamAndPlayer/
│       ├── 01-domain-events.json
│       ├── 02-commands.json
│       ├── 03-aggregates.json
│       ├── 04-policies.json
│       ├── 05-read-models.json
│       └── 06-scenarios.feature
└── scripts/                     # 執行腳本
    ├── run-pipeline.sh
    └── validate-output.js
```

## 執行流程

### 手動執行（逐階段）

1. **準備 User Story**
   ```bash
   # PM 將 User Story 放置在 docs/user-stories/ 目錄
   ```

2. **Stage 1: Domain Events 識別**
   ```bash
   # 使用 prompts/stage1-domain-events.md
   # 輸入：User Story
   # 輸出：examples/{US-ID}/01-domain-events.json
   ```

3. **Stage 2: Commands 萃取**
   ```bash
   # 使用 prompts/stage2-commands.md
   # 輸入：01-domain-events.json
   # 輸出：examples/{US-ID}/02-commands.json
   ```

4. **Stage 3: Aggregates 定義**
   ```bash
   # 使用 prompts/stage3-aggregates.md
   # 輸入：01-domain-events.json + 02-commands.json
   # 輸出：examples/{US-ID}/03-aggregates.json
   ```

5. **Stage 4: Policies 梳理**
   ```bash
   # 使用 prompts/stage4-policies.md
   # 輸入：02-commands.json + 03-aggregates.json
   # 輸出：examples/{US-ID}/04-policies.json
   ```

6. **Stage 5: Read Models 設計**
   ```bash
   # 使用 prompts/stage5-read-models.md
   # 輸入：所有前階段輸出
   # 輸出：examples/{US-ID}/05-read-models.json
   ```

7. **Stage 6: Gherkin 生成**
   ```bash
   # 使用 prompts/stage6-gherkin.md
   # 輸入：所有前階段輸出
   # 輸出：examples/{US-ID}/06-scenarios.feature
   ```

### 自動化執行（未來擴展）

```bash
# 執行完整流程
./scripts/run-pipeline.sh US-B1

# 驗證輸出
./scripts/validate-output.js US-B1
```

## 使用指南

### 給 PM 的說明

1. 將 User Story 撰寫在 `docs/user-stories/` 目錄
2. 使用標準格式：「身為...我想要...以便...」
3. 通知技術團隊開始 Event Storming 流程

### 給開發者的說明

1. 依序使用 `prompts/` 目錄下的 Prompt 模板
2. 將每個階段的輸出存放在 `examples/{US-ID}/` 目錄
3. 確保 JSON 輸出符合對應的 Schema
4. 最終產出的 Gherkin 檔案可直接用於測試

### 給 Copilot 的說明

當用戶提供 User Story 並要求執行 Event Storming 流程時：

1. 讀取對應的 Prompt 模板（stage1-stage6）
2. 依序處理每個階段，將前一階段的輸出作為下一階段的輸入
3. 嚴格遵守輸出格式（JSON Schema）
4. 在 Stage 6 產出完整的 Gherkin 測試場景
5. 確保涵蓋 Command/Query 兩種操作類型
6. 明確標註 Preconditions 和 Postconditions

## 設計原則

1. **明確區分 Command 與 Query**
   - Command：改變系統狀態，產生 Event
   - Query：只讀取資料，不改變狀態

2. **7 步驟方法論**
   - 從 Event 出發逐步展開
   - 確保邏輯完整性

3. **前後置條件清晰**
   - Preconditions 對應 Given
   - Postconditions 對應 Then

4. **非技術人員可讀**
   - Gherkin 使用自然語言
   - 業務邏輯清晰表達

5. **可測試性**
   - 每個 Scenario 都可執行
   - 涵蓋 Happy Path 和 Edge Cases
