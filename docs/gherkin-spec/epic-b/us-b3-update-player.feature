# language: zh-TW
# encoding: UTF-8
# Feature: 編輯球員
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 球員已更新
# @requires: us-b3-query-player
# Allowed Roles: 管理者, 教練
# Boundary Decisions:
#   - GD-001: 背號同一球隊內唯一
#   - BD-B001: 背號範圍 0-99

@epic-b @player @command
Feature: 編輯球員
  身為 管理者/教練
  我想要 編輯球員資料
  以便 維護正確的球員名單

  Background:
    Given 使用者已登入系統
    And 系統中存在球隊 "閃電隊"
    And 球隊 "閃電隊" 有球員 "王小明"，背號 1

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可編輯任意球員

    @permission @happy-path
    Example: 管理者編輯球員
      Given 使用者為「管理者」角色
      And 球隊 "閃電隊" 的建立者為 "coach1"
      When 使用者 編輯球員 "王小明" 背號為 10
      Then 球員 "王小明" 背號應為 10

  Rule: 教練只能編輯自己球隊的球員

    @permission @happy-path
    Example: 教練編輯自己球隊的球員
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 球隊 "閃電隊" 的建立者為 "coach1"
      When 使用者 編輯球員 "王小明" 背號為 10
      Then 球員 "王小明" 背號應為 10

    @permission @error-handling
    Example: 教練無法編輯他人球隊的球員
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 球隊 "閃電隊" 的建立者為 "coach2"
      When 使用者 編輯球員 "王小明" 背號為 10
      Then 應回傳錯誤 "無權限操作此球隊"

  # ===== Phase 2: 核心業務 =====

  Rule: 編輯後的背號不可與同隊其他球員重複

    @error-handling
    Example: 編輯為已存在的背號應失敗
      Given 使用者為「管理者」角色
      And 球隊 "閃電隊" 有球員 "李小華"，背號 2
      When 使用者 編輯球員 "王小明" 背號為 2
      Then 應回傳錯誤 "背號已被使用"

    @happy-path
    Example: 編輯為自己原本的背號應成功
      Given 使用者為「管理者」角色
      When 使用者 編輯球員 "王小明" 背號為 1
      Then 球員 "王小明" 背號應為 1

  # ===== Phase 3: 邊界條件 =====

  Rule: 無法編輯不存在或已刪除的球員

    @error-handling
    Example: 編輯不存在的球員
      Given 使用者為「管理者」角色
      When 使用者 編輯球員 "不存在" 背號為 10
      Then 應回傳錯誤 "找不到指定的球員"

    @error-handling
    Example: 編輯已刪除的球員
      Given 使用者為「管理者」角色
      And 球隊 "閃電隊" 有球員 "離隊者"，背號 99，狀態為 "DELETED"
      When 使用者 編輯球員 "離隊者" 背號為 10
      Then 應回傳錯誤 "找不到指定的球員"

  Rule: 背號範圍為 0-99

    @boundary @error-handling
    Example: 編輯背號超過範圍應失敗
      Given 使用者為「管理者」角色
      When 使用者 編輯球員 "王小明" 背號為 100
      Then 應回傳錯誤 "背號必須在 0-99 之間"
