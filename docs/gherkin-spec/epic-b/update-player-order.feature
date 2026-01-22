# language: zh-TW
# encoding: UTF-8
# Feature: 調整球員排序
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/us-teamAndPlayer.md
# Generated: 2026-01-22
# Level: DSL

@epic-b @player @command
Feature: 調整球員排序
  身為 教練
  我想要 調整球員排序
  以便 符合教練習慣或出賽順序

  Background:
    Given 系統中存在球隊 "閃電隊"

  Rule: 可以調整球員顯示順序

    @happy-path
    Example: 成功調整單一球員排序
      Given 球隊 "閃電隊" 有以下球員:
        | 姓名   | 背號 | 排序 |
        | 王小明 | 1    | 1    |
        | 李小華 | 2    | 2    |
      When 教練 調整球員 "王小明" 排序為 2
      Then 球員 "王小明" 排序應為 2

    @happy-path
    Example: 成功批次調整球員排序
      Given 球隊 "閃電隊" 有以下球員:
        | 姓名   | 背號 | 排序 |
        | 王小明 | 1    | 1    |
        | 李小華 | 2    | 2    |
        | 張大華 | 3    | 3    |
      When 教練 調整球隊 "閃電隊" 的球員排序為:
        | 姓名   | 新排序 |
        | 張大華 | 1      |
        | 李小華 | 2      |
        | 王小明 | 3      |
      Then 球員 "張大華" 排序應為 1
      And 球員 "李小華" 排序應為 2
      And 球員 "王小明" 排序應為 3

  Rule: 排序變更後自動儲存

    @happy-path
    Example: 排序變更後查詢應反映新順序
      Given 球隊 "閃電隊" 有以下球員:
        | 姓名   | 背號 | 排序 |
        | 王小明 | 1    | 1    |
        | 李小華 | 2    | 2    |
      When 教練 調整球隊 "閃電隊" 的球員排序為:
        | 姓名   | 新排序 |
        | 李小華 | 1      |
        | 王小明 | 2      |
      And 教練 查詢球隊 "閃電隊" 的球員列表
      Then 第 1 位球員應為 "李小華"
      And 第 2 位球員應為 "王小明"

  Rule: 無法調整不存在球隊的球員排序

    @error-handling
    Example: 調整不存在球隊的球員排序應失敗
      Given 系統中沒有球隊 "幽靈隊"
      When 教練 調整球隊 "幽靈隊" 的球員排序為:
        | 姓名   | 新排序 |
        | 王小明 | 1      |
      Then 應回傳錯誤 "找不到指定的球隊"

  Rule: 無法調整不存在球員的排序

    @error-handling
    Example: 調整不存在球員的排序應失敗
      Given 球隊 "閃電隊" 有球員 "王小明"，背號 1
      When 教練 調整球隊 "閃電隊" 的球員排序為:
        | 姓名       | 新排序 |
        | 不存在的球員 | 1      |
      Then 應回傳錯誤 "找不到指定的球員"
