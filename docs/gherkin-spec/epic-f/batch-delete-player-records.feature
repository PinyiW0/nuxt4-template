# language: zh-TW
# encoding: UTF-8
# Feature: 批次刪除選手紀錄
# Epic: F - 選手分析（長期表現追蹤）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# Level: DSL
# Boundary Decisions:
#   - Q9: 單次批次刪除最多 50 筆資料

@epic-f @player @command @batch
Feature: 批次刪除選手紀錄
  身為 數據分析師
  我想要 批次刪除選手紀錄
  以便 一次清除多位選手的統計數據

  Rule: 成功批次刪除選手紀錄

    @happy-path
    Example: 批次刪除多位選手紀錄
      Given 系統中存在選手紀錄 "P001", "P002", "P003"
      When 數據分析師 批次刪除選手紀錄 "P001", "P002"
      Then 應成功刪除 2 筆選手紀錄
      And 選手 "P001" 的統計紀錄應不存在
      And 選手 "P002" 的統計紀錄應不存在
      And 選手 "P003" 的統計紀錄應仍存在

  Rule: 批次刪除上限（最多 50 筆）

    @boundary
    Example: 批次刪除 50 筆選手紀錄應成功
      Given 系統中存在 50 筆選手紀錄
      When 數據分析師 批次刪除 50 筆選手紀錄
      Then 應成功刪除 50 筆選手紀錄

    @boundary
    Example: 批次刪除超過 50 筆應失敗
      Given 系統中存在 60 筆選手紀錄
      When 數據分析師 選擇 51 筆選手紀錄進行批次刪除
      Then 應回傳錯誤 "單次批次刪除最多 50 筆"

  Rule: 前置條件驗證

    @error-handling
    Example: 未選擇選手應批次刪除失敗
      When 數據分析師 未選擇任何選手進行批次刪除
      Then 應回傳錯誤 "請至少選擇一位選手"
