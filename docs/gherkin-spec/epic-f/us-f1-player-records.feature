# language: zh-TW
# encoding: UTF-8
# Feature: 選手列表查詢與批次刪除
# Epic: F - 選手分析（長期表現追蹤）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23

@epic-f @player-analysis @query @command
Feature: 選手列表查詢與批次刪除
  身為 分析使用者
  我想要 依隊伍與關鍵字查詢選手紀錄
  以便 管理選手分析資料

  Background:
    Given 分析使用者 已登入系統
    And 系統中存在球隊 "閃電隊"
    And 球隊 "閃電隊" 有球員 "王小明"，背號 1
    And 球隊 "閃電隊" 有球員 "李小華"，背號 2
    And 球員 "王小明" 有訓練投球紀錄
    And 球員 "李小華" 有訓練投球紀錄

  Rule: 可以查詢選手紀錄列表

    @happy-path
    Example: 查詢所有選手紀錄
      When 分析使用者 查詢選手紀錄列表
      Then 應回傳 2 筆選手紀錄
      And 每筆紀錄應包含選手姓名、球隊、總投球數、平均球速

    @happy-path
    Example: 依隊伍篩選選手
      Given 系統中存在球隊 "勇士隊"
      And 球隊 "勇士隊" 有球員 "張大華"，背號 1
      And 球員 "張大華" 有訓練投球紀錄
      When 分析使用者 查詢球隊 "閃電隊" 的選手紀錄
      Then 應回傳 2 筆選手紀錄
      And 所有選手應屬於 "閃電隊"

    @happy-path
    Example: 用關鍵字搜尋選手
      When 分析使用者 用關鍵字 "王" 搜尋選手
      Then 應回傳 1 筆選手紀錄
      And 應包含選手 "王小明"

  Rule: 可以批次刪除選手紀錄

    @happy-path
    Example: 批次刪除選手紀錄
      When 分析使用者 勾選選手 "王小明" 和 "李小華"
      And 分析使用者 執行批次刪除
      Then 應刪除 2 筆選手的分析紀錄

    @error-handling
    Example: 未勾選任何選手時無法批次刪除
      When 分析使用者 未勾選任何選手
      And 分析使用者 嘗試執行批次刪除
      Then 應回傳錯誤 "請至少選擇一位選手"
