# language: zh-TW
# encoding: UTF-8
# Feature: 查詢歷史訓練列表
# Epic: E - 影像數據分析（歷史訓練）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 歷史訓練列表已查詢
# @requires: us-e1-switch-analysis-tab
# Allowed Roles: 管理者, 教練

@epic-e @training @query
Feature: 查詢歷史訓練列表
  身為 分析使用者
  我想要 查詢歷史訓練列表
  以便 找到要分析的訓練

  Background:
    Given 使用者已登入系統
    And 使用者已進入影像數據分析頁面
    And 使用者已切換到 "訓練記錄查詢" 頁籤

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可查詢所有歷史訓練

    @permission @happy-path
    Example: 管理者查詢歷史訓練
      Given 使用者為「管理者」角色
      And 系統中存在訓練 "訓練A"，建立者為 "coach1"
      And 系統中存在訓練 "訓練B"，建立者為 "coach2"
      When 使用者 查詢歷史訓練列表
      Then 應回傳 2 筆訓練

  Rule: 教練只能查詢自己的歷史訓練

    @permission @happy-path
    Example: 教練查詢自己的歷史訓練
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 系統中存在訓練 "訓練A"，建立者為 "coach1"
      And 系統中存在訓練 "訓練B"，建立者為 "coach2"
      When 使用者 查詢歷史訓練列表
      Then 應回傳 1 筆訓練
      And 應包含訓練 "訓練A"

  # ===== Phase 2: 核心業務 =====

  Rule: 可依球隊篩選歷史訓練

    @happy-path
    Example: 依球隊篩選
      Given 使用者為「管理者」角色
      And 系統中存在訓練 "訓練A"，球隊為 "閃電隊"
      And 系統中存在訓練 "訓練B"，球隊為 "勇士隊"
      When 使用者 查詢球隊 "閃電隊" 的歷史訓練列表
      Then 應回傳 1 筆訓練

  Rule: 可依日期範圍篩選歷史訓練

    @happy-path
    Example: 依日期範圍篩選
      Given 使用者為「管理者」角色
      And 系統中存在訓練 "訓練A"，日期為 "2026-01-01"
      And 系統中存在訓練 "訓練B"，日期為 "2026-02-01"
      When 使用者 查詢日期範圍 "2026-01-01" 到 "2026-01-31" 的歷史訓練列表
      Then 應回傳 1 筆訓練

  # ===== Phase 3: 邊界條件 =====

  Rule: 無訓練時應回傳空列表

    @boundary
    Example: 無歷史訓練
      Given 使用者為「教練」角色，帳號為 "coach_new"
      And 使用者尚未建立任何訓練
      When 使用者 查詢歷史訓練列表
      Then 應回傳 0 筆訓練
