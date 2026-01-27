# language: zh-TW
# encoding: UTF-8
# Feature: 批次刪除訓練
# Epic: E - 影像數據分析（歷史訓練）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 訓練已批次刪除
# @requires: us-e2-query-historical-trainings
# Allowed Roles: 管理者, 教練
# Boundary Decisions:
#   - GD-003: 軟刪除

@epic-e @training @command
Feature: 批次刪除訓練
  身為 分析使用者
  我想要 批次刪除多筆訓練紀錄
  以便 清理資料與管理紀錄

  Background:
    Given 使用者已登入系統
    And 使用者已進入影像數據分析頁面
    And 系統中存在訓練 "訓練A"
    And 系統中存在訓練 "訓練B"

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可批次刪除所有訓練

    @permission @happy-path
    Example: 管理者批次刪除訓練
      Given 使用者為「管理者」角色
      And 訓練 "訓練A" 的建立者為 "coach1"
      And 訓練 "訓練B" 的建立者為 "coach2"
      When 使用者 批次刪除訓練 "訓練A", "訓練B"
      Then 訓練 "訓練A" 狀態應為 "DELETED"
      And 訓練 "訓練B" 狀態應為 "DELETED"

  Rule: 教練只能批次刪除自己的訓練

    @permission @happy-path
    Example: 教練批次刪除自己的訓練
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 訓練 "訓練A" 的建立者為 "coach1"
      And 訓練 "訓練B" 的建立者為 "coach1"
      When 使用者 批次刪除訓練 "訓練A", "訓練B"
      Then 訓練 "訓練A" 狀態應為 "DELETED"
      And 訓練 "訓練B" 狀態應為 "DELETED"

    @permission @error-handling
    Example: 教練無法批次刪除包含他人訓練
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 訓練 "訓練A" 的建立者為 "coach1"
      And 訓練 "訓練B" 的建立者為 "coach2"
      When 使用者 批次刪除訓練 "訓練A", "訓練B"
      Then 應回傳錯誤 "無權限執行此操作"

  # ===== Phase 2: 核心業務 =====

  Rule: 批次刪除採用軟刪除

    @happy-path
    Example: 軟刪除多筆訓練
      Given 使用者為「管理者」角色
      When 使用者 批次刪除訓練 "訓練A", "訓練B"
      Then 訓練 "訓練A" 狀態應為 "DELETED"
      And 訓練 "訓練B" 狀態應為 "DELETED"
      And 刪除時間已記錄

  # ===== Phase 3: 邊界條件 =====

  Rule: 所選訓練必須都存在

    @error-handling
    Example: 包含不存在的訓練
      Given 使用者為「管理者」角色
      And 系統中不存在訓練 "幽靈訓練"
      When 使用者 批次刪除訓練 "訓練A", "幽靈訓練"
      Then 應回傳錯誤 "找不到指定的訓練"
