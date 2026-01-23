# language: zh-TW
# encoding: UTF-8
# Feature: 刪除球員
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23

@epic-b @player @command
Feature: 刪除球員
  身為 教練
  我想要 刪除球員
  以便 清理不需要的資料

  Background:
    Given 教練 已登入系統
    And 系統中存在球隊 "閃電隊"

  Rule: 可以刪除球員

    @happy-path
    Example: 成功刪除球員
      Given 球隊 "閃電隊" 有球員 "王小明"，背號 1
      When 教練 刪除球員 "王小明"
      Then 球員 "王小明" 應該不存在

    @happy-path
    Example: 刪除球員後其他球員不受影響
      Given 球隊 "閃電隊" 有球員 "王小明"，背號 1
      And 球隊 "閃電隊" 有球員 "李小華"，背號 2
      When 教練 刪除球員 "王小明"
      Then 球員 "王小明" 應該不存在
      And 球員 "李小華" 應該存在

  Rule: 刪除不存在的球員應失敗

    @error-handling
    Example: 刪除不存在的球員應失敗
      Given 球隊 "閃電隊" 沒有球員 "幽靈球員"
      When 教練 刪除球員 "幽靈球員"
      Then 應回傳錯誤 "找不到指定的球員"
