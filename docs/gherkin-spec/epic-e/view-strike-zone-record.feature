# language: zh-TW
# encoding: UTF-8
# Feature: 查看電子好球帶記錄
# Epic: E - 影像數據分析（歷史訓練）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# Level: DSL

@epic-e @strike-zone @query
Feature: 查看電子好球帶記錄
  身為 數據分析師
  我想要 查看電子好球帶記錄
  以便 分析訓練中的好壞球分佈

  Rule: 成功查看電子好球帶記錄

    @happy-path
    Example: 查看訓練的電子好球帶記錄
      Given 系統中存在訓練 "T001"
      And 訓練 "T001" 有 20 筆投球紀錄
      When 數據分析師 查看訓練 "T001" 的電子好球帶記錄
      Then 應顯示電子好球帶視覺化圖表
      And 應顯示好球數量
      And 應顯示壞球數量
      And 應顯示所有投球落點

    @happy-path
    Example: 查看包含好壞球統計
      Given 系統中存在訓練 "T001"
      And 訓練 "T001" 有 10 顆好球和 8 顆壞球
      When 數據分析師 查看訓練 "T001" 的電子好球帶記錄
      Then 好球數量應為 10
      And 壞球數量應為 8

  Rule: 前置條件驗證

    @error-handling
    Example: 訓練不存在應查看失敗
      Given 系統中不存在訓練 "T999"
      When 數據分析師 查看訓練 "T999" 的電子好球帶記錄
      Then 應回傳錯誤 "訓練不存在"
