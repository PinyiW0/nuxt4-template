# language: zh-TW
# encoding: UTF-8
# Feature: 編輯球員
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/us-teamAndPlayer.md
# Generated: 2026-01-22
# Level: DSL
# Boundary Decisions:
#   - Q1: 背號同一球隊內唯一

@epic-b @player @command
Feature: 編輯球員
  身為 教練
  我想要 編輯球員資料
  以便 更正或更新球員資訊

  Background:
    Given 系統中存在球隊 "閃電隊"
    And 球隊 "閃電隊" 有球員 "王小明"，背號 1

  Rule: 可以編輯存在的球員

    @happy-path
    Example: 成功編輯球員背號
      When 教練 編輯球員 "王小明" 背號為 10
      Then 球員 "王小明" 背號應為 10

    @happy-path
    Example: 成功編輯球員姓名
      When 教練 編輯球員 "王小明" 姓名為 "王大明"
      Then 球員 "王大明" 應該存在
      And 球員 "王小明" 應該不存在

    @happy-path
    Example: 成功編輯球員守備位置
      When 教練 編輯球員 "王小明" 守位為 "C"
      Then 球員 "王小明" 守備位置應為 "C"

  Rule: 無法編輯不存在的球員

    @error-handling
    Example: 編輯不存在的球員應失敗
      When 教練 編輯球員 "不存在的球員" 背號為 10
      Then 應回傳錯誤 "找不到指定的球員"

  Rule: 新背號不可與同隊其他球員重複

    @error-handling
    Example: 編輯為已存在的背號應失敗
      Given 球隊 "閃電隊" 有球員 "李小華"，背號 2
      When 教練 編輯球員 "王小明" 背號為 2
      Then 應回傳錯誤 "背號已被使用"

    @happy-path
    Example: 編輯為相同背號應成功
      When 教練 編輯球員 "王小明" 背號為 1
      Then 球員 "王小明" 背號應為 1

  Rule: 背號範圍為 0-99

    @error-handling
    Example: 編輯背號超過 99 應失敗
      When 教練 編輯球員 "王小明" 背號為 100
      Then 應回傳錯誤 "背號必須在 0-99 之間"
