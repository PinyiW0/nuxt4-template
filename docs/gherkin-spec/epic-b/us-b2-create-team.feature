# language: zh-TW
# encoding: UTF-8
# Feature: 建立球隊
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 球隊已建立
# Allowed Roles: 管理者, 教練
# Boundary Decisions:
#   - GD-004: 球隊名稱不區分大小寫

@epic-b @team @command
Feature: 建立球隊
  身為 管理者/教練
  我想要 建立新球隊
  以便 管理球員名單

  Background:
    Given 使用者已登入系統

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者與教練皆可建立球隊

    @permission @happy-path
    Example: 管理者建立球隊
      Given 使用者為「管理者」角色
      And 系統中沒有球隊 "閃電隊"
      When 使用者 建立球隊 "閃電隊"
      Then 球隊 "閃電隊" 應該存在
      And 球隊 "閃電隊" 的建立者為目前使用者

    @permission @happy-path
    Example: 教練建立球隊
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 系統中沒有球隊 "閃電隊"
      When 使用者 建立球隊 "閃電隊"
      Then 球隊 "閃電隊" 應該存在
      And 球隊 "閃電隊" 的建立者為 "coach1"

  # ===== Phase 2: 核心業務 =====

  Rule: 球隊名稱必須唯一（不區分大小寫）

    @happy-path
    Example: 成功建立球隊
      Given 使用者為「教練」角色
      And 系統中沒有球隊 "閃電隊"
      When 使用者 建立球隊 "閃電隊"
      Then 球隊 "閃電隊" 應該存在
      And 球隊 "閃電隊" 狀態應為 "ACTIVE"

    @error-handling
    Example: 建立重複名稱的球隊應失敗
      Given 使用者為「教練」角色
      And 系統中存在球隊 "閃電隊"
      When 使用者 建立球隊 "閃電隊"
      Then 應回傳錯誤 "球隊名稱已被使用"

    @error-handling
    Example: 建立僅大小寫不同的球隊名稱應失敗
      Given 使用者為「教練」角色
      And 系統中存在球隊 "TeamA"
      When 使用者 建立球隊 "teama"
      Then 應回傳錯誤 "球隊名稱已被使用"

  Rule: 建立球隊時自動記錄建立者與建立時間

    @happy-path
    Example: 系統記錄審計資訊
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 系統中沒有球隊 "新球隊"
      When 使用者 建立球隊 "新球隊"
      Then 球隊 "新球隊" 的建立者為 "coach1"
      And 球隊 "新球隊" 的建立時間已記錄

  # ===== Phase 3: 邊界條件 =====

  Rule: 球隊名稱不可為空

    @boundary
    Example: 球隊名稱為空應失敗
      Given 使用者為「教練」角色
      When 使用者 建立球隊 ""
      Then 應回傳錯誤 "球隊名稱不可為空"

    @boundary
    Example: 球隊名稱為純空白應失敗
      Given 使用者為「教練」角色
      When 使用者 建立球隊 "   "
      Then 應回傳錯誤 "球隊名稱不可為空"
