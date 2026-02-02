# DSL to ISA 轉換規則

## ISA 指令 Patterns

轉換時必須嚴格遵循以下 regex patterns（來自 isa-codegen.yml）：

| 指令 | Step Type | Pattern |
|------|-----------|---------|
| Time control | Given | `^現在的時間是 "@time\(\"...\"\)"$` |
| Data preparation | Given | `^準備一個{entity}, with table:$` |
| API call | When | `^\((?:No Actor\|UID="\$...")\) {summary}, call table:$` |
| Response validation | Then | `^回應, with table:$` |
| Response JSON | Then | `^回應為, with JSON:$` |
| Database validation | Then | `^應該存在一個{entity}, with table:$` |
| Database non-existence | Then | `^應該不存在一個{entity}, with table:$` |
| Operation failure | Then | `^操作失敗$` |

**重要約束**：
- `{entity}` 必須使用**中文名稱**（球隊、球員）
- DataTable 欄位使用 **camelCase**
- Database validation 的 Then 步驟**禁止變數捕獲**

---

## Feature Header 轉換

**DSL**:
```gherkin
# language: zh-TW
# encoding: UTF-8
# Feature: 建立球隊
# Epic: B - 球隊/球員資料管理
```

**ISA**:
```gherkin
# language: zh-TW
# encoding: UTF-8
# Feature: 建立球隊
# Epic: B - 球隊/球員資料管理
# ISA Compatible: Yes
```

---

## Given Steps 轉換

### 使用者登入

| DSL | ISA |
|-----|-----|
| `{Actor} 已登入系統` | `準備一個使用者, with table:` |

```gherkin
# DSL
Given 教練 已登入系統

# ISA
Given 準備一個使用者, with table:
  | >User.id | name | role  | status |
  | <userId  | 教練 | COACH | ACTIVE |
```

### Entity 存在

| DSL | ISA |
|-----|-----|
| `系統中存在{Entity} "{name}"` | `準備一個{Entity}, with table:` |

```gherkin
# DSL
Given 系統中存在球隊 "閃電隊"

# ISA
Given 準備一個球隊, with table:
  | >Team.id | teamName | status |
  | <teamId  | 閃電隊   | ACTIVE |
```

### Entity 不存在

| DSL | ISA |
|-----|-----|
| `系統中沒有{Entity} "{name}"` | （移除，不需要準備） |

### 關聯 Entity

```gherkin
# DSL
Given 球隊 "閃電隊" 有球員 "王小明"，背號 1

# ISA
Given 準備一個球員, with table:
  | >Player.id | teamId   | jerseyNumber | name   | position | status |
  | <playerId  | $Team.id | 1            | 王小明 | P        | ACTIVE |
```

---

## When Steps 轉換

### Command 操作

| DSL | ISA |
|-----|-----|
| `{Actor} {動作} {Entity} "{name}"` | `(UID="$User.id") {摘要}, call table:` |

```gherkin
# DSL - 建立
When 教練 建立球隊 "閃電隊"

# ISA
When (UID="$User.id") 建立球隊, call table:
  | teamName |
  | 閃電隊   |
```

```gherkin
# DSL - 刪除
When 教練 刪除球隊 "閃電隊"

# ISA
When (UID="$User.id") 刪除球隊, call table:
  | teamId   |
  | $Team.id |
```

```gherkin
# DSL - 編輯
When 教練 編輯球隊 "閃電隊" 名稱為 "雷霆隊"

# ISA
When (UID="$User.id") 編輯球隊, call table:
  | teamId   | teamName |
  | $Team.id | 雷霆隊   |
```

### Query 操作

```gherkin
# DSL
When 教練 查詢球隊列表

# ISA
When (UID="$User.id") 查詢球隊列表, call table:
  | |
```

### 無認證操作

```gherkin
When (No Actor) 取得系統狀態, call table:
  | |
```

---

## Then Steps 轉換

### 成功操作

```gherkin
# DSL
Then 球隊 "閃電隊" 應該存在

# ISA
Then 回應, with table:
  | statusCode | 200 |
And 應該存在一個球隊, with table:
  | teamName | status |
  | 閃電隊   | ACTIVE |
```

### Entity 不存在驗證

```gherkin
# DSL
Then 球隊 "閃電隊" 應該不存在

# ISA
Then 應該不存在一個球隊, with table:
  | teamId   |
  | $Team.id |
```

### 錯誤驗證

```gherkin
# DSL
Then 應回傳錯誤 "球隊名稱已被使用"

# ISA
Then 操作失敗
And 回應, with table:
  | statusCode | 409 |
```

**ErrorCode 對照表**：

| 錯誤訊息 | HTTP Status |
|----------|-------------|
| 球隊名稱已被使用 | 409 |
| 球隊名稱不可為空 | 400 |
| 找不到指定的球隊 | 404 |
| 球隊尚有球員，無法刪除 | 409 |
| 背號已被使用 | 409 |
| 背號必須在 0-99 之間 | 400 |
| 權限不足 | 403 |
| 未授權的操作 | 401 |

### 列表驗證

```gherkin
# DSL
Then 應回傳 2 筆球隊
And 應包含球隊 "閃電隊"

# ISA
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

---

## Scenario Outline 轉換

### 基本原則

- `Scenario Outline` 關鍵字保持不變
- `Examples` 表格保持不變
- 參數佔位符 `<參數名>` 保持不變
- 參數用於 DataTable **值**，不能用於**表頭**

### 範例

**DSL**:
```gherkin
Scenario Outline: 背號驗證
  Given 教練 已登入系統
  And 系統中存在球隊 "閃電隊"
  When 教練 建立球員 "測試球員"，背號 <背號>
  Then <結果>

  Examples:
    | 背號 | 結果                           |
    | -1   | 應回傳錯誤 "背號必須在 0-99 之間" |
    | 50   | 球員 "測試球員" 應該存在        |
```

**ISA**:
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
    | 背號 | ISA結果                                              |
    | -1   | 操作失敗\nAnd 回應, with table:\n  \| statusCode \| 400 \| |
    | 50   | 回應, with table:\n  \| statusCode \| 200 \|        |
```

---

## 變數命名規則

### Entity 變數

| Entity | 變數捕獲 | 變數引用 |
|--------|---------|---------|
| 使用者 | `>User.id` / `<userId` | `$User.id` |
| 球隊 | `>Team.id` / `<teamId` | `$Team.id` |
| 球員 | `>Player.id` / `<playerId` | `$Player.id` |
| 訓練 | `>Training.id` / `<trainingId` | `$Training.id` |

### 多個相同 Entity

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

### 必填欄位

| Entity | 主鍵 | 外鍵 | 必填業務欄位 |
|--------|------|------|-------------|
| 使用者 | userId | - | name, role, status |
| 球隊 | teamId | - | teamName, status |
| 球員 | playerId | teamId | jerseyNumber, name, position, status |
| 訓練 | trainingId | teamId, playerId | trainingDate, status |

### 欄位命名

- DataTable 使用 **camelCase**：`teamId`, `jerseyNumber`
- Schema 使用 **snake_case**：`team_id`, `jersey_number`
