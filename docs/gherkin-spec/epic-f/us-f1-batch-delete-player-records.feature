# language: zh-TW
# encoding: UTF-8
# Feature: 批次刪除選手紀錄
# Epic: F - 選手分析（長期表現追蹤）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 選手紀錄已批次刪除
# @requires: us-f1-query-player-records
# Allowed Roles: 管理者, 教練

@epic-f @player @command
Feature: 批次刪除選手紀錄
  身為 分析使用者
  我想要 批次刪除選手的分析紀錄
  以便 管理選手分析資料

  Background:
    Given 使用者已登入系統
    And 使用者已進入影像數據分析頁面
    And 系統中存在選手 "王小明"
    And 系統中存在選手 "李小華"

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可批次刪除所有選手紀錄

    @permission @happy-path
    Example: 管理者批次刪除選手紀錄
      Given 使用者為「管理者」角色
      And 選手 "王小明" 的球隊建立者為 "coach1"
      And 選手 "李小華" 的球隊建立者為 "coach2"
      When 使用者 批次刪除選手 "王小明", "李小華" 的分析紀錄
      Then 選手 "王小明" 的分析紀錄已刪除
      And 選手 "李小華" 的分析紀錄已刪除

  Rule: 教練只能批次刪除自己球隊選手的紀錄

    @permission @happy-path
    Example: 教練批次刪除自己球隊選手的紀錄
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 選手 "王小明" 的球隊建立者為 "coach1"
      And 選手 "李小華" 的球隊建立者為 "coach1"
      When 使用者 批次刪除選手 "王小明", "李小華" 的分析紀錄
      Then 選手 "王小明" 的分析紀錄已刪除
      And 選手 "李小華" 的分析紀錄已刪除

    @permission @error-handling
    Example: 教練無法批次刪除包含他人球隊選手
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 選手 "王小明" 的球隊建立者為 "coach1"
      And 選手 "李小華" 的球隊建立者為 "coach2"
      When 使用者 批次刪除選手 "王小明", "李小華" 的分析紀錄
      Then 應回傳錯誤 "無權限執行此操作"

  # ===== Phase 3: 邊界條件 =====

  Rule: 所選選手必須都存在

    @error-handling
    Example: 包含不存在的選手
      Given 使用者為「管理者」角色
      When 使用者 批次刪除選手 "王小明", "不存在" 的分析紀錄
      Then 應回傳錯誤 "找不到指定的選手"
