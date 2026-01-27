# language: zh-TW
# encoding: UTF-8
# Feature: 編輯球員
# Epic: B - 球隊/球員資料管理
# User Story: US-B3
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# ISA Compatible: Yes
# @publishes: 球員已更新
# @requires: us-b3-query-player
# Allowed Roles: 管理者, 教練
# Boundary Decisions:
#   - Q-B001: 背號同一球隊內唯一
#   - Q-B002: 背號範圍 0-99
#   - GD-011: 教練只能操作自己的資源

@epic-b @player @command
Feature: 編輯球員
  身為 管理者/教練
  我想要 編輯球員資料
  以便 維護正確的球員名單

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可編輯任意球員

    @permission @happy-path
    Example: 管理者編輯球員
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
      When (UID="$User.id") 編輯球員, call table:
        | playerId   | jerseyNumber |
        | $Player.id | 10           |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球員, with table:
        | playerId   | jerseyNumber |
        | $Player.id | 10           |

  Rule: 教練只能編輯自己球隊的球員

    @permission @happy-path
    Example: 教練編輯自己球隊的球員
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | coach1 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      And 準備一個球員, with table:
        | >Player.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <playerId  | $Team.id | 1            | 王小明 | P        | 1         | ACTIVE |
      When (UID="$User.id") 編輯球員, call table:
        | playerId   | jerseyNumber |
        | $Player.id | 10           |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球員, with table:
        | playerId   | jerseyNumber |
        | $Player.id | 10           |

    @permission @error-handling
    Example: 教練無法編輯他人球隊的球員
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
      When (UID="$User.id") 編輯球員, call table:
        | playerId   | jerseyNumber |
        | $Player.id | 10           |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 403 |

  # ===== Phase 2: 核心業務 =====

  Rule: 編輯後的背號不可與同隊其他球員重複

    @error-handling
    Example: 編輯為已存在的背號應失敗
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
      When (UID="$User.id") 編輯球員, call table:
        | playerId    | jerseyNumber |
        | $Player1.id | 2            |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 409 |

    @happy-path
    Example: 編輯為自己原本的背號應成功
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      And 準備一個球員, with table:
        | >Player.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <playerId  | $Team.id | 1            | 王小明 | P        | 1         | ACTIVE |
      When (UID="$User.id") 編輯球員, call table:
        | playerId   | jerseyNumber |
        | $Player.id | 1            |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球員, with table:
        | playerId   | jerseyNumber |
        | $Player.id | 1            |

  # ===== Phase 3: 邊界條件 =====

  Rule: 無法編輯不存在或已刪除的球員

    @error-handling
    Example: 編輯不存在的球員
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      When (UID="$User.id") 編輯球員, call table:
        | playerId                             | jerseyNumber |
        | 00000000-0000-0000-0000-000000000000 | 10           |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 404 |

    @error-handling
    Example: 編輯已刪除的球員
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      And 準備一個球員, with table:
        | >Player.id | teamId   | jerseyNumber | name   | position | sortOrder | status  |
        | <playerId  | $Team.id | 99           | 離隊者 | C        | 1         | DELETED |
      When (UID="$User.id") 編輯球員, call table:
        | playerId   | jerseyNumber |
        | $Player.id | 10           |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 404 |

  Rule: 背號範圍為 0-99

    @boundary @error-handling
    Example: 編輯背號超過範圍應失敗
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      And 準備一個球員, with table:
        | >Player.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <playerId  | $Team.id | 1            | 王小明 | P        | 1         | ACTIVE |
      When (UID="$User.id") 編輯球員, call table:
        | playerId   | jerseyNumber |
        | $Player.id | 100          |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 400 |
