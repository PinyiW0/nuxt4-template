# @publishes: 使用者已登出
Feature: 使用者登出

  Background:
    Given 系統中有以下使用者：
      | account | role   | status |
      | coach1  | 教練   | active |

  Rule: 登出時清除前端 Token

    Example: 登出成功
      Given 使用者 "coach1" 已登入
      When 使用者執行登出
      Then 操作成功
      And 前端清除 Access Token
      And 前端清除 Refresh Token
      And 系統產生 "使用者已登出" 事件

  Rule: 未登入狀態執行登出無效果

    Example: 未登入時登出
      Given 使用者 "coach1" 尚未登入
      When 使用者執行登出
      Then 操作成功
      And 無任何狀態變更

  Rule: 允許多裝置同時登入，登出僅影響當前裝置

    Example: 多裝置登入後單一裝置登出
      Given 使用者 "coach1" 已在裝置 A 登入
      And 使用者 "coach1" 已在裝置 B 登入
      When 使用者在裝置 A 執行登出
      Then 裝置 A 的 Token 已清除
      And 裝置 B 的 Token 仍有效
