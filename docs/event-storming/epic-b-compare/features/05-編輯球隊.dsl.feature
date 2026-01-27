# Feature: 編輯球隊
# @publishes: 球隊已更新

Feature: 編輯球隊

  作為 已登入的使用者
  我想要 編輯球隊資料
  以便 更新球隊資訊

  Background:
    Given 系統中有以下使用者:
      | account | password | role   |
      | admin   | Admin123 | 管理者 |
      | coach1  | Coach123 | 教練   |
      | coach2  | Coach456 | 教練   |
    And 系統中有以下球隊:
      | team_id | name       | created_by | is_deleted |
      | 1       | 藍鷹隊     | coach1     | false      |
      | 2       | 紅龍隊     | coach2     | false      |
      | 3       | 已刪除隊   | coach1     | true       |

  Rule: 管理者可編輯所有球隊

    Example: 管理者編輯任意球隊
      Given 使用者 "admin" 已登入系統
      When 使用者 "admin" 將球隊 "藍鷹隊" 的名稱改為 "藍鷹一隊"
      Then 操作成功
      And 球隊名稱已更新為 "藍鷹一隊"

  Rule: 教練只能編輯自己建立的球隊

    Example: 教練編輯自己建立的球隊
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 將球隊 "藍鷹隊" 的名稱改為 "藍鷹一隊"
      Then 操作成功
      And 球隊名稱已更新為 "藍鷹一隊"

    Example: 教練無法編輯他人建立的球隊
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 將球隊 "紅龍隊" 的名稱改為 "紅龍一隊"
      Then 操作失敗
      And 系統顯示 "無權限編輯此球隊"

  Rule: 已刪除的球隊不可編輯

    Example: 編輯已刪除的球隊
      Given 使用者 "admin" 已登入系統
      When 使用者 "admin" 將球隊 "已刪除隊" 的名稱改為 "復活隊"
      Then 操作失敗
      And 系統顯示 "球隊不存在或已刪除"

  Rule: 編輯後的球隊名稱不可與其他球隊重複

    Example: 編輯為已存在的名稱
      Given 使用者 "admin" 已登入系統
      When 使用者 "admin" 將球隊 "藍鷹隊" 的名稱改為 "紅龍隊"
      Then 操作失敗
      And 系統顯示 "球隊名稱已存在"

  Rule: 編輯後的球隊名稱最長 50 字元

    Example: 編輯為超過 50 字元的名稱
      Given 使用者 "admin" 已登入系統
      When 使用者 "admin" 將球隊 "藍鷹隊" 的名稱改為 "這是一個超過五十個字元的球隊名稱測試這是一個超過五十個字元的球隊名稱測試這是一個超過五十個字元"
      Then 操作失敗
      And 系統顯示 "球隊名稱不可超過 50 字元"
