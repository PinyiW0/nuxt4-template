# language: zh-TW
# encoding: UTF-8
# Feature: 查詢投球清單
# Epic: D - 訓練紀錄頁（即時投球檢視）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# Level: DSL
# Boundary Decisions:
#   - Q8: 定時輪詢（每 3 秒）更新投球清單

@epic-d @pitch @query
Feature: 查詢投球清單
  身為 教練
  我想要 查詢投球清單
  以便 檢視訓練中的所有投球紀錄

  Rule: 基本查詢

    @happy-path
    Example: 查詢訓練的投球清單
      Given 系統中存在訓練 "T001"
      And 訓練 "T001" 有以下投球紀錄:
        | pitchNumber | speed | pitchType |
        | 1           | 125   | 四縫線    |
        | 2           | 118   | 滑球      |
        | 3           | 130   | 四縫線    |
      When 教練 查詢訓練 "T001" 的投球清單
      Then 應回傳 3 筆投球紀錄
      And 投球紀錄應按序號排序

    @happy-path
    Example: 訓練無投球時回傳空清單
      Given 系統中存在訓練 "T001"
      And 訓練 "T001" 沒有投球紀錄
      When 教練 查詢訓練 "T001" 的投球清單
      Then 應回傳 0 筆投球紀錄

  Rule: 即時更新機制（Polling 每 3 秒）

    @realtime
    Example: 每 3 秒自動更新投球清單
      Given 教練 已進入訓練 "T001" 的紀錄模式
      And 訓練 "T001" 有 5 筆投球紀錄
      When AI 系統辨識到新的投球
      And 經過 3 秒
      Then 投球清單應自動更新
      And 應顯示 6 筆投球紀錄

    @realtime
    Example: 新投球應顯示在清單最新位置
      Given 教練 已進入訓練 "T001" 的紀錄模式
      And 訓練 "T001" 有 3 筆投球紀錄
      When AI 系統辨識到新的投球 球速 128 球種 "指叉球"
      And 經過 3 秒
      Then 投球清單應自動更新
      And 最新一筆投球序號應為 4
      And 最新一筆投球球速應為 128

  Rule: 前置條件驗證

    @error-handling
    Example: 訓練不存在應查詢失敗
      Given 系統中不存在訓練 "T999"
      When 教練 查詢訓練 "T999" 的投球清單
      Then 應回傳錯誤 "訓練不存在"
