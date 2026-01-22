# language: zh-TW
# encoding: UTF-8
# Feature: 使用者登入
# Epic: A - 登入/登出與權限控管
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# Level: DSL
# Boundary Decisions:
#   - Q6: 連續失敗 5 次後鎖定帳號 15 分鐘

@epic-a @auth @command
Feature: 使用者登入
  身為 使用者
  我想要 登入系統
  以便 使用鷹眼訓練平台功能

  Rule: 帳號密碼驗證

    @happy-path
    Example: 成功登入
      Given 系統中存在使用者 "coach01" 密碼為 "password123"
      When 使用者 以帳號 "coach01" 密碼 "password123" 登入
      Then 應成功登入
      And 應收到有效的存取權杖

    @error-handling
    Example: 帳號不存在應登入失敗
      Given 系統中不存在使用者 "unknown"
      When 使用者 以帳號 "unknown" 密碼 "anypassword" 登入
      Then 應回傳錯誤 "帳號或密碼錯誤"

    @error-handling
    Example: 密碼錯誤應登入失敗
      Given 系統中存在使用者 "coach01" 密碼為 "password123"
      When 使用者 以帳號 "coach01" 密碼 "wrongpassword" 登入
      Then 應回傳錯誤 "帳號或密碼錯誤"

  Rule: 帳號鎖定機制（連續失敗 5 次後鎖定 15 分鐘）

    @security
    Example: 連續失敗 5 次應鎖定帳號
      Given 系統中存在使用者 "coach01" 密碼為 "password123"
      And 使用者 "coach01" 已連續登入失敗 4 次
      When 使用者 以帳號 "coach01" 密碼 "wrongpassword" 登入
      Then 應回傳錯誤 "帳號已鎖定，請 15 分鐘後再試"
      And 帳號 "coach01" 應被鎖定

    @security
    Example: 帳號鎖定期間無法登入
      Given 系統中存在使用者 "coach01" 密碼為 "password123"
      And 帳號 "coach01" 已被鎖定
      When 使用者 以帳號 "coach01" 密碼 "password123" 登入
      Then 應回傳錯誤 "帳號已鎖定，請 15 分鐘後再試"

    @security
    Example: 鎖定時間過後可重新登入
      Given 系統中存在使用者 "coach01" 密碼為 "password123"
      And 帳號 "coach01" 已被鎖定超過 15 分鐘
      When 使用者 以帳號 "coach01" 密碼 "password123" 登入
      Then 應成功登入
      And 登入失敗次數應重置為 0

    @security
    Example: 成功登入後重置失敗次數
      Given 系統中存在使用者 "coach01" 密碼為 "password123"
      And 使用者 "coach01" 已連續登入失敗 3 次
      When 使用者 以帳號 "coach01" 密碼 "password123" 登入
      Then 應成功登入
      And 登入失敗次數應重置為 0

  Rule: 必填欄位驗證

    @boundary
    Example: 帳號為空應登入失敗
      When 使用者 以帳號 "" 密碼 "password123" 登入
      Then 應回傳錯誤 "帳號不可為空"

    @boundary
    Example: 密碼為空應登入失敗
      When 使用者 以帳號 "coach01" 密碼 "" 登入
      Then 應回傳錯誤 "密碼不可為空"
