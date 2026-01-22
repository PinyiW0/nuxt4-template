# language: zh-TW
# encoding: UTF-8
# Feature: 查看選手統計明細
# Epic: F - 選手分析（長期表現追蹤）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# Level: DSL

@epic-f @player-stats @query
Feature: 查看選手統計明細
  身為 數據分析師
  我想要 查看選手統計明細
  以便 分析選手的長期表現趨勢

  Rule: 成功查看選手統計明細

    @happy-path
    Example: 查看選手統計明細
      Given 系統中存在選手 "王小明"
      And 選手 "王小明" 有以下月份統計:
        | month   | avgSpeed | strikeRate | trainingCount |
        | 2026-01 | 125.5    | 65%        | 8             |
        | 2025-12 | 122.3    | 60%        | 6             |
      When 數據分析師 查看選手 "王小明" 的統計明細
      Then 應顯示選手基本資訊
      And 應顯示月份統計列表
      And 應顯示熱區圖數據

    @happy-path
    Example: 查看特定月份統計
      Given 系統中存在選手 "王小明"
      And 選手 "王小明" 在 "2026-01" 有統計數據
      When 數據分析師 查看選手 "王小明" 的 "2026-01" 統計
      Then 應顯示 "2026-01" 的詳細統計
      And 應顯示該月的平均球速
      And 應顯示該月的好球率

  Rule: 熱區圖顯示

    @happy-path
    Example: 顯示選手投球熱區圖
      Given 系統中存在選手 "王小明"
      And 選手 "王小明" 有投球落點數據
      When 數據分析師 查看選手 "王小明" 的統計明細
      Then 應顯示九宮格熱區圖
      And 熱區應根據投球頻率著色

  Rule: 前置條件驗證

    @error-handling
    Example: 選手不存在應查看失敗
      Given 系統中不存在選手 "不存在的選手"
      When 數據分析師 查看選手 "不存在的選手" 的統計明細
      Then 應回傳錯誤 "選手不存在"
