# language: zh-TW
# encoding: UTF-8
# Feature: 刪除球隊
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/us-teamAndPlayer.md
# Generated: 2026-01-22
# Level: DSL
# Boundary Decisions:
#   - Q2: 軟刪除（標記 status 為 DELETED）
#   - Q3: 級聯刪除（刪除球隊時一併刪除所有球員）

@epic-b @team @command
Feature: 刪除球隊
  身為 管理者
  我想要 刪除球隊
  以便 移除不再需要的球隊資料

  Rule: 可以刪除存在的球隊

    @happy-path
    Example: 成功刪除無球員的球隊
      Given 系統中存在球隊 "閃電隊"
      And 球隊 "閃電隊" 沒有任何球員
      When 管理者 刪除球隊 "閃電隊"
      Then 球隊 "閃電隊" 應該不存在

    @happy-path
    Example: 刪除有球員的球隊時一併刪除球員
      Given 系統中存在球隊 "閃電隊"
      And 球隊 "閃電隊" 有球員 "王小明"，背號 1
      And 球隊 "閃電隊" 有球員 "李小華"，背號 2
      When 管理者 刪除球隊 "閃電隊"
      Then 球隊 "閃電隊" 應該不存在
      And 球員 "王小明" 應該不存在
      And 球員 "李小華" 應該不存在

  Rule: 無法刪除不存在的球隊

    @error-handling
    Example: 刪除不存在的球隊應失敗
      Given 系統中沒有球隊 "幽靈隊"
      When 管理者 刪除球隊 "幽靈隊"
      Then 應回傳錯誤 "找不到指定的球隊"
