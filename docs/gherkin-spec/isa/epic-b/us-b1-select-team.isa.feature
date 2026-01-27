# language: zh-TW
# encoding: UTF-8
# Feature: 選擇球隊
# Epic: B - 球隊/球員資料管理
# User Story: US-B1
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# ISA Compatible: Yes
# @publishes: 球隊已選擇
# @requires: us-b1-query-team
# Allowed Roles: 管理者, 教練
# Boundary Decisions:
#   - GD-011: 教練只能操作自己的資源

@epic-b @team @command
Feature: 選擇球隊
  身為 管理者/教練
  我想要 選擇球隊
  以便 管理該隊球員

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可選擇任意球隊

    @permission @happy-path
    Example: 管理者選擇球隊
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個使用者, with table:
        | >Coach1.id | name   | role  | status |
        | <coach1Id  | coach1 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy   |
        | <teamId  | 藍鷹隊   | ACTIVE | $Coach1.id  |
      When (UID="$User.id") 選擇球隊, call table:
        | teamId   |
        | $Team.id |
      Then 回應, with table:
        | statusCode | 200 |

  Rule: 教練只能選擇自己建立的球隊

    @permission @happy-path
    Example: 教練選擇自己建立的球隊
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | coach1 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 藍鷹隊   | ACTIVE | $User.id  |
      When (UID="$User.id") 選擇球隊, call table:
        | teamId   |
        | $Team.id |
      Then 回應, with table:
        | statusCode | 200 |

    @permission @error-handling
    Example: 教練無法選擇他人建立的球隊
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | coach1 | COACH | ACTIVE |
      And 準備一個使用者, with table:
        | >Coach2.id | name   | role  | status |
        | <coach2Id  | coach2 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy   |
        | <teamId  | 紅龍隊   | ACTIVE | $Coach2.id  |
      When (UID="$User.id") 選擇球隊, call table:
        | teamId   |
        | $Team.id |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 403 |

  # ===== Phase 3: 邊界條件 =====

  Rule: 無法選擇不存在或已刪除的球隊

    @error-handling
    Example: 選擇不存在的球隊
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      When (UID="$User.id") 選擇球隊, call table:
        | teamId                               |
        | 00000000-0000-0000-0000-000000000000 |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 404 |

    @error-handling
    Example: 選擇已刪除的球隊
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status  | createdBy |
        | <teamId  | 解散隊   | DELETED | $User.id  |
      When (UID="$User.id") 選擇球隊, call table:
        | teamId   |
        | $Team.id |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 404 |
