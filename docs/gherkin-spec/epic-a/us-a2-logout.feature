# language: zh-TW
# encoding: UTF-8
# Feature: 使用者登出
# Epic: A - 登入/登出與權限控管
# User Story: US-A2
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 使用者已登出
# @requires: us-a1-login

@epic-a @user @command
Feature: 使用者登出
  身為 已登入使用者
  我想要 登出並清除 token
  以便 避免他人使用我的帳號

  Background:
    Given 使用者已登入系統

  # ===== Phase 1: 核心決策 =====

  Rule: 已登入使用者可以登出

    @permission @happy-path
    Example: 管理者登出
      Given 使用者為「管理者」角色
      When 使用者 登出系統
      Then 登出成功
      And 存取權杖應失效

    @permission @happy-path
    Example: 教練登出
      Given 使用者為「教練」角色
      When 使用者 登出系統
      Then 登出成功
      And 存取權杖應失效

  # ===== Phase 2: 核心業務 =====

  Rule: 登出後 token 應失效

    @happy-path
    Example: 登出後無法使用舊 token 存取系統
      Given 使用者為「教練」角色
      And 使用者持有有效的存取權杖
      When 使用者 登出系統
      Then 登出成功
      And 使用舊權杖存取系統應回傳錯誤 "登入已過期，請重新登入"

  # ===== Phase 3: 邊界條件 =====

  Rule: 未登入狀態無法登出

    @boundary
    Example: 未登入時嘗試登出
      Given 使用者未登入系統
      When 使用者 嘗試登出系統
      Then 應回傳錯誤 "未授權的操作"
