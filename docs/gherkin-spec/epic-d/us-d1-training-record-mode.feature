# language: zh-TW
# encoding: UTF-8
# Feature: 進入/退出訓練紀錄模式
# Epic: D - 訓練紀錄頁（即時投球檢視）
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23

@epic-d @training-record @command
Feature: 進入/退出訓練紀錄模式
  身為 教練
  我想要 進入某筆訓練的紀錄頁
  以便 檢視該訓練的投球清單與詳細數據

  Background:
    Given 教練 已登入系統
    And 系統中存在球隊 "閃電隊"
    And 球隊 "閃電隊" 有球員 "王小明"，背號 1
    And 球隊 "閃電隊" 有訓練紀錄，日期 "2026-01-20"，受測球員 "王小明"

  Rule: 可以進入訓練紀錄頁

    @happy-path
    Example: 成功進入訓練紀錄頁
      When 教練 進入訓練 "2026-01-20" 的紀錄頁
      Then 應成功進入訓練紀錄頁
      And 應顯示訓練日期 "2026-01-20"
      And 應顯示受測球員 "王小明"

    @error-handling
    Example: 進入不存在的訓練應失敗
      Given 系統中沒有該訓練
      When 教練 進入該訓練的紀錄頁
      Then 應回傳錯誤 "找不到指定的訓練"

  Rule: 可以退出訓練紀錄頁

    @happy-path
    Example: 成功退出訓練紀錄頁
      Given 教練 已進入訓練 "2026-01-20" 的紀錄頁
      When 教練 退出訓練紀錄頁
      Then 應成功退出訓練紀錄頁
      And 應回到訓練列表
