# Feature: 調整球員排序
# @publishes: 球員排序已更新

Feature: 調整球員排序

  作為 已登入的使用者
  我想要 調整球員的排序順序
  以便 自訂球員列表的顯示順序

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
    And 球隊 "藍鷹隊" 有以下球員（依排序順序）:
      | player_id | name   | sort_order |
      | 101       | 王小明 | 1          |
      | 102       | 李小華 | 2          |
      | 103       | 張大勇 | 3          |

  Rule: 管理者可調整所有球隊的球員排序

    Example: 管理者調整球員排序
      Given 使用者 "admin" 已登入系統
      When 使用者 "admin" 將球隊 "藍鷹隊" 的球員排序調整為:
        | name   | sort_order |
        | 張大勇 | 1          |
        | 王小明 | 2          |
        | 李小華 | 3          |
      Then 操作成功
      And 球員 "張大勇" 的 sort_order 為 1
      And 球員 "王小明" 的 sort_order 為 2
      And 球員 "李小華" 的 sort_order 為 3

  Rule: 教練只能調整自己球隊的球員排序

    Example: 教練調整自己球隊的球員排序
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 將球隊 "藍鷹隊" 的球員排序調整為:
        | name   | sort_order |
        | 李小華 | 1          |
        | 張大勇 | 2          |
        | 王小明 | 3          |
      Then 操作成功
      And 球員 "李小華" 的 sort_order 為 1

    Example: 教練無法調整他人球隊的球員排序
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 調整球隊 "紅龍隊" 的球員排序
      Then 操作失敗
      And 系統顯示 "無權限操作此球隊"

  Rule: 排序透過 sort_order 欄位持久化

    Example: 排序調整後持久化儲存
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 將球員 "張大勇" 移動到第一位
      Then 操作成功
      And 球員 "張大勇" 的 sort_order 已更新為 1
      And 球員 "王小明" 的 sort_order 已更新為 2
      And 球員 "李小華" 的 sort_order 已更新為 3
      And 排序變更已儲存到資料庫

  Rule: 支援拖曳排序操作

    Example: 拖曳球員到新位置
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 將球員 "李小華" 拖曳到第一位
      Then 操作成功
      And 球員 "李小華" 的 sort_order 為 1
      And 球員 "王小明" 的 sort_order 為 2
      And 球員 "張大勇" 的 sort_order 為 3

    Example: 拖曳球員到最後位置
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 將球員 "王小明" 拖曳到最後位置
      Then 操作成功
      And 球員 "李小華" 的 sort_order 為 1
      And 球員 "張大勇" 的 sort_order 為 2
      And 球員 "王小明" 的 sort_order 為 3

  Rule: 只能調整同一球隊內的球員排序

    Example: 嘗試跨球隊調整排序
      Given 使用者 "admin" 已登入系統
      And 球隊 "紅龍隊" 有球員 "林小龍"
      When 使用者 "admin" 嘗試將球員 "林小龍" 移動到球隊 "藍鷹隊" 的排序中
      Then 操作失敗
      And 系統顯示 "只能調整同一球隊內的球員排序"
