# DSL to ISA 完整轉換範例

## 範例 1：建立球隊

### DSL (輸入)

```gherkin
# language: zh-TW
# encoding: UTF-8
# Feature: 建立球隊
# Epic: B - 球隊/球員資料管理
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

### ISA (輸出)

```gherkin
# language: zh-TW
# encoding: UTF-8
# Feature: 建立球隊
# Epic: B - 球隊/球員資料管理
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

## 範例 2：建立球員（含關聯）

### DSL (輸入)

```gherkin
@epic-b @player @command
Feature: 建立球員
  身為 教練
  我想要 新增球員到球隊
  以便 管理球員資料

  Background:
    Given 教練 已登入系統
    And 系統中存在球隊 "閃電隊"

  Rule: 背號在同一球隊內必須唯一

    @happy-path
    Example: 成功建立球員
      When 教練 建立球員 "王小明"，背號 1，位置 "P"
      Then 球員 "王小明" 應該存在
      And 球員 "王小明" 屬於球隊 "閃電隊"

    @error-handling
    Example: 背號重複應失敗
      Given 球隊 "閃電隊" 有球員 "李大華"，背號 1
      When 教練 建立球員 "王小明"，背號 1，位置 "C"
      Then 應回傳錯誤 "背號已被使用"
```

### ISA (輸出)

```gherkin
# ISA Compatible: Yes

@epic-b @player @command
Feature: 建立球員
  身為 教練
  我想要 新增球員到球隊
  以便 管理球員資料

  Background:
    Given 準備一個使用者, with table:
      | >User.id | name | role  | status |
      | <userId  | 教練 | COACH | ACTIVE |
    And 準備一個球隊, with table:
      | >Team.id | teamName | status |
      | <teamId  | 閃電隊   | ACTIVE |

  Rule: 背號在同一球隊內必須唯一

    @happy-path
    Example: 成功建立球員
      When (UID="$User.id") 建立球員, call table:
        | teamId   | name   | jerseyNumber | position |
        | $Team.id | 王小明 | 1            | P        |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球員, with table:
        | name   | teamId   | status |
        | 王小明 | $Team.id | ACTIVE |

    @error-handling
    Example: 背號重複應失敗
      Given 準備一個球員, with table:
        | >Player.id | teamId   | jerseyNumber | name   | position | status |
        | <playerId  | $Team.id | 1            | 李大華 | P        | ACTIVE |
      When (UID="$User.id") 建立球員, call table:
        | teamId   | name   | jerseyNumber | position |
        | $Team.id | 王小明 | 1            | C        |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 409 |
```

---

## 範例 3：Scenario Outline

### DSL (輸入)

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

### ISA (輸出)

```gherkin
# ISA Compatible: Yes

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

---

## 範例 4：查詢操作

### DSL (輸入)

```gherkin
@epic-b @team @query
Feature: 查詢球隊列表
  身為 教練
  我想要 查詢所有球隊
  以便 了解目前的球隊狀況

  Background:
    Given 教練 已登入系統

  @happy-path
  Example: 查詢多筆球隊
    Given 系統中存在球隊 "閃電隊"
    And 系統中存在球隊 "勇士隊"
    When 教練 查詢球隊列表
    Then 應回傳 2 筆球隊
    And 應包含球隊 "閃電隊"
    And 應包含球隊 "勇士隊"
```

### ISA (輸出)

```gherkin
# ISA Compatible: Yes

@epic-b @team @query
Feature: 查詢球隊列表
  身為 教練
  我想要 查詢所有球隊
  以便 了解目前的球隊狀況

  Background:
    Given 準備一個使用者, with table:
      | >User.id | name | role  | status |
      | <userId  | 教練 | COACH | ACTIVE |

  @happy-path
  Example: 查詢多筆球隊
    Given 準備一個球隊, with table:
      | >Team1.id | teamName | status |
      | <teamId1  | 閃電隊   | ACTIVE |
    And 準備一個球隊, with table:
      | >Team2.id | teamName | status |
      | <teamId2  | 勇士隊   | ACTIVE |
    When (UID="$User.id") 查詢球隊列表, call table:
      | |
    Then 回應, with table:
      | statusCode | 200 |
    And 回應為, with JSON:
      """
      {
        "data": [
          { "teamName": "閃電隊" },
          { "teamName": "勇士隊" }
        ],
        "total": 2
      }
      """
```

---

## 範例 5：刪除操作

### DSL (輸入)

```gherkin
@epic-b @team @command
Feature: 刪除球隊

  Background:
    Given 教練 已登入系統

  @happy-path
  Example: 成功刪除空球隊
    Given 系統中存在球隊 "閃電隊"
    When 教練 刪除球隊 "閃電隊"
    Then 球隊 "閃電隊" 應該不存在

  @error-handling
  Example: 刪除有球員的球隊應失敗
    Given 系統中存在球隊 "閃電隊"
    And 球隊 "閃電隊" 有球員 "王小明"，背號 1
    When 教練 刪除球隊 "閃電隊"
    Then 應回傳錯誤 "球隊尚有球員，無法刪除"
```

### ISA (輸出)

```gherkin
# ISA Compatible: Yes

@epic-b @team @command
Feature: 刪除球隊

  Background:
    Given 準備一個使用者, with table:
      | >User.id | name | role  | status |
      | <userId  | 教練 | COACH | ACTIVE |

  @happy-path
  Example: 成功刪除空球隊
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

  @error-handling
  Example: 刪除有球員的球隊應失敗
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
