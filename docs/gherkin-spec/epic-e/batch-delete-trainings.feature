# language: zh-TW
# encoding: UTF-8
# Feature: 批次刪除訓練
# Epic: E - 影像數據分析（歷史訓練）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# Level: DSL
# Boundary Decisions:
#   - Q7: 刪除訓練時級聯刪除所有投球紀錄
#   - Q9: 單次批次刪除最多 50 筆資料

@epic-e @training @command @batch
Feature: 批次刪除訓練
  身為 數據分析師
  我想要 批次刪除訓練
  以便 一次清除多筆不需要的訓練紀錄

  Rule: 成功批次刪除（級聯刪除投球紀錄）

    @happy-path
    Example: 批次刪除多筆訓練
      Given 系統中存在訓練 "T001", "T002", "T003"
      When 數據分析師 批次刪除訓練 "T001", "T002"
      Then 應成功刪除 2 筆訓練
      And 訓練 "T001" 應不存在
      And 訓練 "T002" 應不存在
      And 訓練 "T003" 應仍存在

    @happy-path
    Example: 批次刪除應一併刪除投球紀錄
      Given 系統中存在訓練 "T001"
      And 訓練 "T001" 有 15 筆投球紀錄
      When 數據分析師 批次刪除訓練 "T001"
      Then 訓練 "T001" 應不存在
      And 訓練 "T001" 的所有投球紀錄應不存在

  Rule: 批次刪除上限（最多 50 筆）

    @boundary
    Example: 批次刪除 50 筆訓練應成功
      Given 系統中存在 50 筆訓練
      When 數據分析師 批次刪除 50 筆訓練
      Then 應成功刪除 50 筆訓練

    @boundary
    Example: 批次刪除超過 50 筆應失敗
      Given 系統中存在 60 筆訓練
      When 數據分析師 選擇 51 筆訓練進行批次刪除
      Then 應回傳錯誤 "單次批次刪除最多 50 筆"

  Rule: 前置條件驗證

    @error-handling
    Example: 未選擇訓練應批次刪除失敗
      When 數據分析師 未選擇任何訓練進行批次刪除
      Then 應回傳錯誤 "請至少選擇一筆訓練"
