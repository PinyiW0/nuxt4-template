# language: zh-TW
# encoding: UTF-8
# Feature: 查詢球員列表
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23

@epic-b @player @query
Feature: 查詢球員列表
  身為 教練
  我想要 查詢球隊的球員列表
  以便 管理球員名單

  Background:
    Given 教練 已登入系統
    And 系統中存在球隊 "閃電隊"

  Rule: 可以查詢指定球隊的球員

    @happy-path
    Example: 成功查詢球員列表
      Given 球隊 "閃電隊" 有球員 "王小明"，背號 1，守位 "P"
      And 球隊 "閃電隊" 有球員 "李小華"，背號 2，守位 "C"
      When 教練 查詢球隊 "閃電隊" 的球員列表
      Then 應回傳 2 筆球員
      And 應包含球員 "王小明"
      And 應包含球員 "李小華"

    @boundary
    Example: 球隊無球員時應回傳空列表
      Given 球隊 "閃電隊" 沒有任何球員
      When 教練 查詢球隊 "閃電隊" 的球員列表
      Then 應回傳 0 筆球員

  Rule: 球員應依排序順序顯示

    @happy-path
    Example: 球員依排序順序顯示
      Given 球隊 "閃電隊" 有球員 "王小明"，背號 1，排序 2
      And 球隊 "閃電隊" 有球員 "李小華"，背號 2，排序 1
      When 教練 查詢球隊 "閃電隊" 的球員列表
      Then 第 1 筆球員應為 "李小華"
      And 第 2 筆球員應為 "王小明"

  Rule: 查詢不存在的球隊應失敗

    @error-handling
    Example: 查詢不存在球隊的球員應失敗
      Given 系統中沒有球隊 "幽靈隊"
      When 教練 查詢球隊 "幽靈隊" 的球員列表
      Then 應回傳錯誤 "找不到指定的球隊"
