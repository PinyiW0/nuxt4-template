# language: zh-TW
# encoding: UTF-8
# Feature: 調整好球帶範圍
# Epic: D - 訓練紀錄頁（即時投球檢視）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# Level: DSL

@epic-d @strike-zone @command
Feature: 調整好球帶範圍
  身為 教練
  我想要 調整好球帶範圍
  以便 根據選手身高微調判定標準

  Rule: 成功調整好球帶

    @happy-path
    Example: 調整好球帶上下邊界
      Given 教練 已進入訓練 "T001" 的紀錄模式
      And 目前好球帶上邊界為 1.2 下邊界為 0.5
      When 教練 調整好球帶上邊界為 1.3 下邊界為 0.4
      Then 好球帶上邊界應為 1.3
      And 好球帶下邊界應為 0.4

    @happy-path
    Example: 調整好球帶左右邊界
      Given 教練 已進入訓練 "T001" 的紀錄模式
      And 目前好球帶左邊界為 -0.3 右邊界為 0.3
      When 教練 調整好球帶左邊界為 -0.35 右邊界為 0.35
      Then 好球帶左邊界應為 -0.35
      And 好球帶右邊界應為 0.35

  Rule: 調整後重新計算好壞球

    @happy-path
    Example: 調整好球帶後應重新計算好壞球判定
      Given 教練 已進入訓練 "T001" 的紀錄模式
      And 訓練 "T001" 有 10 筆投球紀錄
      And 目前判定好球 6 顆壞球 4 顆
      When 教練 調整好球帶邊界
      Then 應重新計算所有投球的好壞球判定

  Rule: 前置條件驗證

    @error-handling
    Example: 訓練不存在應調整失敗
      Given 系統中不存在訓練 "T999"
      When 教練 對訓練 "T999" 調整好球帶
      Then 應回傳錯誤 "訓練不存在"
