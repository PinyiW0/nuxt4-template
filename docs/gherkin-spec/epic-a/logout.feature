# language: zh-TW
# encoding: UTF-8
# Feature: 使用者登出
# Epic: A - 登入/登出與權限控管
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# Level: DSL

@epic-a @auth @command
Feature: 使用者登出
  身為 使用者
  我想要 登出系統
  以便 結束使用並保護帳號安全

  Rule: 登出操作

    @happy-path
    Example: 成功登出
      Given 使用者 "coach01" 已登入
      When 使用者 執行登出
      Then 應成功登出
      And 原有的存取權杖應失效

    @error-handling
    Example: 未登入狀態執行登出應失敗
      Given 使用者 尚未登入
      When 使用者 執行登出
      Then 應回傳錯誤 "未授權的操作"
