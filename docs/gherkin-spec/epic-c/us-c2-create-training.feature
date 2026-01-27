# language: zh-TW
# encoding: UTF-8
# Feature: 建立訓練
# Epic: C - 訓練建立與 AI 系統控制
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 訓練已建立
# @requires: us-b1-select-team, us-b3-query-player
# Allowed Roles: 管理者, 教練

@epic-c @training @command
Feature: 建立訓練
  身為 教練
  我想要 建立一筆訓練並指定受測選手與好球帶身高
  以便 開始資料收集

  Background:
    Given 使用者已登入系統
    And 系統中存在球隊 "閃電隊"
    And 球隊 "閃電隊" 有球員 "王小明"，背號 1

  # ===== Phase 1: 核心決策 =====

  Rule: 教練只能為自己的球隊建立訓練

    @permission @happy-path
    Example: 教練為自己球隊建立訓練
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 球隊 "閃電隊" 的建立者為 "coach1"
      When 使用者 建立訓練，球隊 "閃電隊"，球員 "王小明"，日期 "2026-01-27"，好球帶身高 170
      Then 訓練建立成功
      And 訓練的建立者為 "coach1"

    @permission @error-handling
    Example: 教練無法為他人球隊建立訓練
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 球隊 "閃電隊" 的建立者為 "coach2"
      When 使用者 建立訓練，球隊 "閃電隊"，球員 "王小明"，日期 "2026-01-27"，好球帶身高 170
      Then 應回傳錯誤 "無權限操作此球隊"

  # ===== Phase 2: 核心業務 =====

  Rule: 建立訓練時必須指定球隊、球員、日期、好球帶身高

    @happy-path
    Example: 成功建立訓練
      Given 使用者為「管理者」角色
      When 使用者 建立訓練，球隊 "閃電隊"，球員 "王小明"，日期 "2026-01-27"，好球帶身高 170
      Then 訓練建立成功
      And 訓練的球隊為 "閃電隊"
      And 訓練的球員為 "王小明"
      And 訓練的日期為 "2026-01-27"
      And 訓練的好球帶身高為 170

  Rule: 建立訓練時自動記錄建立者與建立時間

    @happy-path
    Example: 系統記錄審計資訊
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 球隊 "閃電隊" 的建立者為 "coach1"
      When 使用者 建立訓練，球隊 "閃電隊"，球員 "王小明"，日期 "2026-01-27"，好球帶身高 170
      Then 訓練的建立者為 "coach1"
      And 訓練的建立時間已記錄

  # ===== Phase 3: 邊界條件 =====

  Rule: 球隊必須存在

    @error-handling
    Example: 指定不存在的球隊
      Given 使用者為「管理者」角色
      And 系統中不存在球隊 "幽靈隊"
      When 使用者 建立訓練，球隊 "幽靈隊"，球員 "王小明"，日期 "2026-01-27"，好球帶身高 170
      Then 應回傳錯誤 "找不到指定的球隊"

  Rule: 球員必須存在

    @error-handling
    Example: 指定不存在的球員
      Given 使用者為「管理者」角色
      When 使用者 建立訓練，球隊 "閃電隊"，球員 "不存在"，日期 "2026-01-27"，好球帶身高 170
      Then 應回傳錯誤 "找不到指定的球員"
