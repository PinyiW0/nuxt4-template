# Feature: 使用者登入
# @publishes: 使用者已登入

Feature: 使用者登入

  作為 使用者
  我想要 登入系統
  以便 使用系統功能

  Background:
    Given 系統中有以下使用者:
      | account  | password   | role   |
      | admin    | Admin123   | 管理者 |
      | coach1   | Coach123   | 教練   |

  Rule: 帳號密碼正確時登入成功

    Example: 管理者登入成功
      Given 使用者 "admin" 尚未登入
      When 使用者以帳號 "admin" 密碼 "Admin123" 登入
      Then 操作成功
      And 使用者 "admin" 已登入
      And 系統回傳登入 Token

    Example: 教練登入成功
      Given 使用者 "coach1" 尚未登入
      When 使用者以帳號 "coach1" 密碼 "Coach123" 登入
      Then 操作成功
      And 使用者 "coach1" 已登入
      And 系統回傳登入 Token

  Rule: 帳號或密碼錯誤時登入失敗，統一顯示錯誤訊息

    Example: 密碼錯誤
      Given 使用者 "admin" 尚未登入
      When 使用者以帳號 "admin" 密碼 "wrongpassword" 登入
      Then 操作失敗
      And 系統顯示 "帳號或密碼錯誤"

    Example: 帳號不存在
      Given 使用者 "nonexistent" 不存在於系統中
      When 使用者以帳號 "nonexistent" 密碼 "anypassword" 登入
      Then 操作失敗
      And 系統顯示 "帳號或密碼錯誤"

  Rule: 連續登入失敗 5 次後帳號鎖定 30 分鐘

    Example: 第 5 次登入失敗後帳號鎖定
      Given 使用者 "admin" 已連續登入失敗 4 次
      When 使用者以帳號 "admin" 密碼 "wrongpassword" 登入
      Then 操作失敗
      And 使用者 "admin" 的帳號已鎖定
      And 使用者 "admin" 的鎖定時間為 30 分鐘後

    Example: 帳號鎖定期間無法登入
      Given 使用者 "admin" 的帳號已鎖定
      And 鎖定時間尚未到期
      When 使用者以帳號 "admin" 密碼 "Admin123" 登入
      Then 操作失敗
      And 系統顯示 "帳號已鎖定，請稍後再試"

    Example: 鎖定時間到期後可重新登入
      Given 使用者 "admin" 的帳號已鎖定
      And 鎖定時間已到期
      When 使用者以帳號 "admin" 密碼 "Admin123" 登入
      Then 操作成功
      And 使用者 "admin" 已登入
      And 使用者 "admin" 的登入失敗次數歸零

  Rule: 登入成功後失敗計數歸零

    Example: 登入成功清除失敗記錄
      Given 使用者 "admin" 已連續登入失敗 3 次
      When 使用者以帳號 "admin" 密碼 "Admin123" 登入
      Then 操作成功
      And 使用者 "admin" 的登入失敗次數歸零
