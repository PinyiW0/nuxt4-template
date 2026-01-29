# @publishes: 使用者已登入
Feature: 使用者登入

  Background:
    Given 系統中有以下使用者：
      | account  | password | role   | status   | failed_attempts | locked_until |
      | admin    | pass123  | 管理者 | active   | 0               |              |
      | coach1   | pass123  | 教練   | active   | 0               |              |
      | locked1  | pass123  | 教練   | active   | 5               | 2026-01-26T12:00:00 |

  Rule: 使用者以帳號密碼登入，成功後取得 JWT Token

    Example: 登入成功
      Given 使用者 "coach1" 尚未登入
      When 使用者以帳號 "coach1" 密碼 "pass123" 登入
      Then 操作成功
      And 系統回傳 Access Token（有效期 1-2 小時）
      And 系統回傳 Refresh Token（有效期 7 天）
      And 系統產生 "使用者已登入" 事件

  Rule: 帳號或密碼錯誤時登入失敗

    Example: 密碼錯誤
      Given 使用者 "coach1" 尚未登入
      When 使用者以帳號 "coach1" 密碼 "wrongpass" 登入
      Then 操作失敗
      And 系統顯示 "帳號或密碼錯誤"

    Example: 帳號不存在
      Given 使用者 "unknown" 不存在
      When 使用者以帳號 "unknown" 密碼 "pass123" 登入
      Then 操作失敗
      And 系統顯示 "帳號或密碼錯誤"

  Rule: 連續登入失敗 5 次後，帳號鎖定 15 分鐘

    Example: 第 5 次登入失敗後帳號被鎖定
      Given 使用者 "coach1" 已連續登入失敗 4 次
      When 使用者以帳號 "coach1" 密碼 "wrongpass" 登入
      Then 操作失敗
      And 系統顯示 "帳號已鎖定，請 15 分鐘後再試"
      And 帳號 "coach1" 被鎖定 15 分鐘

    Example: 鎖定期間嘗試登入
      Given 使用者 "locked1" 帳號已被鎖定
      When 使用者以帳號 "locked1" 密碼 "pass123" 登入
      Then 操作失敗
      And 系統顯示 "帳號已鎖定，請稍後再試"

    Example: 鎖定期滿後可重新登入
      Given 使用者 "locked1" 帳號鎖定已過期
      When 使用者以帳號 "locked1" 密碼 "pass123" 登入
      Then 操作成功
      And 登入失敗次數重置為 0

  Rule: Access Token 過期後可用 Refresh Token 換取新 Token

    Example: 使用 Refresh Token 換取新 Access Token
      Given 使用者 "coach1" 已登入
      And Access Token 已過期
      And Refresh Token 仍有效
      When 使用者以 Refresh Token 請求新 Token
      Then 操作成功
      And 系統回傳新的 Access Token

    Example: Refresh Token 已過期
      Given 使用者 "coach1" 已登入
      And Refresh Token 已過期
      When 使用者以 Refresh Token 請求新 Token
      Then 操作失敗
      And 系統顯示 "請重新登入"
