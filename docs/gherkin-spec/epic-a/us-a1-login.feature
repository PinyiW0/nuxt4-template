# language: zh-TW
# encoding: UTF-8
# Feature: 使用者登入
# Epic: A - 登入/登出與權限控管
# User Story: US-A1
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 使用者已登入

@epic-a @user @command
Feature: 使用者登入
  身為 系統使用者
  我想要 用帳號/密碼登入
  以便 進入鷹眼系統平台

  # ===== Phase 1: 核心決策 =====

  Rule: 系統管理者與教練皆可登入系統

    @permission @happy-path
    Example: 管理者成功登入
      Given 系統中存在帳號 "admin"，密碼 "password123"，角色為「管理者」
      When 使用者 以帳號 "admin" 密碼 "password123" 登入系統
      Then 登入成功
      And 應取得有效的存取權杖
      And 應顯示使用者角色為「管理者」

    @permission @happy-path
    Example: 教練成功登入
      Given 系統中存在帳號 "coach1"，密碼 "coach123"，角色為「教練」
      When 使用者 以帳號 "coach1" 密碼 "coach123" 登入系統
      Then 登入成功
      And 應取得有效的存取權杖
      And 應顯示使用者角色為「教練」

  # ===== Phase 2: 核心業務 =====

  Rule: 帳號密碼必須正確才能登入

    @error-handling
    Example: 帳號不存在應失敗
      Given 系統中不存在帳號 "unknown"
      When 使用者 以帳號 "unknown" 密碼 "anypassword" 登入系統
      Then 應回傳錯誤 "帳號或密碼錯誤"

    @error-handling
    Example: 密碼錯誤應失敗
      Given 系統中存在帳號 "coach1"，密碼 "coach123"，角色為「教練」
      When 使用者 以帳號 "coach1" 密碼 "wrongpassword" 登入系統
      Then 應回傳錯誤 "帳號或密碼錯誤"

  # ===== Phase 3: 邊界條件 =====

  Rule: 帳號與密碼不可為空

    @boundary
    Example: 帳號為空應失敗
      When 使用者 以帳號 "" 密碼 "password123" 登入系統
      Then 應回傳錯誤 "帳號不可為空"

    @boundary
    Example: 密碼為空應失敗
      When 使用者 以帳號 "coach1" 密碼 "" 登入系統
      Then 應回傳錯誤 "密碼不可為空"

  Rule: 停用帳號無法登入

    @error-handling
    Example: 停用帳號登入應失敗
      Given 系統中存在帳號 "inactive_user"，密碼 "password123"，狀態為「停用」
      When 使用者 以帳號 "inactive_user" 密碼 "password123" 登入系統
      Then 應回傳錯誤 "帳號已停用"
