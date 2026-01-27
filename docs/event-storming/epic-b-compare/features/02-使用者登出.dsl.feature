# Feature: 使用者登出
# @publishes: 使用者已登出

Feature: 使用者登出

  作為 已登入的使用者
  我想要 登出系統
  以便 結束使用並保護帳號安全

  Background:
    Given 系統中有以下使用者:
      | account | password | role   |
      | admin   | Admin123 | 管理者 |
      | coach1  | Coach123 | 教練   |

  Rule: 已登入的使用者可以登出

    Example: 使用者登出成功
      Given 使用者 "admin" 已登入系統
      When 使用者 "admin" 執行登出
      Then 操作成功
      And 使用者 "admin" 已登出
      And 使用者 "admin" 的 Token 已失效

  Rule: 重複登出視為成功（冪等操作）

    Example: 已登出的使用者再次登出
      Given 使用者 "admin" 已登出
      When 使用者 "admin" 執行登出
      Then 操作成功

  Rule: 登出後無法使用原 Token 存取系統

    Example: 使用已失效的 Token 存取系統
      Given 使用者 "admin" 已登出
      And 使用者 "admin" 持有已失效的 Token
      When 使用者 "admin" 使用該 Token 存取系統
      Then 操作失敗
      And 系統顯示 "請重新登入"
