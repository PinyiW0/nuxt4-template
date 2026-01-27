# language: zh-TW
# encoding: UTF-8
# Feature: 查詢球隊列表
# Epic: B - 球隊/球員資料管理
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# Level: DSL
# @publishes: 球隊列表已查詢
# Allowed Roles: 管理者, 教練

@epic-b @team @query
Feature: 查詢球隊列表
  身為 管理者/教練
  我想要 查詢球隊列表
  以便 選擇要管理的球隊

  Background:
    Given 使用者已登入系統

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可查詢所有球隊

    @permission @happy-path
    Example: 管理者查詢球隊列表
      Given 使用者為「管理者」角色
      And 系統中存在球隊 "藍鷹隊"，建立者為 "coach1"
      And 系統中存在球隊 "紅龍隊"，建立者為 "coach2"
      When 使用者 查詢球隊列表
      Then 應回傳 2 筆球隊
      And 應包含球隊 "藍鷹隊"
      And 應包含球隊 "紅龍隊"

  Rule: 教練只能查詢自己建立的球隊

    @permission @happy-path
    Example: 教練查詢自己建立的球隊
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 系統中存在球隊 "藍鷹隊"，建立者為 "coach1"
      And 系統中存在球隊 "紅龍隊"，建立者為 "coach2"
      When 使用者 查詢球隊列表
      Then 應回傳 1 筆球隊
      And 應包含球隊 "藍鷹隊"
      And 不應包含球隊 "紅龍隊"

  # ===== Phase 2: 核心業務 =====

  Rule: 查詢結果預設過濾已刪除的球隊

    @happy-path
    Example: 已刪除的球隊不顯示
      Given 使用者為「管理者」角色
      And 系統中存在球隊 "藍鷹隊"，狀態為 "ACTIVE"
      And 系統中存在球隊 "解散隊"，狀態為 "DELETED"
      When 使用者 查詢球隊列表
      Then 應回傳 1 筆球隊
      And 應包含球隊 "藍鷹隊"
      And 不應包含球隊 "解散隊"

  # ===== Phase 3: 邊界條件 =====

  Rule: 無球隊時應回傳空列表

    @boundary
    Example: 新教練查詢球隊列表
      Given 使用者為「教練」角色，帳號為 "coach_new"
      And 使用者尚未建立任何球隊
      When 使用者 查詢球隊列表
      Then 應回傳 0 筆球隊
