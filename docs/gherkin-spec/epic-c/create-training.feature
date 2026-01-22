# language: zh-TW
# encoding: UTF-8
# Feature: 建立訓練
# Epic: C - 訓練建立與 AI 系統控制
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-22
# Level: DSL

@epic-c @training @command
Feature: 建立訓練
  身為 教練
  我想要 建立新訓練
  以便 開始記錄投球數據

  Rule: 成功建立訓練

    @happy-path
    Example: 成功建立訓練
      Given 系統中存在球隊 "閃電隊"
      And 球隊 "閃電隊" 中存在球員 "王小明"
      When 教練 建立訓練:
        | 球隊     | 受測選手 | 日期       | 好球帶身高 |
        | 閃電隊   | 王小明   | 2026-01-22 | 170        |
      Then 訓練應成功建立
      And 訓練的好球帶身高應為 170

  Rule: 前置條件驗證

    @error-handling
    Example: 球隊不存在應建立失敗
      Given 系統中不存在球隊 "未知球隊"
      When 教練 建立訓練:
        | 球隊     | 受測選手 | 日期       | 好球帶身高 |
        | 未知球隊 | 王小明   | 2026-01-22 | 170        |
      Then 應回傳錯誤 "球隊不存在"

    @error-handling
    Example: 選手不存在應建立失敗
      Given 系統中存在球隊 "閃電隊"
      And 球隊 "閃電隊" 中不存在球員 "不存在的選手"
      When 教練 建立訓練:
        | 球隊   | 受測選手     | 日期       | 好球帶身高 |
        | 閃電隊 | 不存在的選手 | 2026-01-22 | 170        |
      Then 應回傳錯誤 "選手不存在"

  Rule: 必填欄位驗證

    @boundary
    Example: 未選擇球隊應建立失敗
      When 教練 建立訓練時未選擇球隊
      Then 應回傳錯誤 "請選擇球隊"

    @boundary
    Example: 未選擇受測選手應建立失敗
      Given 系統中存在球隊 "閃電隊"
      When 教練 建立訓練時未選擇受測選手
      Then 應回傳錯誤 "請選擇受測選手"

    @boundary
    Example: 未填寫好球帶身高應建立失敗
      Given 系統中存在球隊 "閃電隊"
      And 球隊 "閃電隊" 中存在球員 "王小明"
      When 教練 建立訓練時未填寫好球帶身高
      Then 應回傳錯誤 "請填寫好球帶身高"

  Rule: 好球帶身高驗證

    @boundary
    Example: 好球帶身高過低應建立失敗
      Given 系統中存在球隊 "閃電隊"
      And 球隊 "閃電隊" 中存在球員 "王小明"
      When 教練 建立訓練:
        | 球隊   | 受測選手 | 日期       | 好球帶身高 |
        | 閃電隊 | 王小明   | 2026-01-22 | 50         |
      Then 應回傳錯誤 "好球帶身高必須在合理範圍內"

    @boundary
    Example: 好球帶身高過高應建立失敗
      Given 系統中存在球隊 "閃電隊"
      And 球隊 "閃電隊" 中存在球員 "王小明"
      When 教練 建立訓練:
        | 球隊   | 受測選手 | 日期       | 好球帶身高 |
        | 閃電隊 | 王小明   | 2026-01-22 | 250        |
      Then 應回傳錯誤 "好球帶身高必須在合理範圍內"
