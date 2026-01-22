# language: zh-TW
# encoding: UTF-8
# Feature: 查詢訓練列表
# Epic: C - 訓練建立與 AI 系統控制
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# Level: DSL

@epic-c @training @query
Feature: 查詢訓練列表
  身為 教練
  我想要 查詢訓練列表
  以便 檢視已建立的訓練紀錄

  Rule: 基本查詢

    @happy-path
    Example: 查詢所有訓練
      Given 系統中存在以下訓練:
        | trainingId | teamName | playerName | date       |
        | T001       | 閃電隊   | 王小明     | 2026-01-15 |
        | T002       | 閃電隊   | 李小華     | 2026-01-16 |
        | T003       | 雷霆隊   | 張小龍     | 2026-01-17 |
      When 教練 查詢訓練列表
      Then 應回傳 3 筆訓練
      And 訓練列表應包含 "T001", "T002", "T003"

    @happy-path
    Example: 無訓練時回傳空列表
      Given 系統中沒有任何訓練
      When 教練 查詢訓練列表
      Then 應回傳 0 筆訓練

  Rule: 條件篩選

    @filter
    Example: 依球隊篩選訓練
      Given 系統中存在以下訓練:
        | trainingId | teamName | playerName | date       |
        | T001       | 閃電隊   | 王小明     | 2026-01-15 |
        | T002       | 閃電隊   | 李小華     | 2026-01-16 |
        | T003       | 雷霆隊   | 張小龍     | 2026-01-17 |
      When 教練 查詢球隊 "閃電隊" 的訓練列表
      Then 應回傳 2 筆訓練
      And 訓練列表應包含 "T001", "T002"

    @filter
    Example: 依日期範圍篩選訓練
      Given 系統中存在以下訓練:
        | trainingId | teamName | playerName | date       |
        | T001       | 閃電隊   | 王小明     | 2026-01-10 |
        | T002       | 閃電隊   | 李小華     | 2026-01-15 |
        | T003       | 閃電隊   | 張小龍     | 2026-01-20 |
      When 教練 查詢日期從 "2026-01-12" 到 "2026-01-18" 的訓練列表
      Then 應回傳 1 筆訓練
      And 訓練列表應包含 "T002"
