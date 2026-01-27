# language: zh-TW
# encoding: UTF-8
# Feature: 建立球隊
# Epic: B - 球隊/球員資料管理
# User Story: US-B2
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# ISA Compatible: Yes
# @publishes: 球隊已建立
# Allowed Roles: 管理者, 教練
# Boundary Decisions:
#   - GD-005: 球隊名稱不區分大小寫

@epic-b @team @command
Feature: 建立球隊
  身為 管理者/教練
  我想要 建立新球隊
  以便 管理球員名單

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者與教練皆可建立球隊

    @permission @happy-path
    Example: 管理者建立球隊
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      When (UID="$User.id") 建立球隊, call table:
        | teamName |
        | 閃電隊   |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球隊, with table:
        | teamName | status | createdBy |
        | 閃電隊   | ACTIVE | $User.id  |

    @permission @happy-path
    Example: 教練建立球隊
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | coach1 | COACH | ACTIVE |
      When (UID="$User.id") 建立球隊, call table:
        | teamName |
        | 閃電隊   |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球隊, with table:
        | teamName | status | createdBy |
        | 閃電隊   | ACTIVE | $User.id  |

  # ===== Phase 2: 核心業務 =====

  Rule: 球隊名稱必須唯一（不區分大小寫）

    @happy-path
    Example: 成功建立球隊
      Given 準備一個使用者, with table:
        | >User.id | name | role  | status |
        | <userId  | 教練 | COACH | ACTIVE |
      When (UID="$User.id") 建立球隊, call table:
        | teamName |
        | 閃電隊   |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球隊, with table:
        | teamName | status |
        | 閃電隊   | ACTIVE |

    @error-handling
    Example: 建立重複名稱的球隊應失敗
      Given 準備一個使用者, with table:
        | >User.id | name | role  | status |
        | <userId  | 教練 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      When (UID="$User.id") 建立球隊, call table:
        | teamName |
        | 閃電隊   |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 409 |

    @error-handling
    Example: 建立僅大小寫不同的球隊名稱應失敗
      Given 準備一個使用者, with table:
        | >User.id | name | role  | status |
        | <userId  | 教練 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | TeamA    | ACTIVE | $User.id  |
      When (UID="$User.id") 建立球隊, call table:
        | teamName |
        | teama    |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 409 |

  # ===== Phase 3: 邊界條件 =====

  Rule: 球隊名稱不可為空

    @boundary
    Example: 球隊名稱為空應失敗
      Given 準備一個使用者, with table:
        | >User.id | name | role  | status |
        | <userId  | 教練 | COACH | ACTIVE |
      When (UID="$User.id") 建立球隊, call table:
        | teamName |
        |          |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 400 |

    @boundary
    Example: 球隊名稱為純空白應失敗
      Given 準備一個使用者, with table:
        | >User.id | name | role  | status |
        | <userId  | 教練 | COACH | ACTIVE |
      When (UID="$User.id") 建立球隊, call table:
        | teamName |
        |          |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 400 |
