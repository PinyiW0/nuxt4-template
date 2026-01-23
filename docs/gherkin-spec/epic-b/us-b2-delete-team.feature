# language: zh-TW
# encoding: UTF-8
# Feature: 刪除球隊
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-23
# Boundary Decisions:
#   - GD-001: 硬刪除
#   - GD-002: 級聯刪除球員
#   - GD-003: 需要確認

@epic-b @team @command
Feature: 刪除球隊
  身為 教練
  我想要 刪除球隊
  以便 清理不需要的資料

  Background:
    Given 教練 已登入系統

  Rule: 刪除球隊會連帶刪除所有球員

    @happy-path
    Example: 確認後成功刪除球隊及球員
      Given 系統中存在球隊 "閃電隊"
      And 球隊 "閃電隊" 有球員 "王小明"，背號 1
      And 球隊 "閃電隊" 有球員 "李小華"，背號 2
      When 教練 刪除球隊 "閃電隊" 並確認刪除
      Then 球隊 "閃電隊" 應該不存在
      And 球員 "王小明" 應該不存在
      And 球員 "李小華" 應該不存在

    @happy-path
    Example: 刪除無球員的球隊
      Given 系統中存在球隊 "空白隊"
      And 球隊 "空白隊" 沒有任何球員
      When 教練 刪除球隊 "空白隊" 並確認刪除
      Then 球隊 "空白隊" 應該不存在

  Rule: 刪除前必須確認

    @error-handling
    Example: 未確認則不刪除球隊
      Given 系統中存在球隊 "閃電隊"
      And 球隊 "閃電隊" 有球員 "王小明"，背號 1
      When 教練 刪除球隊 "閃電隊" 但未確認
      Then 球隊 "閃電隊" 應該存在
      And 球員 "王小明" 應該存在

  Rule: 刪除不存在的球隊應失敗

    @error-handling
    Example: 刪除不存在的球隊應失敗
      Given 系統中沒有球隊 "幽靈隊"
      When 教練 刪除球隊 "幽靈隊" 並確認刪除
      Then 應回傳錯誤 "找不到指定的球隊"
