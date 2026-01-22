# language: zh-TW
# encoding: UTF-8
# Feature: 建立球隊
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/us-teamAndPlayer.md
# Generated: 2026-01-22
# Level: DSL
# Boundary Decisions:
#   - Q4: 球隊名稱不區分大小寫

@epic-b @team @command
Feature: 建立球隊
  身為 教練
  我想要 建立新球隊
  以便 管理球員名單

  Rule: 球隊名稱必須唯一（不區分大小寫）

    @happy-path
    Example: 成功建立球隊
      Given 系統中沒有球隊 "閃電隊"
      When 教練 建立球隊 "閃電隊"
      Then 球隊 "閃電隊" 應該存在
      And 球隊 "閃電隊" 狀態應為 "ACTIVE"

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

  Rule: 球隊名稱長度限制

    @boundary
    Example: 球隊名稱少於 2 字元應失敗
      When 教練 建立球隊 "A"
      Then 應回傳錯誤 "球隊名稱至少 2 個字元"

    @boundary
    Example: 球隊名稱超過 50 字元應失敗
      When 教練 建立球隊 "這是一個超過五十個字元的球隊名稱用來測試長度限制功能是否正常運作的測試案例"
      Then 應回傳錯誤 "球隊名稱最多 50 個字元"
