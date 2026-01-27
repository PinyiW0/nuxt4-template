# language: zh-TW
# encoding: UTF-8
# Feature: 刪除球隊
# Epic: B - 球隊/球員資料管理
# User Story: US-B2
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# ISA Compatible: Yes
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

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可刪除所有球隊

    @permission @happy-path
    Example: 管理者刪除任意球隊
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個使用者, with table:
        | >Coach1.id | name   | role  | status |
        | <coach1Id  | coach1 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy  |
        | <teamId  | 藍鷹隊   | ACTIVE | $Coach1.id |
      When (UID="$User.id") 刪除球隊, call table:
        | teamId   |
        | $Team.id |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球隊, with table:
        | teamId   | status  | deletedBy | deletedAt |
        | $Team.id | DELETED | $User.id  | $notnull  |

  Rule: 教練只能刪除自己建立的球隊

    @permission @happy-path
    Example: 教練刪除自己建立的球隊
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | coach1 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 藍鷹隊   | ACTIVE | $User.id  |
      When (UID="$User.id") 刪除球隊, call table:
        | teamId   |
        | $Team.id |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球隊, with table:
        | teamId   | status  |
        | $Team.id | DELETED |

    @permission @error-handling
    Example: 教練無法刪除他人建立的球隊
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | coach1 | COACH | ACTIVE |
      And 準備一個使用者, with table:
        | >Coach2.id | name   | role  | status |
        | <coach2Id  | coach2 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy  |
        | <teamId  | 紅龍隊   | ACTIVE | $Coach2.id |
      When (UID="$User.id") 刪除球隊, call table:
        | teamId   |
        | $Team.id |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 403 |

  # ===== Phase 2: 核心業務 =====

  Rule: 刪除球隊採用軟刪除

    @happy-path
    Example: 軟刪除球隊保留歷史紀錄
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | coach1 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 藍鷹隊   | ACTIVE | $User.id  |
      When (UID="$User.id") 刪除球隊, call table:
        | teamId   |
        | $Team.id |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球隊, with table:
        | teamId   | status  | deletedAt |
        | $Team.id | DELETED | $notnull  |

  Rule: 刪除有球員的球隊時需要確認級聯刪除

    @happy-path
    Example: 確認後刪除球隊並級聯刪除球員
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 藍鷹隊   | ACTIVE | $User.id  |
      And 準備一個球員, with table:
        | >Player1.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <player1Id  | $Team.id | 1            | 王小明 | P        | 1         | ACTIVE |
      And 準備一個球員, with table:
        | >Player2.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <player2Id  | $Team.id | 2            | 李小華 | C        | 2         | ACTIVE |
      When (UID="$User.id") 請求刪除球隊, call table:
        | teamId   |
        | $Team.id |
      Then 回應, with table:
        | statusCode       | 200                                              |
        | confirmRequired  | true                                             |
        | confirmMessage   | 確定要刪除球隊「藍鷹隊」嗎？這將同時刪除 2 名球員 |
        | affectedPlayers  | 2                                                |
      When (UID="$User.id") 確認刪除球隊, call table:
        | teamId   | confirmed |
        | $Team.id | true      |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球隊, with table:
        | teamId   | status  |
        | $Team.id | DELETED |
      And 應該存在一個球員, with table:
        | playerId    | status  |
        | $Player1.id | DELETED |
      And 應該存在一個球員, with table:
        | playerId    | status  |
        | $Player2.id | DELETED |

    @happy-path
    Example: 取消刪除操作
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 藍鷹隊   | ACTIVE | $User.id  |
      And 準備一個球員, with table:
        | >Player1.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <player1Id  | $Team.id | 1            | 王小明 | P        | 1         | ACTIVE |
      When (UID="$User.id") 請求刪除球隊, call table:
        | teamId   |
        | $Team.id |
      Then 回應, with table:
        | statusCode      | 200  |
        | confirmRequired | true |
      When (UID="$User.id") 確認刪除球隊, call table:
        | teamId   | confirmed |
        | $Team.id | false     |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球隊, with table:
        | teamId   | status |
        | $Team.id | ACTIVE |
      And 應該存在一個球員, with table:
        | playerId    | status |
        | $Player1.id | ACTIVE |

  Rule: 無球員的球隊可直接刪除

    @happy-path
    Example: 刪除無球員的球隊不需確認
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 新球隊   | ACTIVE | $User.id  |
      When (UID="$User.id") 刪除球隊, call table:
        | teamId   |
        | $Team.id |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球隊, with table:
        | teamId   | status  |
        | $Team.id | DELETED |

  # ===== Phase 3: 邊界條件 =====

  Rule: 無法刪除不存在的球隊

    @error-handling
    Example: 刪除不存在的球隊
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      When (UID="$User.id") 刪除球隊, call table:
        | teamId                               |
        | 00000000-0000-0000-0000-000000000000 |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 404 |

  Rule: 無法刪除已刪除的球隊

    @error-handling
    Example: 重複刪除球隊應失敗
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status  | createdBy |
        | <teamId  | 解散隊   | DELETED | $User.id  |
      When (UID="$User.id") 刪除球隊, call table:
        | teamId   |
        | $Team.id |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 404 |
