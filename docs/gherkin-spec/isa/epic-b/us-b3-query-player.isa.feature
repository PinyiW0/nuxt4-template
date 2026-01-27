# language: zh-TW
# encoding: UTF-8
# Feature: 查詢球員列表
# Epic: B - 球隊/球員資料管理
# User Story: US-B3
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# ISA Compatible: Yes
# @publishes: 球員列表已查詢
# @requires: us-b1-select-team
# Allowed Roles: 管理者, 教練
# Boundary Decisions:
#   - GD-007: 查詢時預設過濾已刪除的球員
#   - GD-011: 教練只能操作自己的資源

@epic-b @player @query
Feature: 查詢球員列表
  身為 管理者/教練
  我想要 查詢球隊的球員列表
  以便 管理球員名單

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可查詢任意球隊的球員

    @permission @happy-path
    Example: 管理者查詢球員列表
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個使用者, with table:
        | >Coach1.id | name   | role  | status |
        | <coach1Id  | coach1 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy   |
        | <teamId  | 閃電隊   | ACTIVE | $Coach1.id  |
      And 準備一個球員, with table:
        | >Player1.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <player1Id  | $Team.id | 1            | 王小明 | P        | 1         | ACTIVE |
      And 準備一個球員, with table:
        | >Player2.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <player2Id  | $Team.id | 2            | 李小華 | C        | 2         | ACTIVE |
      When (UID="$User.id") 查詢球員列表, call table:
        | teamId   |
        | $Team.id |
      Then 回應, with table:
        | statusCode | 200 |
      And 回應為, with JSON:
        """
        {
          "data": [
            { "name": "王小明", "jerseyNumber": 1 },
            { "name": "李小華", "jerseyNumber": 2 }
          ],
          "total": 2
        }
        """

  Rule: 教練只能查詢自己球隊的球員

    @permission @happy-path
    Example: 教練查詢自己球隊的球員
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | coach1 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      And 準備一個球員, with table:
        | >Player.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <playerId  | $Team.id | 1            | 王小明 | P        | 1         | ACTIVE |
      When (UID="$User.id") 查詢球員列表, call table:
        | teamId   |
        | $Team.id |
      Then 回應, with table:
        | statusCode | 200 |
      And 回應為, with JSON:
        """
        {
          "data": [
            { "name": "王小明" }
          ],
          "total": 1
        }
        """

    @permission @error-handling
    Example: 教練無法查詢他人球隊的球員
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | coach1 | COACH | ACTIVE |
      And 準備一個使用者, with table:
        | >Coach2.id | name   | role  | status |
        | <coach2Id  | coach2 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy   |
        | <teamId  | 閃電隊   | ACTIVE | $Coach2.id  |
      When (UID="$User.id") 查詢球員列表, call table:
        | teamId   |
        | $Team.id |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 403 |

  # ===== Phase 2: 核心業務 =====

  Rule: 查詢結果依排序顯示

    @happy-path
    Example: 球員依排序順序顯示
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      And 準備一個球員, with table:
        | >Player1.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <player1Id  | $Team.id | 2            | 李小華 | C        | 1         | ACTIVE |
      And 準備一個球員, with table:
        | >Player2.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <player2Id  | $Team.id | 1            | 王小明 | P        | 2         | ACTIVE |
      When (UID="$User.id") 查詢球員列表, call table:
        | teamId   |
        | $Team.id |
      Then 回應, with table:
        | statusCode | 200 |
      And 回應為, with JSON:
        """
        {
          "data": [
            { "name": "李小華", "sortOrder": 1 },
            { "name": "王小明", "sortOrder": 2 }
          ],
          "total": 2
        }
        """

  Rule: 查詢結果過濾已刪除的球員

    @happy-path
    Example: 已刪除的球員不顯示
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      And 準備一個球員, with table:
        | >Player1.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <player1Id  | $Team.id | 1            | 王小明 | P        | 1         | ACTIVE |
      And 準備一個球員, with table:
        | >Player2.id | teamId   | jerseyNumber | name   | position | sortOrder | status  |
        | <player2Id  | $Team.id | 99           | 離隊者 | C        | 2         | DELETED |
      When (UID="$User.id") 查詢球員列表, call table:
        | teamId   |
        | $Team.id |
      Then 回應, with table:
        | statusCode | 200 |
      And 回應為, with JSON:
        """
        {
          "data": [
            { "name": "王小明" }
          ],
          "total": 1
        }
        """

  # ===== Phase 3: 邊界條件 =====

  Rule: 無球員時應回傳空列表

    @boundary
    Example: 新球隊沒有球員
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      When (UID="$User.id") 查詢球員列表, call table:
        | teamId   |
        | $Team.id |
      Then 回應, with table:
        | statusCode | 200 |
      And 回應為, with JSON:
        """
        {
          "data": [],
          "total": 0
        }
        """
