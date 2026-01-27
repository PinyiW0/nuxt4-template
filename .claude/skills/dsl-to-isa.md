# DSL to ISA Conversion

將 DSL-Level Gherkin 轉換為 ISA-Level Gherkin，產生可直接用於 ISA-codegen 的測試規格。

## 翻譯鏈定位

```
Event Storming → DSL-Level Gherkin → ISA-Level Gherkin → Test Code → Code
                                      ^^^^^^^^^^^^^^^^
                                      本流程產出層級
```

## 使用方式

### 標準語法

```
do: <target>
for: isa
```

### 參數

| 參數 | 說明 | 範例 |
|------|------|------|
| `all` | 轉換所有 epic 資料夾 | `do: all` |
| `epic-{x}` | 轉換指定 epic 資料夾 | `do: epic-b` |
| `<feature-file>` | 轉換單一 .feature 檔案 | `do: docs/gherkin-spec/epic-b/us-b2-create-team.feature` |

### 範例

```
# 轉換全部
do: all
for: isa

# 轉換單一 Epic
do: epic-b
for: isa

# 轉換單一檔案
do: docs/gherkin-spec/epic-b/us-b2-create-team.feature
for: isa
```

## 輸出

- **輸出目錄**：`docs/gherkin-spec/isa/`
- **目錄結構**：保持原本的 epic 結構
- **檔案名稱**：`{原檔名}.isa.feature`

### 輸出結構範例

```
docs/gherkin-spec/
├── epic-b/                          # DSL 原始檔
│   ├── us-b2-create-team.feature
│   └── us-b3-create-player.feature
├── epic-c/
│   └── us-c1-query-training.feature
└── isa/                             # ISA 輸出目錄
    ├── epic-b/
    │   ├── us-b2-create-team.isa.feature
    │   └── us-b3-create-player.isa.feature
    └── epic-c/
        └── us-c1-query-training.isa.feature
```

---

## 執行流程

```
1. 解析 target 參數：
   - all → 掃描所有 docs/gherkin-spec/epic-* 資料夾
   - epic-{x} → 掃描 docs/gherkin-spec/epic-{x} 資料夾
   - 檔案路徑 → 處理單一檔案

2. 檢查並產生 ISA Lint 對照檔（若不存在）：
   - spec/data/entity_to_table_mapping.yml
   - spec/data/schema.sql

3. 讀取參考資料：
   - docs/gherkin-spec/_meta/glossary.json（Entity 定義）
   - docs/gherkin-spec/_meta/terminology-mapping.md（詞彙對照）
   - docs/isa-lint/isa-codegen.yml（ISA 指令定義）
   - spec/data/entity_to_table_mapping.yml（Entity 對照表）
   - spec/data/schema.sql（SQL DDL Schema）

4. 對每個 .feature 檔案：
   - 逐句轉換 Gherkin Steps（參照 ISA 指令 regex patterns）
   - 產生 ISA-Level .feature 檔案到 docs/gherkin-spec/isa/{epic}/ 目錄

5. 驗證轉換結果（必須全部通過）：
   ✓ ISA Instruction Pattern 驗證
   ✓ Entity 名稱驗證
   ✓ 欄位名稱驗證
   ✓ 必填欄位完整性驗證
   ✓ 變數捕獲語法驗證
   ✓ API Call 參數完整性驗證
   ✓ ISA Linter 執行驗證

6. 輸出轉換摘要與驗證報告
```

---

## 前置作業：產生 ISA Lint 對照檔

在執行轉換前，必須確保以下檔案存在：

### spec/data/entity_to_table_mapping.yml

從 `glossary.json` 產生，包含：
- Entity 中英文對照（ISA 中使用**中文** entity 名稱）
- Table 名稱對照
- 欄位名稱對照（camelCase → snake_case）
- Enum 值對照

### spec/data/schema.sql

從 `glossary.json` 產生，包含：
- 所有 Table 的 DDL 定義
- 欄位類型、約束
- 外鍵關聯
- 索引定義

### 產生規則

若檔案不存在，從 `docs/gherkin-spec/_meta/glossary.json` 自動產生：

```yaml
# entity_to_table_mapping.yml 範例
entities:
  球隊: # ISA 中使用的中文名稱
    entity_en: Team # 英文名稱
    table: teams # 資料表名稱
    primary_key: team_id # 主鍵欄位
    fields:
      teamId: team_id # camelCase → snake_case
      teamName: team_name
      status: status
```

---

## ISA 指令 Patterns（來自 isa-codegen.yml）

轉換時必須嚴格遵循以下 regex patterns：

| 指令名稱 | Step Type | Pattern |
|----------|-----------|---------|
| Time control | Given | `^現在的時間是 "@time\(\"...\"\)"$` |
| Data preparation | Given | `^準備一個{entity}, with table:$` |
| API call | When | `^\((?:No Actor\|UID="\$...")\) {summary}, call table:$` |
| Response validation | Then | `^回應, with table:$` |
| Response JSON | Then | `^回應為, with JSON:$` |
| Database validation | Then | `^應該存在一個{entity}, with table:$` |
| Database non-existence | Then | `^應該不存在一個{entity}, with table:$` |
| Operation failure | Then | `^操作失敗$` |

**重要約束**：
- `{entity}` 必須使用 **中文名稱**（如 `球隊`、`球員`），對照 `entity_to_table_mapping.yml`
- DataTable 欄位使用 **camelCase**
- Database validation 的 Then 步驟**禁止變數捕獲**（不能用 `>` 和 `<`）

---

## 轉換規則

### 1. Feature Header 轉換

**輸入（DSL）**：
```gherkin
# language: zh-TW
# encoding: UTF-8
# Feature: 建立球隊
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
```

**輸出（ISA）**：
```gherkin
# language: zh-TW
# encoding: UTF-8
# Feature: 建立球隊
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# ISA Compatible: Yes
```

### 2. Background 轉換

**輸入（DSL）**：
```gherkin
Background:
  Given 教練 已登入系統
  And 系統中存在球隊 "閃電隊"
```

**輸出（ISA）**：
```gherkin
Background:
  Given 準備一個使用者, with table:
    | >User.id | name | role  | status |
    | <userId  | 教練 | COACH | ACTIVE |
  And 準備一個球隊, with table:
    | >Team.id | teamName | status |
    | <teamId  | 閃電隊   | ACTIVE |
```

### 3. Given Steps 轉換規則

#### 3.1 使用者/角色登入

| DSL Pattern | ISA Pattern |
|-------------|-------------|
| `{Actor} 已登入系統` | `準備一個使用者, with table:` |

**轉換範例**：

DSL：
```gherkin
Given 教練 已登入系統
```

ISA：
```gherkin
Given 準備一個使用者, with table:
  | >User.id | name | role  | status |
  | <userId  | 教練 | COACH | ACTIVE |
```

#### 3.2 Entity 存在

| DSL Pattern | ISA Pattern |
|-------------|-------------|
| `系統中存在{Entity} "{name}"` | `準備一個{Entity}, with table:` |
| `系統中存在{Entity} "{name}"，狀態為 "{status}"` | `準備一個{Entity}, with table:` |

**轉換範例**：

DSL：
```gherkin
Given 系統中存在球隊 "閃電隊"
```

ISA：
```gherkin
Given 準備一個球隊, with table:
  | >Team.id | teamName | status |
  | <teamId  | 閃電隊   | ACTIVE |
```

#### 3.3 Entity 不存在

| DSL Pattern | ISA Pattern |
|-------------|-------------|
| `系統中沒有{Entity} "{name}"` | （移除，不需要準備） |
| `系統中沒有任何{Entity}` | （移除，不需要準備） |

#### 3.4 關聯 Entity

| DSL Pattern | ISA Pattern |
|-------------|-------------|
| `{Parent} "{name}" 有{Child} "{childName}"，...` | `準備一個{Child}, with table:` |

**轉換範例**：

DSL：
```gherkin
Given 球隊 "閃電隊" 有球員 "王小明"，背號 1
```

ISA：
```gherkin
Given 準備一個球員, with table:
  | >Player.id | teamId   | jerseyNumber | name   | position | status |
  | <playerId  | $Team.id | 1            | 王小明 | P        | ACTIVE |
```

#### 3.5 訓練紀錄

DSL：
```gherkin
Given 球隊 "閃電隊" 有訓練紀錄，日期 "2026-01-20"，受測球員 "王小明"
```

ISA：
```gherkin
Given 準備一個訓練, with table:
  | >Training.id | teamId   | playerId   | trainingDate | status |
  | <trainingId  | $Team.id | $Player.id | 2026-01-20   | ACTIVE |
```

### 4. When Steps 轉換規則

#### 4.1 Command 操作

| DSL Pattern | ISA Pattern |
|-------------|-------------|
| `{Actor} {動作} {Entity} "{name}"` | `(UID="$User.id") {動作摘要}, call table:` |

**轉換範例**：

DSL：
```gherkin
When 教練 建立球隊 "閃電隊"
```

ISA：
```gherkin
When (UID="$User.id") 建立球隊, call table:
  | teamName |
  | 閃電隊   |
```

DSL：
```gherkin
When 教練 刪除球隊 "閃電隊"
```

ISA：
```gherkin
When (UID="$User.id") 刪除球隊, call table:
  | teamId   |
  | $Team.id |
```

DSL：
```gherkin
When 教練 編輯球隊 "閃電隊" 名稱為 "雷霆隊"
```

ISA：
```gherkin
When (UID="$User.id") 編輯球隊, call table:
  | teamId   | teamName |
  | $Team.id | 雷霆隊   |
```

#### 4.2 Query 操作

| DSL Pattern | ISA Pattern |
|-------------|-------------|
| `{Actor} 查詢{Entity}列表` | `(UID="$User.id") 查詢{Entity}列表, call table:` |

**轉換範例**：

DSL：
```gherkin
When 教練 查詢球隊列表
```

ISA：
```gherkin
When (UID="$User.id") 查詢球隊列表, call table:
  | |
```

DSL：
```gherkin
When 教練 查詢球隊 "閃電隊" 的訓練列表
```

ISA：
```gherkin
When (UID="$User.id") 查詢訓練列表, call table:
  | teamId   |
  | $Team.id |
```

#### 4.3 無認證操作

若操作不需要認證（如公開 API），使用 `(No Actor)`：

```gherkin
When (No Actor) 取得系統狀態, call table:
  | |
```

### 5. Then Steps 轉換規則

#### 5.1 成功操作

| DSL Pattern | ISA Pattern |
|-------------|-------------|
| （成功場景的隱含預期） | `回應, with table:` + `statusCode: 200` |

**轉換範例**：

DSL：
```gherkin
Then 球隊 "閃電隊" 應該存在
```

ISA：
```gherkin
Then 回應, with table:
  | statusCode | 200 |
And 應該存在一個球隊, with table:
  | teamName | status |
  | 閃電隊   | ACTIVE |
```

#### 5.2 Entity 存在驗證

| DSL Pattern | ISA Pattern |
|-------------|-------------|
| `{Entity} "{name}" 應該存在` | `應該存在一個{Entity}, with table:` |
| `{Entity} "{name}" 狀態應為 "{status}"` | `應該存在一個{Entity}, with table:` |

#### 5.3 Entity 不存在驗證

| DSL Pattern | ISA Pattern |
|-------------|-------------|
| `{Entity} "{name}" 應該不存在` | `應該不存在一個{Entity}, with table:` |

**轉換範例**：

DSL：
```gherkin
Then 球隊 "閃電隊" 應該不存在
```

ISA：
```gherkin
Then 應該不存在一個球隊, with table:
  | teamId   |
  | $Team.id |
```

#### 5.4 錯誤驗證

| DSL Pattern | ISA Pattern |
|-------------|-------------|
| `應回傳錯誤 "{message}"` | `操作失敗` + `回應, with table:` |

**轉換範例**：

DSL：
```gherkin
Then 應回傳錯誤 "球隊名稱已被使用"
```

ISA：
```gherkin
Then 操作失敗
And 回應, with table:
  | statusCode | 409 |
```

**ErrorCode 對照表（參考 terminology-mapping.md）**：

| 錯誤訊息 | HTTP Status |
|----------|-------------|
| 球隊名稱已被使用 | 409 |
| 球隊名稱不可為空 | 400 |
| 找不到指定的球隊 | 404 |
| 球隊尚有球員，無法刪除 | 409 |
| 背號已被使用 | 409 |
| 背號必須在 0-99 之間 | 400 |
| 球員姓名不可為空 | 400 |
| 找不到指定的球員 | 404 |
| 權限不足 | 403 |
| 未授權的操作 | 401 |

#### 5.5 列表驗證

| DSL Pattern | ISA Pattern |
|-------------|-------------|
| `應回傳 {n} 筆{Entity}` | `回應, with table:` |
| `應包含{Entity} "{name}"` | （包含在回應 JSON 驗證中） |

**轉換範例**：

DSL：
```gherkin
Then 應回傳 2 筆球隊
And 應包含球隊 "閃電隊"
```

ISA：
```gherkin
Then 回應, with table:
  | statusCode | 200 |
And 回應為, with JSON:
  """
  {
    "data": [
      { "teamName": "閃電隊" }
    ],
    "total": 2
  }
  """
```

### 6. Scenario Outline 轉換規則

#### 6.1 基本概念

Scenario Outline（情境大綱）用於**參數化測試**，允許使用相同的測試步驟執行多組不同的參數。

**轉換原則**：
- `Scenario Outline` 關鍵字保持不變
- `Examples` 表格保持不變
- 參數佔位符 `<參數名>` 保持不變
- 步驟內容按照一般規則轉換（Given/When/Then）
- 參數會在**執行時**由測試框架自動替換

#### 6.2 參數佔位符規則

| 項目 | 規則 |
|------|------|
| 佔位符格式 | `<參數名>` |
| 命名方式 | 使用中文或英文，與 Examples 表頭一致 |
| 替換時機 | 執行時由測試框架替換 |
| 使用位置 | 可用於 DataTable、Step 文字、變數引用 |

**注意事項**：
- 參數名稱必須與 Examples 表頭**完全一致**（包含大小寫）
- 參數可以用於 DataTable 的資料列，但**不能用於表頭**
- 參數替換發生在**運行時**，不影響 DSL → ISA 轉換

#### 6.3 常見使用場景

##### 場景 1：欄位驗證（範圍、格式）

**適用於**：背號驗證、數值範圍、字串長度等

**DSL 範例**：
```gherkin
Scenario Outline: 背號驗證
  Given 教練 已登入系統
  And 系統中存在球隊 "閃電隊"
  When 教練 建立球員 "測試球員"，背號 <背號>
  Then <結果>

  Examples:
    | 背號 | 結果                           |
    | -1   | 應回傳錯誤 "背號必須在 0-99 之間" |
    | 0    | 球員 "測試球員" 應該存在        |
    | 50   | 球員 "測試球員" 應該存在        |
    | 99   | 球員 "測試球員" 應該存在        |
    | 100  | 應回傳錯誤 "背號必須在 0-99 之間" |
```

**ISA 範例**：
```gherkin
Scenario Outline: 背號驗證
  Given 準備一個使用者, with table:
    | >User.id | name | role  | status |
    | <userId  | 教練 | COACH | ACTIVE |
  And 準備一個球隊, with table:
    | >Team.id | teamName | status |
    | <teamId  | 閃電隊   | ACTIVE |
  When (UID="$User.id") 建立球員, call table:
    | teamId   | name     | jerseyNumber | position |
    | $Team.id | 測試球員 | <背號>       | P        |
  Then <ISA結果>

  Examples:
    | 背號 | ISA結果                                                    |
    | -1   | 操作失敗\nAnd 回應, with table:\n  \| statusCode \| 400 \| |
    | 0    | 回應, with table:\n  \| statusCode \| 200 \|              |
    | 50   | 回應, with table:\n  \| statusCode \| 200 \|              |
    | 99   | 回應, with table:\n  \| statusCode \| 200 \|              |
    | 100  | 操作失敗\nAnd 回應, with table:\n  \| statusCode \| 400 \| |
```

**轉換重點**：
- `<背號>` 參數直接用於 DataTable 的 `jerseyNumber` 欄位
- Then 步驟的 `<結果>` 參數在 ISA 需要轉換為 `<ISA結果>`
- 錯誤場景統一使用 `操作失敗` + statusCode

---

##### 場景 2：錯誤訊息驗證

**適用於**：驗證不同錯誤碼、錯誤訊息

**DSL 範例**：
```gherkin
Scenario Outline: 球隊名稱驗證
  Given 教練 已登入系統
  When 教練 建立球隊 "<球隊名稱>"
  Then 應回傳錯誤 "<錯誤訊息>"

  Examples:
    | 球隊名稱 | 錯誤訊息         |
    |          | 球隊名稱不可為空 |
    | 閃電隊   | 球隊名稱已被使用 |
```

**ISA 範例**：
```gherkin
Scenario Outline: 球隊名稱驗證
  Given 準備一個使用者, with table:
    | >User.id | name | role  | status |
    | <userId  | 教練 | COACH | ACTIVE |
  # 若需要驗證重複名稱，需先準備資料
  And <前置準備>
  When (UID="$User.id") 建立球隊, call table:
    | teamName   |
    | <球隊名稱> |
  Then 操作失敗
  And 回應, with table:
    | statusCode   |
    | <statusCode> |

  Examples:
    | 球隊名稱 | 前置準備                                                                       | statusCode |
    |          | # 空字串，不需準備                                                             | 400        |
    | 閃電隊   | 準備一個球隊, with table:\n  \| >Team.id \| teamName \| status \|\n  \| <teamId \| 閃電隊 \| ACTIVE \| | 409        |
```

**轉換重點**：
- 錯誤訊息在 ISA 中轉換為對應的 HTTP statusCode
- 使用 `<前置準備>` 參數處理條件性的 Given 步驟
- 參考 [glossary.json](docs/gherkin-spec/_meta/glossary.json) 的 errorCodes 對照

---

##### 場景 3：多參數組合測試

**適用於**：權限驗證、狀態機測試

**DSL 範例**：
```gherkin
Scenario Outline: 權限驗證
  Given <角色> 已登入系統
  And 系統中存在球隊 "閃電隊"
  When <角色> 刪除球隊 "閃電隊"
  Then <結果>

  Examples:
    | 角色         | 結果                   |
    | 系統管理者   | 球隊 "閃電隊" 應該不存在 |
    | 教練         | 球隊 "閃電隊" 應該不存在 |
    | 分析使用者   | 應回傳錯誤 "權限不足"   |
```

**ISA 範例**：
```gherkin
Scenario Outline: 權限驗證
  Given 準備一個使用者, with table:
    | >User.id | name   | role   | status |
    | <userId  | <角色> | <role> | ACTIVE |
  And 準備一個球隊, with table:
    | >Team.id | teamName | status |
    | <teamId  | 閃電隊   | ACTIVE |
  When (UID="$User.id") 刪除球隊, call table:
    | teamId   |
    | $Team.id |
  Then <ISA結果>

  Examples:
    | 角色         | role    | ISA結果                                                                                                 |
    | 系統管理者   | ADMIN   | 回應, with table:\n  \| statusCode \| 200 \|\nAnd 應該不存在一個球隊, with table:\n  \| teamId \|\n  \| $Team.id \| |
    | 教練         | COACH   | 回應, with table:\n  \| statusCode \| 200 \|\nAnd 應該不存在一個球隊, with table:\n  \| teamId \|\n  \| $Team.id \| |
    | 分析使用者   | ANALYST | 操作失敗\nAnd 回應, with table:\n  \| statusCode \| 403 \|                                              |
```

**轉換重點**：
- `<角色>` 需要對應到 `<role>` enum 值（ADMIN, COACH, ANALYST）
- 參考 [glossary.json](docs/gherkin-spec/_meta/glossary.json:137-142) 的 roles 定義
- 成功/失敗場景的 Then 步驟完全不同，需使用 `<ISA結果>` 參數

---

#### 6.4 參數使用位置對照表

| 使用位置 | DSL 範例 | ISA 範例 | 說明 |
|----------|---------|---------|------|
| Step 文字 | `教練 建立球隊 "<名稱>"` | `(UID="$User.id") 建立球隊, call table:` | 參數不直接用於 ISA step 文字 |
| DataTable 資料列 | - | `\| jerseyNumber \|\n\| <背號> \|` | ✓ 可用於 DataTable 值 |
| DataTable 表頭 | - | `\| <欄位名> \|` | ✗ 不可用於表頭 |
| 變數引用 | - | `\| teamId \|\n\| $<變數名>.id \|` | ✗ 不可用於變數系統 |
| Then 步驟 | `Then <結果>` | `Then <ISA結果>` | ✓ 可用於整個 Then 步驟內容 |

---

#### 6.5 轉換注意事項

##### 問題 1：Then 步驟參數化過於複雜

❌ **不建議**：
```gherkin
Examples:
  | 背號 | ISA結果                              |
  | -1   | 操作失敗\nAnd 回應, with table:\n... |
```
問題：Examples 表格難以閱讀和維護

✓ **建議**：拆分為多個 Scenario Outline
```gherkin
@error-handling
Scenario Outline: 背號驗證 - 錯誤場景
  # ... steps ...
  Then 操作失敗
  And 回應, with table:
    | statusCode | <statusCode> |

  Examples:
    | 背號 | statusCode |
    | -1   | 400        |
    | 100  | 400        |

@happy-path
Scenario Outline: 背號驗證 - 成功場景
  # ... steps ...
  Then 回應, with table:
    | statusCode | 200 |
  And 應該存在一個球員, with table:
    | jerseyNumber |
    | <背號>       |

  Examples:
    | 背號 |
    | 0    |
    | 50   |
    | 99   |
```

##### 問題 2：條件性 Given 步驟

對於需要「有時準備、有時不準備」的情況：

**方案 A**：使用空白步驟（不推薦）
```gherkin
Examples:
  | 前置準備 |
  |          |  # 空白表示跳過
  | 準備...  |
```

**方案 B**：拆分為不同 Scenario（推薦）
```gherkin
Scenario: 球隊名稱為空
  # 不需要準備球隊

Scenario: 球隊名稱重複
  Given 準備一個球隊...
```

##### 問題 3：參數命名衝突

當 DSL 參數與 ISA 表頭衝突：

❌ **錯誤**：
```gherkin
When (UID="$User.id") 建立球隊, call table:
  | <teamName> |  # 參數不能用於表頭
  | 閃電隊     |
```

✓ **正確**：
```gherkin
When (UID="$User.id") 建立球隊, call table:
  | teamName   |  # 表頭固定
  | <球隊名稱> |  # 參數用於值
```

---

#### 6.6 完整轉換範例

**輸入（DSL）**：
```gherkin
@epic-b @player @validation
Scenario Outline: 建立球員 - 背號驗證
  Given 教練 已登入系統
  And 系統中存在球隊 "閃電隊"
  When 教練 建立球員 "測試球員"，背號 <背號>，位置 "P"
  Then <結果>

  Examples: 有效背號
    | 背號 | 結果                    |
    | 0    | 球員 "測試球員" 應該存在 |
    | 99   | 球員 "測試球員" 應該存在 |

  Examples: 無效背號
    | 背號 | 結果                           |
    | -1   | 應回傳錯誤 "背號必須在 0-99 之間" |
    | 100  | 應回傳錯誤 "背號必須在 0-99 之間" |
```

**輸出（ISA）**：
```gherkin
@epic-b @player @validation
Scenario Outline: 建立球員 - 背號驗證
  Given 準備一個使用者, with table:
    | >User.id | name | role  | status |
    | <userId  | 教練 | COACH | ACTIVE |
  And 準備一個球隊, with table:
    | >Team.id | teamName | status |
    | <teamId  | 閃電隊   | ACTIVE |
  When (UID="$User.id") 建立球員, call table:
    | teamId   | name     | jerseyNumber | position |
    | $Team.id | 測試球員 | <背號>       | P        |
  Then <ISA結果>

  Examples: 有效背號
    | 背號 | ISA結果                                                                                                        |
    | 0    | 回應, with table:\n  \| statusCode \| 200 \|\nAnd 應該存在一個球員, with table:\n  \| name \|\n  \| 測試球員 \| |
    | 99   | 回應, with table:\n  \| statusCode \| 200 \|\nAnd 應該存在一個球員, with table:\n  \| name \|\n  \| 測試球員 \| |

  Examples: 無效背號
    | 背號 | ISA結果                                                    |
    | -1   | 操作失敗\nAnd 回應, with table:\n  \| statusCode \| 400 \| |
    | 100  | 操作失敗\nAnd 回應, with table:\n  \| statusCode \| 400 \| |
```

**轉換說明**：
1. ✓ `Scenario Outline` 關鍵字保持不變
2. ✓ `Examples:` 表格標題（「有效背號」、「無效背號」）保持不變
3. ✓ 參數 `<背號>` 保持不變，用於 DataTable 的 `jerseyNumber` 值
4. ✓ 步驟內容按照一般規則轉換（Given → 準備, When → API call, Then → 回應驗證）
5. ✓ `<結果>` 參數轉換為 `<ISA結果>`，包含完整的 Then 步驟內容

---

## 變數命名規則

### Entity 變數命名

| Entity | 變數捕獲 | 變數引用 |
|--------|---------|---------|
| 使用者 | `>User.id` / `<userId` | `$User.id` |
| 球隊 | `>Team.id` / `<teamId` | `$Team.id` |
| 球員 | `>Player.id` / `<playerId` | `$Player.id` |
| 訓練 | `>Training.id` / `<trainingId` | `$Training.id` |
| 投球 | `>Pitch.id` / `<pitchId` | `$Pitch.id` |

### 多個相同 Entity

當同一 Example 有多個相同 Entity，使用數字後綴：

```gherkin
Given 準備一個球隊, with table:
  | >Team1.id | teamName | status |
  | <teamId   | 閃電隊   | ACTIVE |
And 準備一個球隊, with table:
  | >Team2.id | teamName | status |
  | <teamId   | 勇士隊   | ACTIVE |
```

---

## DataTable 欄位規則

### 欄位來源

所有欄位必須參考 `glossary.json` 中的定義：

- 使用 **camelCase** 命名
- 遵循 Entity 的 fields 定義
- enum 值使用英文大寫（ACTIVE, DELETED 等）

### 必填欄位

準備 Entity 時，至少包含：
1. **主鍵欄位**（用於變數捕獲）
2. **必要業務欄位**（如 name, status）
3. **外鍵欄位**（如 teamId for Player）

### 欄位對照表（常用）

| Entity | 必填欄位 |
|--------|---------|
| 使用者 | userId, name, role, status |
| 球隊 | teamId, teamName, status |
| 球員 | playerId, teamId, jerseyNumber, name, position, status |
| 訓練 | trainingId, teamId, playerId, trainingDate, status |

---

## 完整轉換範例

### 輸入：docs/gherkin-spec/epic-b/us-b2-create-team.feature（DSL）

```gherkin
# language: zh-TW
# encoding: UTF-8
# Feature: 建立球隊
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22

@epic-b @team @command
Feature: 建立球隊
  身為 教練
  我想要 建立新球隊
  以便 管理球員名單

  Background:
    Given 教練 已登入系統

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

### 輸出：docs/gherkin-spec/isa/epic-b/us-b2-create-team.isa.feature（ISA）

```gherkin
# language: zh-TW
# encoding: UTF-8
# Feature: 建立球隊
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# ISA Compatible: Yes

@epic-b @team @command
Feature: 建立球隊
  身為 教練
  我想要 建立新球隊
  以便 管理球員名單

  Background:
    Given 準備一個使用者, with table:
      | >User.id | name | role  | status |
      | <userId  | 教練 | COACH | ACTIVE |

  Rule: 球隊名稱必須唯一

    @happy-path
    Example: 成功建立球隊
      When (UID="$User.id") 建立球隊, call table:
        | teamName |
        | 閃電隊   |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球隊, with table:
        | teamName | status |
        | 閃電隊   | ACTIVE |

    @error-handling
    Example: 建立重複名稱的球隊應失敗
      Given 準備一個球隊, with table:
        | >Team.id | teamName | status |
        | <teamId  | 閃電隊   | ACTIVE |
      When (UID="$User.id") 建立球隊, call table:
        | teamName |
        | 閃電隊   |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 409 |
```

---

## 轉換後驗證（強制執行）

轉換完成後，**必須**對每個產出的 `.isa.feature` 檔案執行以下驗證：

### 1. ISA Instruction Pattern 驗證

**目的**：確保每個 Step 符合 `isa-codegen.yml` 的 regex pattern

**驗證方式**：
- 讀取 `docs/isa-lint/isa-codegen.yml`
- 逐行檢查 Given/When/Then steps 是否符合對應的 instruction format regex

**必須符合的 Patterns**：

| Step Type | Instruction | Regex Pattern |
|-----------|-------------|---------------|
| Given | Time control | `^現在的時間是 "@time\(\"([^"]+)\"\)"$` |
| Given | Data preparation | `^準備一個(?P<entity>[\u4e00-\u9fffa-zA-Z0-9_]+), with table:$` |
| When | API call | `^\((?:No Actor\|UID="\$(?P<userId>[\w.]+)")\) (?P<summary>.+?), call table:$` |
| Then | Response validation | `^回應, with table:$` |
| Then | Response JSON | `^回應為, with JSON:$` |
| Then | Database validation | `^應該存在一個(?P<entity>[\u4e00-\u9fffa-zA-Z0-9_]+), with table:$` |
| Then | Database non-existence | `^應該不存在一個(?P<entity>[\u4e00-\u9fffa-zA-Z0-9_]+), with table:$` |
| Then | Operation failure | `^操作失敗$` |

**錯誤範例**：
```gherkin
# ❌ 錯誤：Entity 名稱使用英文
Given 準備一個Team, with table:

# ✓ 正確：Entity 名稱使用中文
Given 準備一個球隊, with table:

# ❌ 錯誤：When 缺少 actor 或 call table
When 建立球隊

# ✓ 正確：完整的 API call pattern
When (UID="$User.id") 建立球隊, call table:
```

### 2. Entity 名稱驗證

**目的**：確保所有 Entity 名稱在 `entity_to_table_mapping.yml` 中有定義

**驗證方式**：
- 讀取 `spec/data/entity_to_table_mapping.yml`
- 提取所有 `準備一個{entity}` 和 `應該存在一個{entity}` 中的 entity 名稱
- 檢查是否存在於 `entities:` 定義中

**有效 Entity 名稱清單**：
- 使用者 (User)
- 球隊 (Team)
- 球員 (Player)
- 訓練 (Training)
- 投球 (Pitch)
- 選手統計 (PlayerStats)

**錯誤範例**：
```gherkin
# ❌ 錯誤：「隊伍」未在 mapping 中定義
Given 準備一個隊伍, with table:

# ✓ 正確：使用定義的「球隊」
Given 準備一個球隊, with table:
```

### 3. 欄位名稱驗證

**目的**：確保 DataTable 欄位在 `schema.sql` 中有對應定義

**驗證方式**：
- 讀取 `spec/data/schema.sql`
- 從 DataTable 提取所有欄位名稱（camelCase）
- 轉換為 snake_case 後檢查是否存在於對應的 table schema

**欄位命名規則**：
- DataTable 使用 **camelCase**：`teamId`, `jerseyNumber`, `trainingDate`
- Schema 使用 **snake_case**：`team_id`, `jersey_number`, `training_date`

**錯誤範例**：
```gherkin
# ❌ 錯誤：欄位名稱使用 snake_case
Given 準備一個球隊, with table:
  | team_id | team_name | status |

# ✓ 正確：欄位名稱使用 camelCase
Given 準備一個球隊, with table:
  | teamId | teamName | status |

# ❌ 錯誤：欄位不存在於 schema
Given 準備一個球隊, with table:
  | teamId | invalidField | status |
```

### 4. 必填欄位完整性驗證

**目的**：確保 Given 步驟的 DataTable 包含所有必要欄位

**驗證方式**：
- 參考 `glossary.json` 中的 entity fields 定義
- 檢查 Given 步驟是否包含：
  - 主鍵欄位（用於變數捕獲）
  - 外鍵欄位（如果有依賴）
  - 必要業務欄位（如 name, status）

**必填欄位規則**：

| Entity | 主鍵 | 外鍵 | 必填業務欄位 |
|--------|------|------|-------------|
| 使用者 | userId | - | name, role, status |
| 球隊 | teamId | - | teamName, status |
| 球員 | playerId | teamId | jerseyNumber, name, position, status |
| 訓練 | trainingId | teamId, playerId | trainingDate, status |
| 投球 | pitchId | trainingId | speed, isStrike |

**錯誤範例**：
```gherkin
# ❌ 錯誤：缺少主鍵欄位（無法變數捕獲）
Given 準備一個球隊, with table:
  | teamName | status |
  | 閃電隊   | ACTIVE |

# ❌ 錯誤：缺少外鍵欄位
Given 準備一個球員, with table:
  | playerId | name   | status |
  | <id      | 王小明 | ACTIVE |

# ✓ 正確：包含主鍵、外鍵、必填欄位
Given 準備一個球員, with table:
  | >Player.id | teamId   | jerseyNumber | name   | position | status |
  | <playerId  | $Team.id | 1            | 王小明 | P        | ACTIVE |
```

### 5. 變數捕獲語法驗證

**目的**：確保 Then 步驟的 Database validation 不使用變數捕獲

**驗證方式**：
- 檢查所有 `應該存在一個{entity}, with table:` 和 `應該不存在一個{entity}, with table:` 步驟
- 確認 DataTable 中**沒有**使用 `>` 或 `<` 符號

**禁止規則**（來自 `isa-codegen.yml` 的 `var_step_type_no_capture` linter）：
- Then 步驟的 Database validation **不允許變數捕獲**
- 只能使用 `$` 符號引用已捕獲的變數

**錯誤範例**：
```gherkin
# ❌ 錯誤：Then 步驟使用變數捕獲
Then 應該存在一個球隊, with table:
  | >Team.id | teamName | status |
  | <teamId  | 閃電隊   | ACTIVE |

# ✓ 正確：Then 步驟只引用變數
Then 應該存在一個球隊, with table:
  | teamId   | teamName | status |
  | $Team.id | 閃電隊   | ACTIVE |

# ✓ 正確：不使用變數也可以
Then 應該存在一個球隊, with table:
  | teamName | status |
  | 閃電隊   | ACTIVE |
```

### 6. API Call 參數完整性驗證

**目的**：確保 When 步驟的 API call 包含必要參數

**驗證方式**：
- 根據操作類型判斷必要參數
- 檢查 DataTable 是否包含對應欄位

**常見操作的必要參數**：

| 操作 | 必要參數 |
|------|---------|
| 建立 (Create) | 至少包含 1 個業務欄位 |
| 編輯 (Update) | 必須包含 ID + 至少 1 個更新欄位 |
| 刪除 (Delete) | 必須包含 ID |
| 查詢 (Query) | 可為空或包含篩選參數 |

**錯誤範例**：
```gherkin
# ❌ 錯誤：編輯操作缺少 ID
When (UID="$User.id") 編輯球隊, call table:
  | teamName |
  | 雷霆隊   |

# ✓ 正確：包含 ID + 更新欄位
When (UID="$User.id") 編輯球隊, call table:
  | teamId   | teamName |
  | $Team.id | 雷霆隊   |

# ❌ 錯誤：刪除操作缺少 ID
When (UID="$User.id") 刪除球隊, call table:
  | |

# ✓ 正確：包含要刪除的 ID
When (UID="$User.id") 刪除球隊, call table:
  | teamId   |
  | $Team.id |
```

### 7. ISA Linter 執行驗證

**目的**：使用官方 linter 驗證 ISA 檔案的正確性

**驗證方式**：
- 執行 `docs/isa-lint/isa-lint.sh {epic}/{filename}.isa.feature`
- 檢查是否有 linter errors
- 記錄所有錯誤訊息

**Linter 檢查項目**（來自 `isa-codegen.yml`）：
- `entity_mapping_linter`：驗證 entity 對應
- `db_columns_linter`：驗證 DB 欄位
- `var_system_step_type_linter`：驗證變數系統
- `cas_syntax_linter`：驗證 CAS 語法
- `api_call_linter`：驗證 API 呼叫
- `response_validation_linter`：驗證回應驗證

**執行範例**：
```bash
# 驗證單一檔案
./docs/isa-lint/isa-lint.sh epic-b/us-b2-create-team.isa.feature

# 驗證整個 epic
./docs/isa-lint/isa-lint.sh epic-b/*.isa.feature
```

### 驗證報告格式

每個檔案驗證完成後，應輸出以下報告：

```
✓ us-b2-create-team.isa.feature
  ✓ ISA Instruction Pattern (12/12 passed)
  ✓ Entity 名稱 (2/2 valid)
  ✓ 欄位名稱 (8/8 valid)
  ✓ 必填欄位 (4/4 complete)
  ✓ 變數捕獲語法 (0 errors)
  ✓ API Call 參數 (3/3 complete)
  ✓ ISA Linter (0 errors)

✗ us-b3-create-player.isa.feature
  ✓ ISA Instruction Pattern (15/15 passed)
  ✗ Entity 名稱 (1 invalid: "選手" not found in mapping)
  ✓ 欄位名稱 (10/10 valid)
  ✗ 必填欄位 (1 missing: sortOrder)
  ✓ 變數捕獲語法 (0 errors)
  ✓ API Call 參數 (4/4 complete)
  ✗ ISA Linter (2 errors)
    - Line 42: Invalid entity name
    - Line 58: Missing required field
```

### 驗證失敗處理

若任何驗證項目失敗：
1. **停止轉換流程**
2. **輸出詳細錯誤報告**
3. **提供修復建議**
4. **不產生摘要文件**

---

## 品質檢核清單（人工複查用）

**注意**：上述「轉換後驗證」為**自動執行**的強制檢查。本檢核清單供**人工複查**時使用。

### ISA 語法檢核
- [ ] 所有 Given 使用 `準備一個{entity}, with table:` 格式
- [ ] 所有 When 使用 `(UID="$xxx") {action}, call table:` 格式
- [ ] 成功場景有 `回應, with table:` + statusCode 200
- [ ] 錯誤場景使用 `操作失敗` + 對應的 statusCode
- [ ] Entity 驗證使用 `應該存在一個{entity}, with table:`

### 欄位檢核
- [ ] 所有欄位使用 camelCase
- [ ] 欄位與 glossary.json 定義一致
- [ ] 變數語法正確（>, <, $）
- [ ] 外鍵正確引用（$Team.id, $Player.id）

### 結構檢核
- [ ] 檔案頭部有 `# ISA Compatible: Yes`
- [ ] Background 正確轉換為準備使用者
- [ ] Rule 和 Example 結構保持不變
- [ ] 標籤保持不變

---

## 參考文件

- [ISA 格式規範](.ai-prompts/event-storming/isa-format.md)
- [DSL 格式規範](.ai-prompts/event-storming/dsl-format.md)
- [Entity 定義](docs/gherkin-spec/_meta/glossary.json)
- [詞彙對照表](docs/gherkin-spec/_meta/terminology-mapping.md)
- [ISA Codegen 配置](docs/isa-lint/isa-codegen.yml)
- [Entity 對照表](spec/data/entity_to_table_mapping.yml) - **ISA Lint 驗證用**
- [SQL Schema](spec/data/schema.sql) - **ISA Lint 驗證用**
