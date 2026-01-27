# language: zh-TW
# encoding: UTF-8
# Feature: 刪除球隊
# Epic: B - 球隊/球員資料管理
# User Story: US-B2
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 球隊已刪除, 球員已級聯刪除
# @requires: us-b1-select-team
# Allowed Roles: 管理者, 教練
# Boundary Decisions:
#   - GD-001: 軟刪除
#   - GD-003: 刪除球隊時級聯刪除球員
#   - GD-004: 級聯刪除前需要確認
#   - GD-011: 教練只能操作自己的資源

@epic-b @team @command
Feature: 刪除球隊
  身為 管理者/教練
  我想要 刪除不需要的球隊
  以便 維護乾淨的資料

  Background:
    Given 使用者已登入系統

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可刪除所有球隊

    @permission @happy-path
    Example: 管理者刪除任意球隊
      Given 使用者為「管理者」角色
      And 系統中存在球隊 "藍鷹隊"，建立者為 "coach1"
      And 球隊 "藍鷹隊" 沒有任何球員
      When 使用者 刪除球隊 "藍鷹隊"
      Then 球隊 "藍鷹隊" 狀態應為 "DELETED"
      And 球隊 "藍鷹隊" 的刪除者為目前使用者
      And 球隊 "藍鷹隊" 的刪除時間已記錄

  Rule: 教練只能刪除自己建立的球隊

    @permission @happy-path
    Example: 教練刪除自己建立的球隊
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 系統中存在球隊 "藍鷹隊"，建立者為 "coach1"
      And 球隊 "藍鷹隊" 沒有任何球員
      When 使用者 刪除球隊 "藍鷹隊"
      Then 球隊 "藍鷹隊" 狀態應為 "DELETED"

    @permission @error-handling
    Example: 教練無法刪除他人建立的球隊
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 系統中存在球隊 "紅龍隊"，建立者為 "coach2"
      When 使用者 刪除球隊 "紅龍隊"
      Then 應回傳錯誤 "無權限操作此球隊"

  # ===== Phase 2: 核心業務 =====

  Rule: 刪除球隊採用軟刪除

    @happy-path
    Example: 軟刪除球隊保留歷史紀錄
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 系統中存在球隊 "藍鷹隊"，建立者為 "coach1"，狀態為 "ACTIVE"
      And 球隊 "藍鷹隊" 沒有任何球員
      When 使用者 刪除球隊 "藍鷹隊"
      Then 球隊 "藍鷹隊" 狀態應為 "DELETED"
      And 球隊 "藍鷹隊" 的刪除時間已記錄
      And 球隊 "藍鷹隊" 的資料仍保留在資料庫

  Rule: 刪除有球員的球隊時需要確認級聯刪除

    @happy-path
    Example: 確認後刪除球隊並級聯刪除球員
      Given 使用者為「管理者」角色
      And 系統中存在球隊 "藍鷹隊"
      And 球隊 "藍鷹隊" 有以下球員:
        | 姓名   | 背號 |
        | 王小明 | 1    |
        | 李小華 | 2    |
      When 使用者 請求刪除球隊 "藍鷹隊"
      Then 系統顯示確認訊息 "確定要刪除球隊「藍鷹隊」嗎？這將同時刪除 2 名球員"
      When 使用者 確認刪除
      Then 球隊 "藍鷹隊" 狀態應為 "DELETED"
      And 球員 "王小明" 狀態應為 "DELETED"
      And 球員 "李小華" 狀態應為 "DELETED"

    @happy-path
    Example: 取消刪除操作
      Given 使用者為「管理者」角色
      And 系統中存在球隊 "藍鷹隊"
      And 球隊 "藍鷹隊" 有球員 "王小明"，背號 1
      When 使用者 請求刪除球隊 "藍鷹隊"
      Then 系統顯示確認訊息 "確定要刪除球隊「藍鷹隊」嗎？這將同時刪除 1 名球員"
      When 使用者 取消刪除
      Then 球隊 "藍鷹隊" 狀態應為 "ACTIVE"
      And 球員 "王小明" 狀態應為 "ACTIVE"

  Rule: 無球員的球隊可直接刪除

    @happy-path
    Example: 刪除無球員的球隊不需確認
      Given 使用者為「管理者」角色
      And 系統中存在球隊 "新球隊"
      And 球隊 "新球隊" 沒有任何球員
      When 使用者 刪除球隊 "新球隊"
      Then 球隊 "新球隊" 狀態應為 "DELETED"

  # ===== Phase 3: 邊界條件 =====

  Rule: 無法刪除不存在的球隊

    @error-handling
    Example: 刪除不存在的球隊
      Given 使用者為「管理者」角色
      And 系統中不存在球隊 "幽靈隊"
      When 使用者 刪除球隊 "幽靈隊"
      Then 應回傳錯誤 "找不到指定的球隊"

  Rule: 無法刪除已刪除的球隊

    @error-handling
    Example: 重複刪除球隊應失敗
      Given 使用者為「管理者」角色
      And 系統中存在球隊 "解散隊"，狀態為 "DELETED"
      When 使用者 刪除球隊 "解散隊"
      Then 應回傳錯誤 "球隊不存在或已刪除"
