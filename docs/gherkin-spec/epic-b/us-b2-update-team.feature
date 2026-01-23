# language: zh-TW
# encoding: UTF-8
# Feature: 編輯球隊
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23
# Boundary Decisions:
#   - GD-005: 球隊名稱不區分大小寫

@epic-b @team @command
Feature: 編輯球隊
  身為 教練
  我想要 編輯球隊名稱
  以便 確保名單正確

  Background:
    Given 教練 已登入系統

  Rule: 可以編輯球隊名稱

    @happy-path
    Example: 成功編輯球隊名稱
      Given 系統中存在球隊 "閃電隊"
      When 教練 編輯球隊 "閃電隊" 名稱為 "雷霆隊"
      Then 球隊 "雷霆隊" 應該存在
      And 球隊 "閃電隊" 應該不存在

  Rule: 新名稱不可與其他球隊重複

    @error-handling
    Example: 編輯為已存在的球隊名稱應失敗
      Given 系統中存在球隊 "閃電隊"
      And 系統中存在球隊 "勇士隊"
      When 教練 編輯球隊 "閃電隊" 名稱為 "勇士隊"
      Then 應回傳錯誤 "球隊名稱已被使用"

    @error-handling
    Example: 編輯為僅大小寫不同的名稱應失敗
      Given 系統中存在球隊 "閃電隊"
      And 系統中存在球隊 "TeamB"
      When 教練 編輯球隊 "閃電隊" 名稱為 "teamb"
      Then 應回傳錯誤 "球隊名稱已被使用"

  Rule: 編輯不存在的球隊應失敗

    @error-handling
    Example: 編輯不存在的球隊應失敗
      Given 系統中沒有球隊 "幽靈隊"
      When 教練 編輯球隊 "幽靈隊" 名稱為 "新隊伍"
      Then 應回傳錯誤 "找不到指定的球隊"
