# language: zh-TW
# encoding: UTF-8
# Feature: 查詢球員列表
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 球員列表已查詢
# @requires: us-b1-select-team
# Allowed Roles: 管理者, 教練

@epic-b @player @query
Feature: 查詢球員列表
  身為 管理者/教練
  我想要 查詢球隊的球員列表
  以便 管理球員名單

  Background:
    Given 使用者已登入系統
    And 系統中存在球隊 "閃電隊"

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可查詢任意球隊的球員

    @permission @happy-path
    Example: 管理者查詢球員列表
      Given 使用者為「管理者」角色
      And 球隊 "閃電隊" 的建立者為 "coach1"
      And 球隊 "閃電隊" 有以下球員:
        | 姓名   | 背號 | 守備位置 |
        | 王小明 | 1    | 投手     |
        | 李小華 | 2    | 捕手     |
      When 使用者 查詢球隊 "閃電隊" 的球員列表
      Then 應回傳 2 筆球員
      And 應包含球員 "王小明"
      And 應包含球員 "李小華"

  Rule: 教練只能查詢自己球隊的球員

    @permission @happy-path
    Example: 教練查詢自己球隊的球員
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 球隊 "閃電隊" 的建立者為 "coach1"
      And 球隊 "閃電隊" 有球員 "王小明"，背號 1
      When 使用者 查詢球隊 "閃電隊" 的球員列表
      Then 應回傳 1 筆球員

    @permission @error-handling
    Example: 教練無法查詢他人球隊的球員
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 球隊 "閃電隊" 的建立者為 "coach2"
      When 使用者 查詢球隊 "閃電隊" 的球員列表
      Then 應回傳錯誤 "無權限操作此球隊"

  # ===== Phase 2: 核心業務 =====

  Rule: 查詢結果依排序顯示

    @happy-path
    Example: 球員依排序順序顯示
      Given 使用者為「管理者」角色
      And 球隊 "閃電隊" 有以下球員:
        | 姓名   | 背號 | 排序 |
        | 李小華 | 2    | 1    |
        | 王小明 | 1    | 2    |
      When 使用者 查詢球隊 "閃電隊" 的球員列表
      Then 球員列表第 1 筆應為 "李小華"
      And 球員列表第 2 筆應為 "王小明"

  Rule: 查詢結果過濾已刪除的球員

    @happy-path
    Example: 已刪除的球員不顯示
      Given 使用者為「管理者」角色
      And 球隊 "閃電隊" 有球員 "王小明"，背號 1，狀態為 "ACTIVE"
      And 球隊 "閃電隊" 有球員 "離隊者"，背號 99，狀態為 "DELETED"
      When 使用者 查詢球隊 "閃電隊" 的球員列表
      Then 應回傳 1 筆球員
      And 應包含球員 "王小明"
      And 不應包含球員 "離隊者"

  # ===== Phase 3: 邊界條件 =====

  Rule: 無球員時應回傳空列表

    @boundary
    Example: 新球隊沒有球員
      Given 使用者為「管理者」角色
      And 球隊 "閃電隊" 沒有任何球員
      When 使用者 查詢球隊 "閃電隊" 的球員列表
      Then 應回傳 0 筆球員
