# language: zh-TW
# encoding: UTF-8
# Feature: 進入訓練紀錄模式
# Epic: D - 訓練紀錄頁（即時投球檢視）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# Level: DSL

@epic-d @training-record @command
Feature: 進入訓練紀錄模式
  身為 教練
  我想要 進入訓練紀錄模式
  以便 即時檢視投球數據

  Rule: 成功進入訓練紀錄模式

    @happy-path
    Example: 成功進入訓練紀錄模式
      Given 系統中存在訓練 "T001"
      When 教練 進入訓練 "T001" 的紀錄模式
      Then 應成功進入訓練紀錄模式
      And 應顯示訓練 "T001" 的基本資訊
      And 應顯示投球清單

    @happy-path
    Example: 進入已有投球紀錄的訓練
      Given 系統中存在訓練 "T001"
      And 訓練 "T001" 已有 5 筆投球紀錄
      When 教練 進入訓練 "T001" 的紀錄模式
      Then 應成功進入訓練紀錄模式
      And 投球清單應顯示 5 筆紀錄

  Rule: 前置條件驗證

    @error-handling
    Example: 訓練不存在應進入失敗
      Given 系統中不存在訓練 "T999"
      When 教練 進入訓練 "T999" 的紀錄模式
      Then 應回傳錯誤 "訓練不存在"

  Rule: 退出訓練紀錄模式

    @happy-path
    Example: 成功退出訓練紀錄模式
      Given 教練 已進入訓練 "T001" 的紀錄模式
      When 教練 退出訓練紀錄模式
      Then 應成功退出訓練紀錄模式
