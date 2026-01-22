# language: zh-TW
# encoding: UTF-8
# Feature: 查詢歷史訓練列表
# Epic: E - 影像數據分析（歷史訓練）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# Level: DSL

@epic-e @training @query
Feature: 查詢歷史訓練列表
  身為 數據分析師
  我想要 查詢歷史訓練列表
  以便 分析過去的訓練數據

  Rule: 基本查詢

    @happy-path
    Example: 查詢所有歷史訓練
      Given 系統中存在以下歷史訓練:
        | trainingId | teamName | playerName | date       |
        | T001       | 閃電隊   | 王小明     | 2026-01-10 |
        | T002       | 閃電隊   | 李小華     | 2026-01-12 |
        | T003       | 雷霆隊   | 張小龍     | 2026-01-15 |
      When 數據分析師 查詢歷史訓練列表
      Then 應回傳 3 筆訓練
      And 訓練應按日期降序排列

    @happy-path
    Example: 無歷史訓練時回傳空列表
      Given 系統中沒有歷史訓練
      When 數據分析師 查詢歷史訓練列表
      Then 應回傳 0 筆訓練

  Rule: 條件篩選

    @filter
    Example: 依球隊篩選歷史訓練
      Given 系統中存在以下歷史訓練:
        | trainingId | teamName | playerName | date       |
        | T001       | 閃電隊   | 王小明     | 2026-01-10 |
        | T002       | 閃電隊   | 李小華     | 2026-01-12 |
        | T003       | 雷霆隊   | 張小龍     | 2026-01-15 |
      When 數據分析師 查詢球隊 "閃電隊" 的歷史訓練
      Then 應回傳 2 筆訓練

    @filter
    Example: 依日期範圍篩選歷史訓練
      Given 系統中存在以下歷史訓練:
        | trainingId | teamName | playerName | date       |
        | T001       | 閃電隊   | 王小明     | 2026-01-05 |
        | T002       | 閃電隊   | 李小華     | 2026-01-12 |
        | T003       | 閃電隊   | 張小龍     | 2026-01-20 |
      When 數據分析師 查詢日期從 "2026-01-10" 到 "2026-01-15" 的歷史訓練
      Then 應回傳 1 筆訓練
