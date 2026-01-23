# language: zh-TW
# encoding: UTF-8
# Feature: 建立球隊
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23
# Boundary Decisions:
#   - GD-005: 球隊名稱不區分大小寫

@epic-b @team @command
Feature: 建立球隊
  身為 教練
  我想要 建立新球隊
  以便 管理球員名單

  Background:
    Given 教練 已登入系統

  Rule: 球隊名稱必須唯一（不區分大小寫）

    @happy-path
    Example: 成功建立球隊
      Given 系統中沒有球隊 "閃電隊"
      When 教練 建立球隊 "閃電隊"
      Then 球隊 "閃電隊" 應該存在

    @error-handling
    Example: 建立重複名稱的球隊應失敗
      Given 系統中存在球隊 "閃電隊"
      When 教練 建立球隊 "閃電隊"
      Then 應回傳錯誤 "球隊名稱已被使用"

    @error-handling
    Example: 建立僅大小寫不同的球隊名稱應失敗
      Given 系統中存在球隊 "TeamA"
      When 教練 建立球隊 "teama"
      Then 應回傳錯誤 "球隊名稱已被使用"

  Rule: 球隊名稱不可為空

    @boundary
    Example: 球隊名稱為空應失敗
      When 教練 建立球隊 ""
      Then 應回傳錯誤 "球隊名稱不可為空"
