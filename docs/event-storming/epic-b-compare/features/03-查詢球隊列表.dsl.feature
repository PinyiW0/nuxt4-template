# Feature: 查詢球隊列表
# (Query - 無狀態變更)

Feature: 查詢球隊列表

  作為 已登入的使用者
  我想要 查詢球隊列表
  以便 瀏覽可管理的球隊

  Background:
    Given 系統中有以下使用者:
      | account | password | role   |
      | admin   | Admin123 | 管理者 |
      | coach1  | Coach123 | 教練   |
      | coach2  | Coach456 | 教練   |
    And 系統中有以下球隊:
      | team_id | name       | created_by | is_deleted |
      | 1       | 藍鷹隊     | coach1     | false      |
      | 2       | 紅龍隊     | coach1     | false      |
      | 3       | 綠虎隊     | coach2     | false      |
      | 4       | 已刪除隊   | coach1     | true       |

  Rule: 管理者可查詢所有球隊

    Example: 管理者查詢球隊列表
      Given 使用者 "admin" 已登入系統
      When 使用者 "admin" 查詢球隊列表
      Then 操作成功
      And 回傳的球隊列表包含:
        | name     |
        | 藍鷹隊   |
        | 紅龍隊   |
        | 綠虎隊   |
      And 回傳的球隊列表不包含 "已刪除隊"

  Rule: 教練只能查詢自己建立的球隊

    Example: 教練查詢自己建立的球隊
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 查詢球隊列表
      Then 操作成功
      And 回傳的球隊列表包含:
        | name     |
        | 藍鷹隊   |
        | 紅龍隊   |
      And 回傳的球隊列表不包含 "綠虎隊"
      And 回傳的球隊列表不包含 "已刪除隊"

  Rule: 教練尚未建立任何球隊時回傳空列表

    Example: 新教練查詢球隊列表
      Given 系統中有使用者 "coach_new" 角色為 "教練"
      And 使用者 "coach_new" 尚未建立任何球隊
      And 使用者 "coach_new" 已登入系統
      When 使用者 "coach_new" 查詢球隊列表
      Then 操作成功
      And 回傳的球隊列表為空

  Rule: 已刪除的球隊不出現在查詢結果中

    Example: 查詢結果不包含已刪除的球隊
      Given 使用者 "admin" 已登入系統
      When 使用者 "admin" 查詢球隊列表
      Then 操作成功
      And 回傳的球隊列表不包含任何 is_deleted 為 true 的球隊
