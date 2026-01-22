# language: zh-TW
# encoding: UTF-8
# Feature: 刪除訓練
# Epic: C - 訓練建立與 AI 系統控制
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# Level: DSL
# Boundary Decisions:
#   - Q7: 刪除訓練時級聯刪除所有投球紀錄

@epic-c @training @command
Feature: 刪除訓練
  身為 教練
  我想要 刪除訓練
  以便 移除不需要的訓練紀錄

  Rule: 成功刪除訓練（級聯刪除投球紀錄）

    @happy-path
    Example: 成功刪除訓練
      Given 系統中存在訓練 "T001"
      When 教練 刪除訓練 "T001"
      Then 訓練 "T001" 應不存在

    @happy-path
    Example: 刪除訓練時應一併刪除投球紀錄
      Given 系統中存在訓練 "T001"
      And 訓練 "T001" 有 10 筆投球紀錄
      When 教練 刪除訓練 "T001"
      Then 訓練 "T001" 應不存在
      And 訓練 "T001" 的所有投球紀錄應不存在

  Rule: 前置條件驗證

    @error-handling
    Example: 訓練不存在應刪除失敗
      Given 系統中不存在訓練 "T999"
      When 教練 刪除訓練 "T999"
      Then 應回傳錯誤 "訓練不存在"
