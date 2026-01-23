# language: zh-TW
# encoding: UTF-8
# Feature: 建立訓練
# Epic: C - 訓練建立與 AI 系統控制
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23

@epic-c @training @command
Feature: 建立訓練
  身為 教練
  我想要 建立一筆訓練並指定受測選手與好球帶身高
  以便 開始資料收集

  Background:
    Given 教練 已登入系統
    And 系統中存在球隊 "閃電隊"
    And 球隊 "閃電隊" 有球員 "王小明"，背號 1，身高 175

  Rule: 建立訓練必須指定日期和球員

    @happy-path
    Example: 成功建立訓練
      When 教練 建立訓練，球隊 "閃電隊"，受測球員 "王小明"，日期 "2026-01-23"
      Then 應成功建立訓練
      And 訓練日期應為 "2026-01-23"
      And 受測球員應為 "王小明"

    @happy-path
    Example: 建立訓練並設定好球帶身高
      When 教練 建立訓練，球隊 "閃電隊"，受測球員 "王小明"，日期 "2026-01-23"，好球帶身高 175
      Then 應成功建立訓練
      And 好球帶應依身高 175 設定

    @error-handling
    Example: 未指定日期應失敗
      When 教練 建立訓練，球隊 "閃電隊"，受測球員 "王小明"，日期 ""
      Then 應回傳錯誤 "訓練日期為必填"

    @error-handling
    Example: 未指定球員應失敗
      When 教練 建立訓練，球隊 "閃電隊"，受測球員 ""，日期 "2026-01-23"
      Then 應回傳錯誤 "必須指定受測球員"

  Rule: 球隊和球員必須存在

    @error-handling
    Example: 球隊不存在應失敗
      Given 系統中沒有球隊 "幽靈隊"
      When 教練 建立訓練，球隊 "幽靈隊"，受測球員 "王小明"，日期 "2026-01-23"
      Then 應回傳錯誤 "找不到指定的球隊"

    @error-handling
    Example: 球員不存在應失敗
      Given 球隊 "閃電隊" 沒有球員 "幽靈球員"
      When 教練 建立訓練，球隊 "閃電隊"，受測球員 "幽靈球員"，日期 "2026-01-23"
      Then 應回傳錯誤 "找不到指定的球員"

    @error-handling
    Example: 球員不屬於指定球隊應失敗
      Given 系統中存在球隊 "勇士隊"
      And 球隊 "勇士隊" 有球員 "李小華"，背號 1
      When 教練 建立訓練，球隊 "閃電隊"，受測球員 "李小華"，日期 "2026-01-23"
      Then 應回傳錯誤 "球員不屬於此球隊"
