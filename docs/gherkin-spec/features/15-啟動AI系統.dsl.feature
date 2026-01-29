# @publishes: AI系統已啟動
Feature: 啟動AI系統

  Background:
    Given 系統中有以下使用者：
      | 帳號    | 角色   |
      | coach1 | 教練   |
    And 系統中有以下訓練：
      | 編號  | 日期       | 受測選手 | 建立者  |
      | T001 | 2026-01-26 | 王小明   | coach1 |
    And AI 系統狀態為 "關閉"

  Rule: 啟動 AI 系統前必須先建立訓練

    Example: 成功啟動 AI 系統
      Given 教練 "coach1" 已登入
      And 教練已建立訓練 "T001"
      When 教練啟動 AI 系統並關聯訓練 "T001"
      Then 操作成功
      And 系統產生 "AI系統已啟動" 事件
      And AI 系統狀態為 "運行中"

    Example: 未建立訓練就啟動 AI 系統
      Given 教練 "coach1" 已登入
      And 教練尚未建立任何訓練
      When 教練嘗試啟動 AI 系統
      Then 操作失敗
      And 系統顯示 "請先建立訓練"

  Rule: 不可重複啟動已運行的 AI 系統

    Example: 重複啟動 AI 系統
      Given 教練 "coach1" 已登入
      And AI 系統狀態為 "運行中"
      When 教練嘗試啟動 AI 系統
      Then 操作失敗
      And 系統顯示 "系統已在運行中"

  Rule: 教練只能為自己的訓練啟動 AI 系統

    Example: 教練為自己的訓練啟動 AI 系統
      Given 教練 "coach1" 已登入
      When 教練啟動 AI 系統並關聯訓練 "T001"
      Then 操作成功

    Example: 教練為他人的訓練啟動 AI 系統
      Given 系統中有訓練 "T002" 由 "coach2" 建立
      And 教練 "coach1" 已登入
      When 教練啟動 AI 系統並關聯訓練 "T002"
      Then 操作失敗
      And 系統顯示 "無權限操作此訓練"
