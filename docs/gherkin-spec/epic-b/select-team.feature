# language: zh-TW
# encoding: UTF-8
# Feature: 選擇球隊
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/us-teamAndPlayer.md
# Generated: 2026-01-22
# Level: DSL

@epic-b @team @command
Feature: 選擇球隊
  身為 教練
  我想要 選擇特定球隊
  以便 管理該隊球員

  Rule: 可以選擇存在的球隊

    @happy-path
    Example: 成功選擇球隊
      Given 系統中存在球隊 "閃電隊"
      When 教練 選擇球隊 "閃電隊"
      Then 應顯示球隊 "閃電隊" 的資訊

  Rule: 無法選擇不存在的球隊

    @error-handling
    Example: 選擇不存在的球隊應失敗
      Given 系統中沒有球隊 "幽靈隊"
      When 教練 選擇球隊 "幽靈隊"
      Then 應回傳錯誤 "找不到指定的球隊"
