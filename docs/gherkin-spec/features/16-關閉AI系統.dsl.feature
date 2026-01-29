# @publishes: AI系統已關閉
Feature: 關閉AI系統

  Background:
    Given 系統中有以下使用者：
      | 帳號    | 角色   |
      | coach1 | 教練   |
    And 系統中有以下訓練：
      | 編號  | 日期       | 受測選手 | 建立者  |
      | T001 | 2026-01-26 | 王小明   | coach1 |
    And AI 系統狀態為 "運行中"
    And AI 系統關聯訓練 "T001"

  Rule: 關閉 AI 系統時立即停止，丟棄未完成的投球數據

    Example: 成功關閉 AI 系統
      Given 教練 "coach1" 已登入
      When 教練關閉 AI 系統
      Then 操作成功
      And 系統產生 "AI系統已關閉" 事件
      And AI 系統狀態為 "關閉"

    Example: AI 系統正在處理投球數據時關閉
      Given 教練 "coach1" 已登入
      And AI 系統正在處理一顆投球數據
      When 教練關閉 AI 系統
      Then 操作成功
      And AI 系統狀態為 "關閉"
      And 未完成的投球數據被丟棄

  Rule: 重複關閉已停止的 AI 系統視為成功（冪等）

    Example: 重複關閉 AI 系統
      Given 教練 "coach1" 已登入
      And AI 系統狀態為 "關閉"
      When 教練關閉 AI 系統
      Then 操作成功
      And 不產生新的 "AI系統已關閉" 事件

  Rule: 教練只能關閉自己啟動的 AI 系統

    Example: 教練關閉自己啟動的 AI 系統
      Given 教練 "coach1" 已登入
      When 教練關閉 AI 系統
      Then 操作成功

    Example: 教練關閉他人啟動的 AI 系統
      Given AI 系統由 "coach2" 啟動
      And 教練 "coach1" 已登入
      When 教練關閉 AI 系統
      Then 操作失敗
      And 系統顯示 "無權限操作此 AI 系統"
