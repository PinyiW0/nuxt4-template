# language: zh-TW
# encoding: UTF-8
# Feature: 啟動 AI 系統
# Epic: C - 訓練建立與 AI 系統控制
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: AI系統已啟動
# @requires: us-c2-create-training
# Allowed Roles: 管理者, 教練

@epic-c @ai-system @command
Feature: 啟動 AI 系統
  身為 教練
  我想要 啟動 AI 偵測系統
  以便 開始捕捉投球數據

  Background:
    Given 使用者已登入系統
    And 系統中存在訓練 "訓練A"

  # ===== Phase 2: 核心業務 =====

  Rule: AI 系統未運行時可啟動

    @happy-path
    Example: 成功啟動 AI 系統
      Given 使用者為「教練」角色
      And AI 系統狀態為 "STOPPED"
      When 使用者 啟動 AI 系統，關聯訓練 "訓練A"
      Then AI 系統狀態應為 "RUNNING"

  Rule: 啟動 AI 系統時需關聯訓練

    @happy-path
    Example: AI 系統關聯到指定訓練
      Given 使用者為「教練」角色
      And AI 系統狀態為 "STOPPED"
      When 使用者 啟動 AI 系統，關聯訓練 "訓練A"
      Then AI 系統已關聯到訓練 "訓練A"

  # ===== Phase 3: 邊界條件 =====

  Rule: AI 系統已運行時無法再次啟動

    @error-handling
    Example: 重複啟動 AI 系統
      Given 使用者為「教練」角色
      And AI 系統狀態為 "RUNNING"
      When 使用者 啟動 AI 系統，關聯訓練 "訓練A"
      Then 應回傳錯誤 "AI 系統已在運行中"

  Rule: 關聯的訓練必須存在

    @error-handling
    Example: 關聯不存在的訓練
      Given 使用者為「教練」角色
      And AI 系統狀態為 "STOPPED"
      And 系統中不存在訓練 "幽靈訓練"
      When 使用者 啟動 AI 系統，關聯訓練 "幽靈訓練"
      Then 應回傳錯誤 "找不到指定的訓練"
