# language: zh-TW
# encoding: UTF-8
# Feature: 刪除球員
# Epic: B - 球隊/球員資料管理
# User Story: US-B3
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# ISA Compatible: Yes
# @publishes: 球員已刪除
# @requires: us-b3-query-player
# Allowed Roles: 管理者, 教練
# Boundary Decisions:
#   - GD-006: 球員軟刪除
#   - GD-007: 查詢時預設過濾已刪除的球員
#   - GD-011: 教練只能操作自己的資源

@epic-b @player @command
Feature: 刪除球員
  身為 管理者/教練
  我想要 刪除球員
  以便 維護正確的球員名單

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可刪除任意球員

    @permission @happy-path
    Example: 管理者刪除球員
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
        | >Player.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <playerId  | $Team.id | 1            | 王小明 | P        | 1         | ACTIVE |
      When (UID="$User.id") 刪除球員, call table:
        | playerId   |
        | $Player.id |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球員, with table:
        | playerId   | status  |
        | $Player.id | DELETED |

  Rule: 教練只能刪除自己球隊的球員

    @permission @happy-path
    Example: 教練刪除自己球隊的球員
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | coach1 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      And 準備一個球員, with table:
        | >Player.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <playerId  | $Team.id | 1            | 王小明 | P        | 1         | ACTIVE |
      When (UID="$User.id") 刪除球員, call table:
        | playerId   |
        | $Player.id |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球員, with table:
        | playerId   | status  |
        | $Player.id | DELETED |

    @permission @error-handling
    Example: 教練無法刪除他人球隊的球員
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
        | >Player.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <playerId  | $Team.id | 1            | 王小明 | P        | 1         | ACTIVE |
      When (UID="$User.id") 刪除球員, call table:
        | playerId   |
        | $Player.id |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 403 |

  # ===== Phase 2: 核心業務 =====

  Rule: 刪除球員採用軟刪除

    @happy-path
    Example: 軟刪除球員
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      And 準備一個球員, with table:
        | >Player.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <playerId  | $Team.id | 1            | 王小明 | P        | 1         | ACTIVE |
      When (UID="$User.id") 刪除球員, call table:
        | playerId   |
        | $Player.id |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球員, with table:
        | playerId   | status  |
        | $Player.id | DELETED |

  # ===== Phase 3: 邊界條件 =====

  Rule: 無法刪除不存在或已刪除的球員

    @error-handling
    Example: 刪除不存在的球員
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      When (UID="$User.id") 刪除球員, call table:
        | playerId                             |
        | 00000000-0000-0000-0000-000000000000 |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 404 |

    @error-handling
    Example: 刪除已刪除的球員
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      And 準備一個球員, with table:
        | >Player.id | teamId   | jerseyNumber | name   | position | sortOrder | status  |
        | <playerId  | $Team.id | 99           | 離隊者 | C        | 1         | DELETED |
      When (UID="$User.id") 刪除球員, call table:
        | playerId   |
        | $Player.id |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 404 |
