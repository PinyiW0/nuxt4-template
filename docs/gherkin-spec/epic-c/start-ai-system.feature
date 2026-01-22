# language: zh-TW
# encoding: UTF-8
# Feature: 啟動 AI 系統
# Epic: C - 訓練建立與 AI 系統控制
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# Level: DSL

@epic-c @ai-system @command
Feature: 啟動 AI 系統
  身為 教練
  我想要 啟動 AI 系統
  以便 開始自動辨識投球數據

  Rule: 成功啟動 AI 系統

    @happy-path
    Example: 成功啟動 AI 系統
      Given 系統中存在訓練 "T001"
      And AI 系統目前為關閉狀態
      When 教練 對訓練 "T001" 啟動 AI 系統
      Then AI 系統應為運行中狀態
      And AI 系統應綁定訓練 "T001"

  Rule: 前置條件驗證

    @error-handling
    Example: 訓練不存在應啟動失敗
      Given 系統中不存在訓練 "T999"
      When 教練 對訓練 "T999" 啟動 AI 系統
      Then 應回傳錯誤 "訓練不存在"

    @error-handling
    Example: AI 系統已運行中應啟動失敗
      Given 系統中存在訓練 "T001"
      And AI 系統目前已在運行中
      When 教練 對訓練 "T001" 啟動 AI 系統
      Then 應回傳錯誤 "AI 系統已在運行中"
