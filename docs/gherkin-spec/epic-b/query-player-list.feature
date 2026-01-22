# language: zh-TW
# encoding: UTF-8
# Feature: 查詢球員列表
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/us-teamAndPlayer.md
# Generated: 2026-01-22
# Level: DSL

@epic-b @player @query
Feature: 查詢球員列表
  身為 教練
  我想要 查詢球隊的球員列表
  以便 瀏覽球員資訊

  Background:
    Given 系統中存在球隊 "閃電隊"

  Rule: 可以查詢球隊的球員列表

    @happy-path
    Example: 成功查詢球員列表
      Given 球隊 "閃電隊" 有以下球員:
        | 姓名   | 背號 | 守備位置 |
        | 王小明 | 1    | 投手     |
        | 李小華 | 2    | 捕手     |
      When 教練 查詢球隊 "閃電隊" 的球員列表
      Then 應回傳 2 筆球員
      And 應包含球員 "王小明"
      And 應包含球員 "李小華"

    @happy-path
    Example: 球員列表依排序順序顯示
      Given 球隊 "閃電隊" 有以下球員:
        | 姓名   | 背號 | 守備位置 | 排序 |
        | 王小明 | 1    | 投手     | 2    |
        | 李小華 | 2    | 捕手     | 1    |
      When 教練 查詢球隊 "閃電隊" 的球員列表
      Then 第 1 位球員應為 "李小華"
      And 第 2 位球員應為 "王小明"

  Rule: 無球員時回傳空列表

    @boundary
    Example: 無球員時應回傳空列表
      Given 球隊 "閃電隊" 沒有任何球員
      When 教練 查詢球隊 "閃電隊" 的球員列表
      Then 應回傳 0 筆球員

  Rule: 無法查詢不存在球隊的球員

    @error-handling
    Example: 查詢不存在球隊的球員應失敗
      Given 系統中沒有球隊 "幽靈隊"
      When 教練 查詢球隊 "幽靈隊" 的球員列表
      Then 應回傳錯誤 "找不到指定的球隊"
