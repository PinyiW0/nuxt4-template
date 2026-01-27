# language: zh-TW
# encoding: UTF-8
# Feature: 關閉 AI 系統
# Epic: C - 訓練建立與 AI 系統控制
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: AI系統已關閉
# @requires: us-c4-start-ai-system
# Allowed Roles: 管理者, 教練

@epic-c @ai-system @command
Feature: 關閉 AI 系統
  身為 教練
  我想要 關閉 AI 偵測系統
  以便 停止資料收集

  Background:
    Given 使用者已登入系統

  # ===== Phase 2: 核心業務 =====

  Rule: AI 系統運行中時可關閉

    @happy-path
    Example: 成功關閉 AI 系統
      Given 使用者為「教練」角色
      And AI 系統狀態為 "RUNNING"
      When 使用者 關閉 AI 系統
      Then AI 系統狀態應為 "STOPPED"

  # ===== Phase 3: 邊界條件 =====

  Rule: AI 系統未運行時無法關閉

    @error-handling
    Example: 關閉未運行的 AI 系統
      Given 使用者為「教練」角色
      And AI 系統狀態為 "STOPPED"
      When 使用者 關閉 AI 系統
      Then 應回傳錯誤 "AI 系統尚未啟動"
