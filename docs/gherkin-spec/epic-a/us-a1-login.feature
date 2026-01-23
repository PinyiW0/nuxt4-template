# language: zh-TW
# encoding: UTF-8
# Feature: 使用者登入
# Epic: A - 登入/登出與權限控管
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23

@epic-a @user @command
Feature: 使用者登入
  身為 系統使用者
  我想要 用帳號/密碼登入
  以便 進入鷹眼系統平台

  Rule: 帳號密碼必須正確才能登入

    @happy-path
    Example: 成功登入系統
      Given 系統中存在帳號 "coach01"，密碼為 "password123"
      When 使用者 輸入帳號 "coach01"，密碼 "password123" 登入
      Then 應成功登入系統
      And 應顯示使用者名稱

    @error-handling
    Example: 帳號不存在應登入失敗
      Given 系統中沒有帳號 "unknown_user"
      When 使用者 輸入帳號 "unknown_user"，密碼 "any_password" 登入
      Then 應回傳錯誤 "帳號或密碼錯誤"

    @error-handling
    Example: 密碼錯誤應登入失敗
      Given 系統中存在帳號 "coach01"，密碼為 "password123"
      When 使用者 輸入帳號 "coach01"，密碼 "wrong_password" 登入
      Then 應回傳錯誤 "帳號或密碼錯誤"

  Rule: 帳號密碼為必填欄位

    @boundary
    Example: 帳號為空應登入失敗
      When 使用者 輸入帳號 ""，密碼 "password123" 登入
      Then 應回傳錯誤 "帳號不可為空"

    @boundary
    Example: 密碼為空應登入失敗
      When 使用者 輸入帳號 "coach01"，密碼 "" 登入
      Then 應回傳錯誤 "密碼不可為空"
