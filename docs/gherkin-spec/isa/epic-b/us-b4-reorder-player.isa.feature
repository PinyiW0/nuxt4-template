# language: zh-TW
# encoding: UTF-8
# Feature: 調整球員排序
# Epic: B - 球隊/球員資料管理
# User Story: US-B4
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# ISA Compatible: Yes
# @publishes: 球員排序已調整
# @requires: us-b3-query-player
# Allowed Roles: 管理者, 教練
# Boundary Decisions:
#   - GD-011: 教練只能操作自己的資源

@epic-b @player @command
Feature: 調整球員排序
  身為 管理者/教練
  我想要 調整球員排序
  以便 符合教練習慣或出賽順序

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可調整任意球隊的球員排序

    @permission @happy-path
    Example: 管理者調整球員排序
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
      And 準備一個球員, with table:
        | >Player3.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <player3Id  | $Team.id | 3            | 張大強 | SS       | 3         | ACTIVE |
      When (UID="$User.id") 調整球員排序, call table:
        | teamId   | playerIds                               |
        | $Team.id | $Player2.id,$Player3.id,$Player1.id     |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球員, with table:
        | playerId    | sortOrder |
        | $Player2.id | 1         |
      And 應該存在一個球員, with table:
        | playerId    | sortOrder |
        | $Player3.id | 2         |
      And 應該存在一個球員, with table:
        | playerId    | sortOrder |
        | $Player1.id | 3         |

  Rule: 教練只能調整自己球隊的球員排序

    @permission @happy-path
    Example: 教練調整自己球隊的球員排序
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | coach1 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      And 準備一個球員, with table:
        | >Player1.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <player1Id  | $Team.id | 1            | 王小明 | P        | 1         | ACTIVE |
      And 準備一個球員, with table:
        | >Player2.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <player2Id  | $Team.id | 2            | 李小華 | C        | 2         | ACTIVE |
      When (UID="$User.id") 調整球員排序, call table:
        | teamId   | playerIds                     |
        | $Team.id | $Player2.id,$Player1.id       |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球員, with table:
        | playerId    | sortOrder |
        | $Player2.id | 1         |
      And 應該存在一個球員, with table:
        | playerId    | sortOrder |
        | $Player1.id | 2         |

    @permission @error-handling
    Example: 教練無法調整他人球隊的球員排序
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | coach1 | COACH | ACTIVE |
      And 準備一個使用者, with table:
        | >Coach2.id | name   | role  | status |
        | <coach2Id  | coach2 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy   |
        | <teamId  | 閃電隊   | ACTIVE | $Coach2.id  |
      And 準備一個球員, with table:
        | >Player1.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <player1Id  | $Team.id | 1            | 王小明 | P        | 1         | ACTIVE |
      And 準備一個球員, with table:
        | >Player2.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <player2Id  | $Team.id | 2            | 李小華 | C        | 2         | ACTIVE |
      When (UID="$User.id") 調整球員排序, call table:
        | teamId   | playerIds                     |
        | $Team.id | $Player2.id,$Player1.id       |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 403 |

  # ===== Phase 2: 核心業務 =====

  Rule: 排序調整後立即生效

    @happy-path
    Example: 排序調整後查詢列表應反映新順序
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
        | >Player2.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <player2Id  | $Team.id | 2            | 李小華 | C        | 2         | ACTIVE |
      And 準備一個球員, with table:
        | >Player3.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <player3Id  | $Team.id | 3            | 張大強 | SS       | 3         | ACTIVE |
      When (UID="$User.id") 調整球員排序, call table:
        | teamId   | playerIds                               |
        | $Team.id | $Player3.id,$Player2.id,$Player1.id     |
      Then 回應, with table:
        | statusCode | 200 |
      When (UID="$User.id") 查詢球員列表, call table:
        | teamId   |
        | $Team.id |
      Then 回應為, with JSON:
        """
        {
          "data": [
            { "name": "張大強", "sortOrder": 1 },
            { "name": "李小華", "sortOrder": 2 },
            { "name": "王小明", "sortOrder": 3 }
          ],
          "total": 3
        }
        """

  # ===== Phase 3: 邊界條件 =====

  Rule: 無法調整不存在球隊的排序

    @error-handling
    Example: 調整不存在球隊的排序
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      When (UID="$User.id") 調整球員排序, call table:
        | teamId                               | playerIds                                                              |
        | 00000000-0000-0000-0000-000000000000 | 00000000-0000-0000-0000-000000000001,00000000-0000-0000-0000-000000000002 |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 404 |
