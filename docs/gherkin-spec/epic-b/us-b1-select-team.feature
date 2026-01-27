# language: zh-TW
# encoding: UTF-8
# Feature: 選擇球隊
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 球隊已選擇
# @requires: us-b1-query-team
# Allowed Roles: 管理者, 教練

@epic-b @team @command
Feature: 選擇球隊
  身為 管理者/教練
  我想要 選擇球隊
  以便 管理該隊球員

  Background:
    Given 使用者已登入系統

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可選擇任意球隊

    @permission @happy-path
    Example: 管理者選擇球隊
      Given 使用者為「管理者」角色
      And 系統中存在球隊 "藍鷹隊"，建立者為 "coach1"
      When 使用者 選擇球隊 "藍鷹隊"
      Then 球隊 "藍鷹隊" 已被選擇

  Rule: 教練只能選擇自己建立的球隊

    @permission @happy-path
    Example: 教練選擇自己建立的球隊
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 系統中存在球隊 "藍鷹隊"，建立者為 "coach1"
      When 使用者 選擇球隊 "藍鷹隊"
      Then 球隊 "藍鷹隊" 已被選擇

    @permission @error-handling
    Example: 教練無法選擇他人建立的球隊
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 系統中存在球隊 "紅龍隊"，建立者為 "coach2"
      When 使用者 選擇球隊 "紅龍隊"
      Then 應回傳錯誤 "無權限操作此球隊"

  # ===== Phase 3: 邊界條件 =====

  Rule: 無法選擇不存在或已刪除的球隊

    @error-handling
    Example: 選擇不存在的球隊
      Given 使用者為「管理者」角色
      And 系統中不存在球隊 "幽靈隊"
      When 使用者 選擇球隊 "幽靈隊"
      Then 應回傳錯誤 "找不到指定的球隊"

    @error-handling
    Example: 選擇已刪除的球隊
      Given 使用者為「管理者」角色
      And 系統中存在球隊 "解散隊"，狀態為 "DELETED"
      When 使用者 選擇球隊 "解散隊"
      Then 應回傳錯誤 "球隊不存在或已刪除"
