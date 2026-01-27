# language: zh-TW
# encoding: UTF-8
# Feature: 調整球員排序
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 球員排序已調整
# @requires: us-b3-query-player
# Allowed Roles: 管理者, 教練

@epic-b @player @command
Feature: 調整球員排序
  身為 管理者/教練
  我想要 調整球員排序
  以便 符合教練習慣或出賽順序

  Background:
    Given 使用者已登入系統
    And 系統中存在球隊 "閃電隊"
    And 球隊 "閃電隊" 有以下球員:
      | 姓名   | 背號 | 排序 |
      | 王小明 | 1    | 1    |
      | 李小華 | 2    | 2    |
      | 張大強 | 3    | 3    |

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可調整任意球隊的球員排序

    @permission @happy-path
    Example: 管理者調整球員排序
      Given 使用者為「管理者」角色
      And 球隊 "閃電隊" 的建立者為 "coach1"
      When 使用者 調整球隊 "閃電隊" 的球員排序為 "李小華", "張大強", "王小明"
      Then 球隊 "閃電隊" 的球員排序應為 "李小華", "張大強", "王小明"

  Rule: 教練只能調整自己球隊的球員排序

    @permission @happy-path
    Example: 教練調整自己球隊的球員排序
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 球隊 "閃電隊" 的建立者為 "coach1"
      When 使用者 調整球隊 "閃電隊" 的球員排序為 "李小華", "王小明", "張大強"
      Then 球隊 "閃電隊" 的球員排序應為 "李小華", "王小明", "張大強"

    @permission @error-handling
    Example: 教練無法調整他人球隊的球員排序
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 球隊 "閃電隊" 的建立者為 "coach2"
      When 使用者 調整球隊 "閃電隊" 的球員排序為 "李小華", "王小明", "張大強"
      Then 應回傳錯誤 "無權限操作此球隊"

  # ===== Phase 2: 核心業務 =====

  Rule: 排序調整後立即生效

    @happy-path
    Example: 排序調整後查詢列表應反映新順序
      Given 使用者為「管理者」角色
      When 使用者 調整球隊 "閃電隊" 的球員排序為 "張大強", "李小華", "王小明"
      And 使用者 查詢球隊 "閃電隊" 的球員列表
      Then 球員列表第 1 筆應為 "張大強"
      And 球員列表第 2 筆應為 "李小華"
      And 球員列表第 3 筆應為 "王小明"

  # ===== Phase 3: 邊界條件 =====

  Rule: 無法調整不存在球隊的排序

    @error-handling
    Example: 調整不存在球隊的排序
      Given 使用者為「管理者」角色
      And 系統中不存在球隊 "幽靈隊"
      When 使用者 調整球隊 "幽靈隊" 的球員排序為 "球員A", "球員B"
      Then 應回傳錯誤 "找不到指定的球隊"
