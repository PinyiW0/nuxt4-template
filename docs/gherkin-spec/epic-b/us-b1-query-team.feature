# language: zh-TW
# encoding: UTF-8
# Feature: 查詢球隊列表
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23

@epic-b @team @query
Feature: 查詢球隊列表
  身為 教練
  我想要 查詢並選擇球隊
  以便 管理該隊球員

  Background:
    Given 教練 已登入系統

  Rule: 可以查詢所有球隊

    @happy-path
    Example: 成功查詢球隊列表
      Given 系統中存在球隊 "閃電隊"
      And 系統中存在球隊 "勇士隊"
      When 教練 查詢球隊列表
      Then 應回傳 2 筆球隊
      And 應包含球隊 "閃電隊"
      And 應包含球隊 "勇士隊"

    @boundary
    Example: 無球隊時應回傳空列表
      Given 系統中沒有任何球隊
      When 教練 查詢球隊列表
      Then 應回傳 0 筆球隊

  Rule: 可以選擇特定球隊

    @happy-path
    Example: 成功選擇球隊
      Given 系統中存在球隊 "閃電隊"
      When 教練 選擇球隊 "閃電隊"
      Then 應成功選擇球隊 "閃電隊"
      And 應顯示球隊 "閃電隊" 的資訊

    @error-handling
    Example: 選擇不存在的球隊應失敗
      Given 系統中沒有球隊 "幽靈隊"
      When 教練 選擇球隊 "幽靈隊"
      Then 應回傳錯誤 "找不到指定的球隊"
