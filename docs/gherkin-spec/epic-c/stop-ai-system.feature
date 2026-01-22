# language: zh-TW
# encoding: UTF-8
# Feature: 關閉 AI 系統
# Epic: C - 訓練建立與 AI 系統控制
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# Level: DSL

@epic-c @ai-system @command
Feature: 關閉 AI 系統
  身為 教練
  我想要 關閉 AI 系統
  以便 停止自動辨識投球數據

  Rule: 成功關閉 AI 系統

    @happy-path
    Example: 成功關閉 AI 系統
      Given AI 系統目前為運行中狀態
      When 教練 關閉 AI 系統
      Then AI 系統應為關閉狀態

  Rule: 前置條件驗證

    @error-handling
    Example: AI 系統未運行應關閉失敗
      Given AI 系統目前為關閉狀態
      When 教練 關閉 AI 系統
      Then 應回傳錯誤 "AI 系統未在運行中"
