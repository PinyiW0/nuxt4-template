# Feature: 編輯球員
# @publishes: 球員已更新

Feature: 編輯球員

  作為 已登入的使用者
  我想要 編輯球員資料
  以便 更新球員資訊

  Background:
    Given 系統中有以下使用者:
      | account | password | role   |
      | admin   | Admin123 | 管理者 |
      | coach1  | Coach123 | 教練   |
      | coach2  | Coach456 | 教練   |
    And 系統中有以下球隊:
      | team_id | name     | created_by | is_deleted |
      | 1       | 藍鷹隊   | coach1     | false      |
      | 2       | 紅龍隊   | coach2     | false      |
    And 球隊 "藍鷹隊" 有以下球員:
      | player_id | name   | jersey_number | height | position | is_deleted |
      | 101       | 王小明 | 1             | 175    | P        | false      |
      | 102       | 李小華 | 10            | 180    | C        | false      |
      | 103       | 已刪除球員 | 99        | 170    | SS       | true       |

  Rule: 管理者可編輯所有球隊的球員

    Example: 管理者編輯球員
      Given 使用者 "admin" 已登入系統
      When 使用者 "admin" 將球員 "王小明" 的姓名改為 "王大明"
      Then 操作成功
      And 球員姓名已更新為 "王大明"

  Rule: 教練只能編輯自己球隊的球員

    Example: 教練編輯自己球隊的球員
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 將球員 "王小明" 的身高改為 178
      Then 操作成功
      And 球員 "王小明" 的身高已更新為 178

    Example: 教練無法編輯他人球隊的球員
      Given 使用者 "coach1" 已登入系統
      And 球隊 "紅龍隊" 有球員 "林小龍"
      When 使用者 "coach1" 將球員 "林小龍" 的姓名改為 "林大龍"
      Then 操作失敗
      And 系統顯示 "無權限編輯此球員"

  Rule: 已刪除的球員不可編輯

    Example: 編輯已刪除的球員
      Given 使用者 "admin" 已登入系統
      When 使用者 "admin" 將球員 "已刪除球員" 的姓名改為 "復活球員"
      Then 操作失敗
      And 系統顯示 "球員不存在或已刪除"

  Rule: 編輯後的背號必須在 0-99 範圍內

    Example: 編輯背號超出範圍
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 將球員 "王小明" 的背號改為 100
      Then 操作失敗
      And 系統顯示 "背號必須在 0-99 之間"

  Rule: 編輯後的背號不可與同隊其他球員重複

    Example: 編輯為已存在的背號
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 將球員 "王小明" 的背號改為 10
      Then 操作失敗
      And 系統顯示 "背號已被使用"

    Example: 保持原背號不算重複
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 將球員 "王小明" 的背號改為 1
      Then 操作成功
      And 球員 "王小明" 的背號維持 1

  Rule: 編輯後的身高必須在 100-220 公分範圍內

    Example: 編輯身高超出範圍
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 將球員 "王小明" 的身高改為 250
      Then 操作失敗
      And 系統顯示 "身高必須在 100-220 公分之間"

  Rule: 編輯後的守備位置必須是有效值

    Example: 編輯為無效守備位置
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 將球員 "王小明" 的守備位置改為 "XX"
      Then 操作失敗
      And 系統顯示 "守備位置無效"

    Example: 編輯為有效守備位置
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 將球員 "王小明" 的守備位置改為 "DH"
      Then 操作成功
      And 球員 "王小明" 的守備位置已更新為 "DH"
