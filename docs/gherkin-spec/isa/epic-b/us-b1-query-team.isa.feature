# language: zh-TW
# encoding: UTF-8
# Feature: 查詢球隊列表
# Epic: B - 球隊/球員資料管理
# User Story: US-B1
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# ISA Compatible: Yes
# @publishes: 球隊列表已查詢
# Allowed Roles: 管理者, 教練
# Boundary Decisions:
#   - GD-002: 查詢時預設過濾已刪除的球隊
#   - GD-011: 教練只能操作自己的資源

@epic-b @team @query
Feature: 查詢球隊列表
  身為 管理者/教練
  我想要 查詢球隊列表
  以便 選擇要管理的球隊

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可查詢所有球隊

    @permission @happy-path
    Example: 管理者查詢球隊列表
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個使用者, with table:
        | >Coach1.id | name   | role  | status |
        | <coach1Id  | coach1 | COACH | ACTIVE |
      And 準備一個使用者, with table:
        | >Coach2.id | name   | role  | status |
        | <coach2Id  | coach2 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team1.id | teamName | status | createdBy   |
        | <team1Id  | 藍鷹隊   | ACTIVE | $Coach1.id  |
      And 準備一個球隊, with table:
        | >Team2.id | teamName | status | createdBy   |
        | <team2Id  | 紅龍隊   | ACTIVE | $Coach2.id  |
      When (UID="$User.id") 查詢球隊列表, call table:
        | |
      Then 回應, with table:
        | statusCode | 200 |
      And 回應為, with JSON:
        """
        {
          "data": [
            { "teamName": "藍鷹隊" },
            { "teamName": "紅龍隊" }
          ],
          "total": 2
        }
        """

  Rule: 教練只能查詢自己建立的球隊

    @permission @happy-path
    Example: 教練查詢自己建立的球隊
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | coach1 | COACH | ACTIVE |
      And 準備一個使用者, with table:
        | >Coach2.id | name   | role  | status |
        | <coach2Id  | coach2 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team1.id | teamName | status | createdBy  |
        | <team1Id  | 藍鷹隊   | ACTIVE | $User.id   |
      And 準備一個球隊, with table:
        | >Team2.id | teamName | status | createdBy   |
        | <team2Id  | 紅龍隊   | ACTIVE | $Coach2.id  |
      When (UID="$User.id") 查詢球隊列表, call table:
        | |
      Then 回應, with table:
        | statusCode | 200 |
      And 回應為, with JSON:
        """
        {
          "data": [
            { "teamName": "藍鷹隊" }
          ],
          "total": 1
        }
        """

  # ===== Phase 2: 核心業務 =====

  Rule: 查詢結果預設過濾已刪除的球隊

    @happy-path
    Example: 已刪除的球隊不顯示
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team1.id | teamName | status | createdBy |
        | <team1Id  | 藍鷹隊   | ACTIVE | $User.id  |
      And 準備一個球隊, with table:
        | >Team2.id | teamName | status  | createdBy |
        | <team2Id  | 解散隊   | DELETED | $User.id  |
      When (UID="$User.id") 查詢球隊列表, call table:
        | |
      Then 回應, with table:
        | statusCode | 200 |
      And 回應為, with JSON:
        """
        {
          "data": [
            { "teamName": "藍鷹隊" }
          ],
          "total": 1
        }
        """

  # ===== Phase 3: 邊界條件 =====

  Rule: 無球隊時應回傳空列表

    @boundary
    Example: 新教練查詢球隊列表
      Given 準備一個使用者, with table:
        | >User.id | name      | role  | status |
        | <userId  | coach_new | COACH | ACTIVE |
      When (UID="$User.id") 查詢球隊列表, call table:
        | |
      Then 回應, with table:
        | statusCode | 200 |
      And 回應為, with JSON:
        """
        {
          "data": [],
          "total": 0
        }
        """
