# language: zh-TW
# encoding: UTF-8
# Feature: 刪除球員
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/us-teamAndPlayer.md
# Generated: 2026-01-22
# Level: DSL
# Boundary Decisions:
#   - Q2: 軟刪除（標記 status 為 DELETED）

@epic-b @player @command
Feature: 刪除球員
  身為 教練
  我想要 刪除球員
  以便 移除不再需要的球員資料

  Background:
    Given 系統中存在球隊 "閃電隊"

  Rule: 可以刪除存在的球員

    @happy-path
    Example: 成功刪除球員
      Given 球隊 "閃電隊" 有球員 "王小明"，背號 1
      When 教練 從球隊 "閃電隊" 刪除球員 "王小明"
      Then 球員 "王小明" 應該不存在

    @happy-path
    Example: 刪除球員後其他球員不受影響
      Given 球隊 "閃電隊" 有球員 "王小明"，背號 1
      And 球隊 "閃電隊" 有球員 "李小華"，背號 2
      When 教練 從球隊 "閃電隊" 刪除球員 "王小明"
      Then 球員 "王小明" 應該不存在
      And 球員 "李小華" 應該存在

  Rule: 無法刪除不存在的球員

    @error-handling
    Example: 刪除不存在的球員應失敗
      When 教練 從球隊 "閃電隊" 刪除球員 "不存在的球員"
      Then 應回傳錯誤 "找不到指定的球員"
