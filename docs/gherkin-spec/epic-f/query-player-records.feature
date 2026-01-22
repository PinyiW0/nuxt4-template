# language: zh-TW
# encoding: UTF-8
# Feature: 查詢選手紀錄列表
# Epic: F - 選手分析（長期表現追蹤）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# Level: DSL

@epic-f @player @query
Feature: 查詢選手紀錄列表
  身為 數據分析師
  我想要 查詢選手紀錄列表
  以便 追蹤選手長期表現

  Rule: 基本查詢

    @happy-path
    Example: 查詢所有選手紀錄
      Given 系統中存在以下選手紀錄:
        | playerId | playerName | teamName | trainingCount |
        | P001     | 王小明     | 閃電隊   | 15            |
        | P002     | 李小華     | 閃電隊   | 12            |
        | P003     | 張小龍     | 雷霆隊   | 8             |
      When 數據分析師 查詢選手紀錄列表
      Then 應回傳 3 筆選手紀錄
      And 每筆紀錄應包含訓練次數

    @happy-path
    Example: 無選手紀錄時回傳空列表
      Given 系統中沒有選手紀錄
      When 數據分析師 查詢選手紀錄列表
      Then 應回傳 0 筆選手紀錄

  Rule: 條件篩選

    @filter
    Example: 依球隊篩選選手紀錄
      Given 系統中存在以下選手紀錄:
        | playerId | playerName | teamName |
        | P001     | 王小明     | 閃電隊   |
        | P002     | 李小華     | 閃電隊   |
        | P003     | 張小龍     | 雷霆隊   |
      When 數據分析師 查詢球隊 "閃電隊" 的選手紀錄
      Then 應回傳 2 筆選手紀錄

    @filter
    Example: 依關鍵字搜尋選手紀錄
      Given 系統中存在以下選手紀錄:
        | playerId | playerName | teamName |
        | P001     | 王小明     | 閃電隊   |
        | P002     | 王小華     | 閃電隊   |
        | P003     | 張小龍     | 雷霆隊   |
      When 數據分析師 以關鍵字 "王" 搜尋選手紀錄
      Then 應回傳 2 筆選手紀錄
