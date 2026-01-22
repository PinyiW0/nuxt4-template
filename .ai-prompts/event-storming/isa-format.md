# ISA Gherkin 格式規範（Gherkin v6.x）

本文件定義 Event Storming 產出的 Gherkin 語法規範，確保與 ISA-codegen 相容。

## Gherkin v6.x 關鍵變更

| 舊語法 | 新語法（v6.x） | 說明 |
|--------|----------------|------|
| `Scenario:` | `Example:` | Example 更符合 BDD 語意 |
| - | `Rule:` | 新增業務規則分組關鍵字 |
| `Background:` | `Background:` | 可在 Feature 或 Rule 層級使用 |

---

## Feature 檔案結構

### 基本結構（不使用 Rule）

```gherkin
# language: zh-TW
# encoding: UTF-8
# Feature: US-{StoryId} {標題}
# Epic: {EpicId} - {Epic 名稱}
# Source: docs/user-stories/user-v1.md
# Generated: YYYY-MM-DD
# ISA Compatible: Yes

@epic-{x} @{entity} @{type}
Feature: US-{StoryId} {標題}
  身為 {角色}
  我想要 {目標}
  以便 {原因}

  Background:
    # 共用前置條件

  @happy-path
  Example: {場景名稱}
    Given ...
    When ...
    Then ...
```

### 進階結構（使用 Rule 分組）

```gherkin
# language: zh-TW
# encoding: UTF-8
# Feature: US-B2 球隊維護
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# ISA Compatible: Yes

@epic-b @team @crud
Feature: US-B2 球隊維護
  身為 管理者/教練
  我想要 維護球隊資料
  以便 確保名單正確

  Background:
    Given 準備一個使用者, with table:
      | >User.id | name | role  | status |
      | <userId  | 教練 | COACH | ACTIVE |

  Rule: 建立球隊
    # Rule 層級的 Background 會繼承 Feature 層級的 Background

    @happy-path @create
    Example: 成功建立球隊
      When (UID="$User.id") 建立球隊, call table:
        | teamName |
        | 閃電隊   |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球隊, with table:
        | teamName | status |
        | 閃電隊   | ACTIVE |

    @error-handling @create
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

  Rule: 刪除球隊
    # 另一個業務規則分組

    @happy-path @delete
    Example: 成功刪除無球員的球隊
      Given 準備一個球隊, with table:
        | >Team.id | teamName | status |
        | <teamId  | 閃電隊   | ACTIVE |
      When (UID="$User.id") 刪除球隊, call table:
        | teamId   |
        | $Team.id |
      Then 回應, with table:
        | statusCode | 200 |
```

---

## Given Steps（資料準備）

### 時間設定

```gherkin
Given 現在的時間是 "@time(\"2026-01-22T09:00:00\")"
```

### 準備 Entity 資料

使用 `with table:` 關鍵字：

```gherkin
Given 準備一個球隊, with table:
  | >Team.id | teamName | status |
  | <teamId  | 閃電隊   | ACTIVE |
```

### 準備使用者

```gherkin
Given 準備一個使用者, with table:
  | >User.id | name | role  | status |
  | <userId  | 教練 | COACH | ACTIVE |
```

### 準備多筆資料

```gherkin
Given 準備一個球隊, with table:
  | >Team1.id | teamName | status |
  | <teamId   | 閃電隊   | ACTIVE |
And 準備一個球隊, with table:
  | >Team2.id | teamName | status |
  | <teamId   | 勇士隊   | ACTIVE |
```

---

## When Steps（API 呼叫）

### 有認證的 API

必須使用 `(UID="$User.id")` 格式：

```gherkin
When (UID="$User.id") 查詢球隊列表, call table:
  | status |
  | ACTIVE |
```

### 無認證的 API

使用 `(No Actor)` 格式：

```gherkin
When (No Actor) 取得系統狀態, call table:
  | |
```

### 帶參數的呼叫

```gherkin
When (UID="$User.id") 建立球隊, call table:
  | teamName | description |
  | 閃電隊   | 測試球隊    |
```

### 引用變數的呼叫

```gherkin
When (UID="$User.id") 選擇球隊, call table:
  | teamId   |
  | $Team.id |
```

---

## Then Steps（驗證）

### 回應狀態驗證

```gherkin
Then 回應, with table:
  | statusCode | 200 |
```

### 回應 JSON 驗證

```gherkin
Then 回應為, with JSON:
  """
  {
    "success": true,
    "data": {
      "teamId": "$Team.id",
      "teamName": "閃電隊"
    }
  }
  """
```

### 資料庫存在驗證

```gherkin
Then 應該存在一個球隊, with table:
  | teamId   | teamName | status |
  | $Team.id | 閃電隊   | ACTIVE |
```

### 資料庫不存在驗證

```gherkin
Then 應該不存在一個球隊, with table:
  | teamId   |
  | $Team.id |
```

### 操作失敗

```gherkin
Then 操作失敗
```

### 組合驗證

```gherkin
Then 操作失敗
And 回應, with table:
  | statusCode | 404 |
```

---

## 變數系統

### 捕獲變數（>）

在 Given 中捕獲產生的值：

```gherkin
Given 準備一個球隊, with table:
  | >Team.id | teamName |
  | <teamId  | 閃電隊   |
```

- `>Team.id`：定義變數別名 `Team.id`
- `<teamId`：接收系統產生的值

### 讀取變數（<）

從已捕獲的變數讀取值：

```gherkin
| <teamId  |
```

### 引用變數（$）

在 When/Then 中引用變數：

```gherkin
When (UID="$User.id") 選擇球隊, call table:
  | teamId   |
  | $Team.id |
```

### 特殊值

| 語法 | 用途 |
|------|------|
| `$notnull` | 驗證值非空 |
| `&isNull` | 約束值應為 null |

---

## DataTable 規則

### 欄位命名

- 使用 camelCase（`teamId`, `jerseyNumber`）
- 與 Glossary 定義一致

### 單行表格（Key-Value）

```gherkin
Then 回應, with table:
  | statusCode | 200 |
```

### 多行表格（記錄集）

第一行為欄位名稱：

```gherkin
Given 準備一個球員, with table:
  | >Player.id | teamId   | jerseyNumber | name |
  | <playerId  | $Team.id | 1            | 王小明 |
```

---

## 標籤規範

### 必要標籤

| 標籤 | 格式 | 範例 |
|------|------|------|
| Epic 識別 | `@epic-{letter}` | `@epic-b` |
| Entity 識別 | `@{entity}` | `@team`, `@player` |
| 場景類型 | `@{type}` | `@happy-path`, `@error-handling`, `@boundary` |

### 場景類型標籤

| 標籤 | 用途 |
|------|------|
| `@happy-path` | 正常成功流程 |
| `@error-handling` | 錯誤處理場景 |
| `@boundary` | 邊界條件測試 |

### 操作類型標籤（可選）

| 標籤 | 用途 |
|------|------|
| `@query` | 查詢操作 |
| `@create` | 新增操作 |
| `@update` | 編輯操作 |
| `@delete` | 刪除操作 |

---

## Rule 使用指南

### 何時使用 Rule

- 當一個 Feature 包含多個獨立的業務規則
- 需要為不同規則設定不同的 Background
- 提高可讀性，將相關 Examples 分組

### Rule 與 Background 的關係

```gherkin
Feature: 球隊管理
  Background:
    # Feature 層級 Background - 所有 Example 共用
    Given 準備一個使用者, with table:
      | >User.id | name | role  | status |
      | <userId  | 教練 | COACH | ACTIVE |

  Rule: 建立球隊
    Background:
      # Rule 層級 Background - 只有此 Rule 內的 Example 共用
      # 會在 Feature Background 之後執行
      Given 系統中不存在任何球隊

    Example: 成功建立第一支球隊
      ...

  Rule: 編輯球隊
    # 無額外 Background，只使用 Feature 層級的
    Example: 成功編輯球隊名稱
      ...
```

---

## 完整範例（Gherkin v6.x）

```gherkin
# language: zh-TW
# encoding: UTF-8
# Feature: US-B2 球隊維護（建立/編輯/刪除）
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# ISA Compatible: Yes

@epic-b @team @crud
Feature: US-B2 球隊維護（建立/編輯/刪除）
  身為 管理者/教練
  我想要 維護球隊資料
  以便 確保名單正確

  Background:
    Given 準備一個使用者, with table:
      | >User.id | name | role  | status |
      | <userId  | 教練 | COACH | ACTIVE |

  # ==========================================
  # 建立球隊
  # ==========================================

  @happy-path @create
  Example: 成功建立球隊
    When (UID="$User.id") 建立球隊, call table:
      | teamName |
      | 閃電隊   |
    Then 回應, with table:
      | statusCode | 200 |
    And 應該存在一個球隊, with table:
      | teamName | status |
      | 閃電隊   | ACTIVE |

  @error-handling @create
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

  @boundary @create
  Example: 球隊名稱為空時應失敗
    When (UID="$User.id") 建立球隊, call table:
      | teamName |
      |          |
    Then 操作失敗
    And 回應, with table:
      | statusCode | 400 |

  # ==========================================
  # 編輯球隊
  # ==========================================

  @happy-path @update
  Example: 成功編輯球隊名稱
    Given 準備一個球隊, with table:
      | >Team.id | teamName | status |
      | <teamId  | 閃電隊   | ACTIVE |
    When (UID="$User.id") 編輯球隊, call table:
      | teamId   | teamName |
      | $Team.id | 雷霆隊   |
    Then 回應, with table:
      | statusCode | 200 |
    And 應該存在一個球隊, with table:
      | teamId   | teamName |
      | $Team.id | 雷霆隊   |

  @error-handling @update
  Example: 編輯不存在的球隊應失敗
    When (UID="$User.id") 編輯球隊, call table:
      | teamId                               | teamName |
      | 00000000-0000-0000-0000-000000000000 | 雷霆隊   |
    Then 操作失敗
    And 回應, with table:
      | statusCode | 404 |

  # ==========================================
  # 刪除球隊
  # ==========================================

  @happy-path @delete
  Example: 成功刪除無球員的球隊
    Given 準備一個球隊, with table:
      | >Team.id | teamName | status |
      | <teamId  | 閃電隊   | ACTIVE |
    When (UID="$User.id") 刪除球隊, call table:
      | teamId   |
      | $Team.id |
    Then 回應, with table:
      | statusCode | 200 |
    And 應該不存在一個球隊, with table:
      | teamId   |
      | $Team.id |

  @error-handling @delete
  Example: 刪除尚有球員的球隊應失敗
    Given 準備一個球隊, with table:
      | >Team.id | teamName | status |
      | <teamId  | 閃電隊   | ACTIVE |
    And 準備一個球員, with table:
      | >Player.id | teamId   | jerseyNumber | name   | position | status |
      | <playerId  | $Team.id | 1            | 王小明 | P        | ACTIVE |
    When (UID="$User.id") 刪除球隊, call table:
      | teamId   |
      | $Team.id |
    Then 操作失敗
    And 回應, with table:
      | statusCode | 409 |
```

---

## 品質檢核清單

### 語法檢核（Gherkin v6.x）
- [ ] 使用 `Example:` 而非 `Scenario:`
- [ ] 可選使用 `Rule:` 分組相關 Examples
- [ ] Given 使用 `準備一個{entity}, with table:`
- [ ] When 使用 `(UID="$xxx") {action}, call table:`
- [ ] Then 使用 `回應, with table:` 或 `應該存在一個{entity}, with table:`
- [ ] 錯誤使用 `操作失敗`
- [ ] 時間使用 `@time("...")` 格式

### 欄位檢核
- [ ] 欄位名稱使用 camelCase
- [ ] 欄位與 Glossary 定義一致
- [ ] 變數語法正確（>, <, $）

### 標籤檢核
- [ ] 包含 Epic 標籤
- [ ] 包含 Entity 標籤
- [ ] 包含場景類型標籤
