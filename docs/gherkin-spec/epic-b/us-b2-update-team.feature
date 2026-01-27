# language: zh-TW
# encoding: UTF-8
# Feature: 編輯球隊
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 球隊已更新
# @requires: us-b1-select-team
# Allowed Roles: 管理者, 教練
# Boundary Decisions:
#   - GD-004: 球隊名稱不區分大小寫

@epic-b @team @command
Feature: 編輯球隊
  身為 管理者/教練
  我想要 編輯球隊資料
  以便 確保名單正確

  Background:
    Given 使用者已登入系統

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可編輯所有球隊

    @permission @happy-path
    Example: 管理者編輯任意球隊
      Given 使用者為「管理者」角色
      And 系統中存在球隊 "藍鷹隊"，建立者為 "coach1"
      When 使用者 編輯球隊 "藍鷹隊" 名稱為 "蒼鷹隊"
      Then 球隊名稱應更新為 "蒼鷹隊"

  Rule: 教練只能編輯自己建立的球隊

    @permission @happy-path
    Example: 教練編輯自己建立的球隊
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 系統中存在球隊 "藍鷹隊"，建立者為 "coach1"
      When 使用者 編輯球隊 "藍鷹隊" 名稱為 "蒼鷹隊"
      Then 球隊名稱應更新為 "蒼鷹隊"

    @permission @error-handling
    Example: 教練無法編輯他人建立的球隊
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 系統中存在球隊 "紅龍隊"，建立者為 "coach2"
      When 使用者 編輯球隊 "紅龍隊" 名稱為 "火龍隊"
      Then 應回傳錯誤 "無權限操作此球隊"

  # ===== Phase 2: 核心業務 =====

  Rule: 編輯後的名稱不可與其他球隊重複

    @error-handling
    Example: 編輯為已存在的球隊名稱應失敗
      Given 使用者為「管理者」角色
      And 系統中存在球隊 "藍鷹隊"
      And 系統中存在球隊 "紅龍隊"
      When 使用者 編輯球隊 "藍鷹隊" 名稱為 "紅龍隊"
      Then 應回傳錯誤 "球隊名稱已被使用"

  # ===== Phase 3: 邊界條件 =====

  Rule: 無法編輯不存在或已刪除的球隊

    @error-handling
    Example: 編輯不存在的球隊
      Given 使用者為「管理者」角色
      And 系統中不存在球隊 "幽靈隊"
      When 使用者 編輯球隊 "幽靈隊" 名稱為 "新隊名"
      Then 應回傳錯誤 "找不到指定的球隊"

    @error-handling
    Example: 編輯已刪除的球隊
      Given 使用者為「管理者」角色
      And 系統中存在球隊 "解散隊"，狀態為 "DELETED"
      When 使用者 編輯球隊 "解散隊" 名稱為 "新隊名"
      Then 應回傳錯誤 "球隊不存在或已刪除"

  Rule: 新名稱不可為空

    @boundary
    Example: 編輯為空名稱應失敗
      Given 使用者為「管理者」角色
      And 系統中存在球隊 "藍鷹隊"
      When 使用者 編輯球隊 "藍鷹隊" 名稱為 ""
      Then 應回傳錯誤 "球隊名稱不可為空"
