# language: zh-TW
# encoding: UTF-8
# Feature: 查詢球隊列表
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/us-teamAndPlayer.md
# Generated: 2026-01-22
# Level: DSL

@epic-b @team @query
Feature: 查詢球隊列表
  身為 教練
  我想要 查詢所有球隊
  以便 選擇要管理的球隊

  Rule: 可以查詢所有啟用的球隊

    @happy-path
    Example: 成功查詢球隊列表
      Given 系統中存在球隊 "閃電隊"，狀態為 "ACTIVE"
      And 系統中存在球隊 "勇士隊"，狀態為 "ACTIVE"
      When 教練 查詢球隊列表
      Then 應回傳 2 筆球隊
      And 應包含球隊 "閃電隊"
      And 應包含球隊 "勇士隊"

    @happy-path
    Example: 查詢含有停用球隊時只顯示啟用的球隊
      Given 系統中存在球隊 "閃電隊"，狀態為 "ACTIVE"
      And 系統中存在球隊 "幽靈隊"，狀態為 "INACTIVE"
      When 教練 查詢球隊列表
      Then 應回傳 1 筆球隊
      And 應包含球隊 "閃電隊"
      And 不應包含球隊 "幽靈隊"

  Rule: 無球隊時回傳空列表

    @boundary
    Example: 無球隊時應回傳空列表
      Given 系統中沒有任何球隊
      When 教練 查詢球隊列表
      Then 應回傳 0 筆球隊
