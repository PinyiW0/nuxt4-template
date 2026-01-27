# Feature: 建立球隊
# @publishes: 球隊已建立

Feature: 建立球隊

  作為 已登入的使用者
  我想要 建立新球隊
  以便 管理球員資料

  Background:
    Given 系統中有以下使用者:
      | account | password | role   |
      | admin   | Admin123 | 管理者 |
      | coach1  | Coach123 | 教練   |
    And 系統中有以下球隊:
      | team_id | name     | created_by | is_deleted |
      | 1       | 藍鷹隊   | coach1     | false      |

  Rule: 管理者和教練都可以建立球隊

    Example: 管理者建立球隊
      Given 使用者 "admin" 已登入系統
      When 使用者 "admin" 建立球隊，名稱為 "白虎隊"
      Then 操作成功
      And 球隊 "白虎隊" 已建立
      And 球隊 "白虎隊" 的建立者為 "admin"
      And 球隊 "白虎隊" 的建立時間已記錄

    Example: 教練建立球隊
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 建立球隊，名稱為 "黑豹隊"
      Then 操作成功
      And 球隊 "黑豹隊" 已建立
      And 球隊 "黑豹隊" 的建立者為 "coach1"
      And 球隊 "黑豹隊" 的建立時間已記錄

  Rule: 球隊名稱不可重複

    Example: 建立重複名稱的球隊
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 建立球隊，名稱為 "藍鷹隊"
      Then 操作失敗
      And 系統顯示 "球隊名稱已存在"

  Rule: 球隊名稱為必填且最長 50 字元

    Example: 球隊名稱為空
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 建立球隊，名稱為 ""
      Then 操作失敗
      And 系統顯示 "球隊名稱為必填"

    Example: 球隊名稱超過 50 字元
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 建立球隊，名稱為 "這是一個超過五十個字元的球隊名稱測試這是一個超過五十個字元的球隊名稱測試這是一個超過五十個字元"
      Then 操作失敗
      And 系統顯示 "球隊名稱不可超過 50 字元"

  Rule: 建立球隊時自動記錄建立者和建立時間

    Example: 系統自動記錄建立資訊
      Given 使用者 "coach1" 已登入系統
      And 目前時間為 "2026-01-23T10:00:00"
      When 使用者 "coach1" 建立球隊，名稱為 "新球隊"
      Then 操作成功
      And 球隊 "新球隊" 的 created_by 為 "coach1"
      And 球隊 "新球隊" 的 created_at 為 "2026-01-23T10:00:00"
      And 球隊 "新球隊" 的 is_deleted 為 false
