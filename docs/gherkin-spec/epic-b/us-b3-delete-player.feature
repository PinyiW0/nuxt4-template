# language: zh-TW
# encoding: UTF-8
# Feature: 刪除球員
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 球員已刪除
# @requires: us-b3-query-player
# Allowed Roles: 管理者, 教練
# Boundary Decisions:
#   - GD-003: 軟刪除

@epic-b @player @command
Feature: 刪除球員
  身為 管理者/教練
  我想要 刪除球員
  以便 維護正確的球員名單

  Background:
    Given 使用者已登入系統
    And 系統中存在球隊 "閃電隊"
    And 球隊 "閃電隊" 有球員 "王小明"，背號 1

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可刪除任意球員

    @permission @happy-path
    Example: 管理者刪除球員
      Given 使用者為「管理者」角色
      And 球隊 "閃電隊" 的建立者為 "coach1"
      When 使用者 從球隊 "閃電隊" 刪除球員 "王小明"
      Then 球員 "王小明" 狀態應為 "DELETED"

  Rule: 教練只能刪除自己球隊的球員

    @permission @happy-path
    Example: 教練刪除自己球隊的球員
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 球隊 "閃電隊" 的建立者為 "coach1"
      When 使用者 從球隊 "閃電隊" 刪除球員 "王小明"
      Then 球員 "王小明" 狀態應為 "DELETED"

    @permission @error-handling
    Example: 教練無法刪除他人球隊的球員
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 球隊 "閃電隊" 的建立者為 "coach2"
      When 使用者 從球隊 "閃電隊" 刪除球員 "王小明"
      Then 應回傳錯誤 "無權限操作此球隊"

  # ===== Phase 2: 核心業務 =====

  Rule: 刪除球員採用軟刪除

    @happy-path
    Example: 軟刪除球員
      Given 使用者為「管理者」角色
      When 使用者 從球隊 "閃電隊" 刪除球員 "王小明"
      Then 球員 "王小明" 狀態應為 "DELETED"
      And 球員 "王小明" 仍存在於資料庫

  # ===== Phase 3: 邊界條件 =====

  Rule: 無法刪除不存在或已刪除的球員

    @error-handling
    Example: 刪除不存在的球員
      Given 使用者為「管理者」角色
      When 使用者 從球隊 "閃電隊" 刪除球員 "不存在"
      Then 應回傳錯誤 "找不到指定的球員"

    @error-handling
    Example: 刪除已刪除的球員
      Given 使用者為「管理者」角色
      And 球隊 "閃電隊" 有球員 "離隊者"，背號 99，狀態為 "DELETED"
      When 使用者 從球隊 "閃電隊" 刪除球員 "離隊者"
      Then 應回傳錯誤 "找不到指定的球員"
