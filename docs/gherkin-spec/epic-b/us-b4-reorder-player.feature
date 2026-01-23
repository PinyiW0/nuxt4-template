# language: zh-TW
# encoding: UTF-8
# Feature: 調整球員排序
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23

@epic-b @player @command
Feature: 調整球員排序
  身為 教練
  我想要 調整球員排序
  以便 符合教練習慣或出賽順序

  Background:
    Given 教練 已登入系統
    And 系統中存在球隊 "閃電隊"

  Rule: 可以調整球員排序

    @happy-path
    Example: 成功調整球員排序
      Given 球隊 "閃電隊" 有球員 "王小明"，背號 1，排序 1
      And 球隊 "閃電隊" 有球員 "李小華"，背號 2，排序 2
      And 球隊 "閃電隊" 有球員 "張大華"，背號 3，排序 3
      When 教練 調整球隊 "閃電隊" 的球員排序為 "李小華", "張大華", "王小明"
      Then 球員 "李小華" 排序應為 1
      And 球員 "張大華" 排序應為 2
      And 球員 "王小明" 排序應為 3

    @happy-path
    Example: 調整後查詢應依新排序顯示
      Given 球隊 "閃電隊" 有球員 "王小明"，背號 1，排序 1
      And 球隊 "閃電隊" 有球員 "李小華"，背號 2，排序 2
      When 教練 調整球隊 "閃電隊" 的球員排序為 "李小華", "王小明"
      And 教練 查詢球隊 "閃電隊" 的球員列表
      Then 第 1 筆球員應為 "李小華"
      And 第 2 筆球員應為 "王小明"

  Rule: 所有球員必須屬於同一球隊

    @error-handling
    Example: 調整包含其他球隊球員應失敗
      Given 系統中存在球隊 "勇士隊"
      And 球隊 "閃電隊" 有球員 "王小明"，背號 1
      And 球隊 "勇士隊" 有球員 "李小華"，背號 1
      When 教練 調整球隊 "閃電隊" 的球員排序為 "王小明", "李小華"
      Then 應回傳錯誤 "球員不屬於此球隊"

  Rule: 調整不存在球隊的排序應失敗

    @error-handling
    Example: 調整不存在球隊的排序應失敗
      Given 系統中沒有球隊 "幽靈隊"
      When 教練 調整球隊 "幽靈隊" 的球員排序為 "王小明"
      Then 應回傳錯誤 "找不到指定的球隊"
