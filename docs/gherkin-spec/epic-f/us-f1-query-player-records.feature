# language: zh-TW
# encoding: UTF-8
# Feature: 查詢選手紀錄列表
# Epic: F - 選手分析（長期表現追蹤）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 選手紀錄列表已查詢
# @requires: us-e1-switch-analysis-tab
# Allowed Roles: 管理者, 教練

@epic-f @player @query
Feature: 查詢選手紀錄列表
  身為 分析使用者
  我想要 依隊伍與關鍵字查詢選手紀錄
  以便 找到要分析的選手

  Background:
    Given 使用者已登入系統
    And 使用者已進入影像數據分析頁面
    And 使用者已切換到 "選手紀錄查詢" 頁籤

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可查詢所有選手紀錄

    @permission @happy-path
    Example: 管理者查詢選手紀錄
      Given 使用者為「管理者」角色
      And 系統中存在選手 "王小明"，球隊為 "閃電隊"，建立者為 "coach1"
      And 系統中存在選手 "李小華"，球隊為 "勇士隊"，建立者為 "coach2"
      When 使用者 查詢選手紀錄列表
      Then 應回傳 2 筆選手

  Rule: 教練只能查詢自己球隊的選手紀錄

    @permission @happy-path
    Example: 教練查詢自己球隊的選手
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 系統中存在選手 "王小明"，球隊為 "閃電隊"，建立者為 "coach1"
      And 系統中存在選手 "李小華"，球隊為 "勇士隊"，建立者為 "coach2"
      When 使用者 查詢選手紀錄列表
      Then 應回傳 1 筆選手
      And 應包含選手 "王小明"

  # ===== Phase 2: 核心業務 =====

  Rule: 可依球隊篩選選手

    @happy-path
    Example: 依球隊篩選選手
      Given 使用者為「管理者」角色
      And 系統中存在選手 "王小明"，球隊為 "閃電隊"
      And 系統中存在選手 "李小華"，球隊為 "勇士隊"
      When 使用者 查詢球隊 "閃電隊" 的選手紀錄列表
      Then 應回傳 1 筆選手
      And 應包含選手 "王小明"

  Rule: 可依關鍵字搜尋選手

    @happy-path
    Example: 依關鍵字搜尋
      Given 使用者為「管理者」角色
      And 系統中存在選手 "王小明"
      And 系統中存在選手 "王大華"
      And 系統中存在選手 "李小華"
      When 使用者 以關鍵字 "王" 查詢選手紀錄列表
      Then 應回傳 2 筆選手
      And 應包含選手 "王小明"
      And 應包含選手 "王大華"

  # ===== Phase 3: 邊界條件 =====

  Rule: 無選手時應回傳空列表

    @boundary
    Example: 無選手紀錄
      Given 使用者為「教練」角色，帳號為 "coach_new"
      And 使用者尚未建立任何球員
      When 使用者 查詢選手紀錄列表
      Then 應回傳 0 筆選手
