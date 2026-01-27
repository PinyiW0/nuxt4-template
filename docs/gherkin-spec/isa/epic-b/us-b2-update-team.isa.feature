# language: zh-TW
# encoding: UTF-8
# Feature: 編輯球隊
# Epic: B - 球隊/球員資料管理
# User Story: US-B2
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# ISA Compatible: Yes
# @publishes: 球隊已更新
# @requires: us-b1-select-team
# Allowed Roles: 管理者, 教練
# Boundary Decisions:
#   - GD-005: 球隊名稱不區分大小寫
#   - GD-011: 教練只能操作自己的資源

@epic-b @team @command
Feature: 編輯球隊
  身為 管理者/教練
  我想要 編輯球隊資料
  以便 確保名單正確

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可編輯所有球隊

    @permission @happy-path
    Example: 管理者編輯任意球隊
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個使用者, with table:
        | >Coach1.id | name   | role  | status |
        | <coach1Id  | coach1 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy   |
        | <teamId  | 藍鷹隊   | ACTIVE | $Coach1.id  |
      When (UID="$User.id") 編輯球隊, call table:
        | teamId   | teamName |
        | $Team.id | 蒼鷹隊   |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球隊, with table:
        | teamId   | teamName |
        | $Team.id | 蒼鷹隊   |

  Rule: 教練只能編輯自己建立的球隊

    @permission @happy-path
    Example: 教練編輯自己建立的球隊
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | coach1 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 藍鷹隊   | ACTIVE | $User.id  |
      When (UID="$User.id") 編輯球隊, call table:
        | teamId   | teamName |
        | $Team.id | 蒼鷹隊   |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球隊, with table:
        | teamId   | teamName |
        | $Team.id | 蒼鷹隊   |

    @permission @error-handling
    Example: 教練無法編輯他人建立的球隊
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | coach1 | COACH | ACTIVE |
      And 準備一個使用者, with table:
        | >Coach2.id | name   | role  | status |
        | <coach2Id  | coach2 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy   |
        | <teamId  | 紅龍隊   | ACTIVE | $Coach2.id  |
      When (UID="$User.id") 編輯球隊, call table:
        | teamId   | teamName |
        | $Team.id | 火龍隊   |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 403 |

  # ===== Phase 2: 核心業務 =====

  Rule: 編輯後的名稱不可與其他球隊重複

    @error-handling
    Example: 編輯為已存在的球隊名稱應失敗
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team1.id | teamName | status | createdBy |
        | <team1Id  | 藍鷹隊   | ACTIVE | $User.id  |
      And 準備一個球隊, with table:
        | >Team2.id | teamName | status | createdBy |
        | <team2Id  | 紅龍隊   | ACTIVE | $User.id  |
      When (UID="$User.id") 編輯球隊, call table:
        | teamId    | teamName |
        | $Team1.id | 紅龍隊   |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 409 |

  # ===== Phase 3: 邊界條件 =====

  Rule: 無法編輯不存在或已刪除的球隊

    @error-handling
    Example: 編輯不存在的球隊
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      When (UID="$User.id") 編輯球隊, call table:
        | teamId                               | teamName |
        | 00000000-0000-0000-0000-000000000000 | 新隊名   |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 404 |

    @error-handling
    Example: 編輯已刪除的球隊
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status  | createdBy |
        | <teamId  | 解散隊   | DELETED | $User.id  |
      When (UID="$User.id") 編輯球隊, call table:
        | teamId   | teamName |
        | $Team.id | 新隊名   |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 404 |

  Rule: 新名稱不可為空

    @boundary
    Example: 編輯為空名稱應失敗
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 藍鷹隊   | ACTIVE | $User.id  |
      When (UID="$User.id") 編輯球隊, call table:
        | teamId   | teamName |
        | $Team.id |          |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 400 |
