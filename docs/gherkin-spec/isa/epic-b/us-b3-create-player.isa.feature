# language: zh-TW
# encoding: UTF-8
# Feature: 新增球員
# Epic: B - 球隊/球員資料管理
# User Story: US-B3
# Source: docs/user-stories/user-v1.md
# Generated: 2026-01-27
# ISA Compatible: Yes
# @publishes: 球員已建立
# @requires: us-b1-select-team
# Allowed Roles: 管理者, 教練
# Boundary Decisions:
#   - Q-B001: 背號同一球隊內唯一
#   - Q-B002: 背號範圍 0-99
#   - Q-B003: 新球員預設排在最後
#   - GD-011: 教練只能操作自己的資源

@epic-b @player @command
Feature: 新增球員
  身為 管理者/教練
  我想要 新增球員到球隊
  以便 維護球員名單

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可對任意球隊新增球員

    @permission @happy-path
    Example: 管理者新增球員
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個使用者, with table:
        | >Coach1.id | name   | role  | status |
        | <coach1Id  | coach1 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy   |
        | <teamId  | 閃電隊   | ACTIVE | $Coach1.id  |
      When (UID="$User.id") 新增球員, call table:
        | teamId   | name   | jerseyNumber | position | sortOrder |
        | $Team.id | 王小明 | 1            | P        | 1         |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球員, with table:
        | teamId   | name   | jerseyNumber | status |
        | $Team.id | 王小明 | 1            | ACTIVE |

  Rule: 教練只能對自己的球隊新增球員

    @permission @happy-path
    Example: 教練新增球員到自己的球隊
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | coach1 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      When (UID="$User.id") 新增球員, call table:
        | teamId   | name   | jerseyNumber | position | sortOrder |
        | $Team.id | 王小明 | 1            | P        | 1         |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球員, with table:
        | teamId   | name   | jerseyNumber | status |
        | $Team.id | 王小明 | 1            | ACTIVE |

    @permission @error-handling
    Example: 教練無法對他人球隊新增球員
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | coach1 | COACH | ACTIVE |
      And 準備一個使用者, with table:
        | >Coach2.id | name   | role  | status |
        | <coach2Id  | coach2 | COACH | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy   |
        | <teamId  | 閃電隊   | ACTIVE | $Coach2.id  |
      When (UID="$User.id") 新增球員, call table:
        | teamId   | name   | jerseyNumber | position | sortOrder |
        | $Team.id | 王小明 | 1            | P        | 1         |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 403 |

  # ===== Phase 2: 核心業務 =====

  Rule: 背號在同一球隊內必須唯一

    @happy-path
    Example: 成功新增球員
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      When (UID="$User.id") 新增球員, call table:
        | teamId   | name   | jerseyNumber | position | sortOrder |
        | $Team.id | 王小明 | 1            | P        | 1         |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球員, with table:
        | teamId   | name   | jerseyNumber | status |
        | $Team.id | 王小明 | 1            | ACTIVE |

    @error-handling
    Example: 新增重複背號的球員應失敗
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      And 準備一個球員, with table:
        | >Player.id | teamId   | jerseyNumber | name   | position | sortOrder | status |
        | <playerId  | $Team.id | 1            | 王小明 | P        | 1         | ACTIVE |
      When (UID="$User.id") 新增球員, call table:
        | teamId   | name   | jerseyNumber | position | sortOrder |
        | $Team.id | 李小華 | 1            | C        | 2         |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 409 |

    @happy-path
    Example: 不同球隊可使用相同背號
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team1.id | teamName | status | createdBy |
        | <team1Id  | 閃電隊   | ACTIVE | $User.id  |
      And 準備一個球隊, with table:
        | >Team2.id | teamName | status | createdBy |
        | <team2Id  | 勇士隊   | ACTIVE | $User.id  |
      And 準備一個球員, with table:
        | >Player.id | teamId    | jerseyNumber | name   | position | sortOrder | status |
        | <playerId  | $Team1.id | 1            | 王小明 | P        | 1         | ACTIVE |
      When (UID="$User.id") 新增球員, call table:
        | teamId    | name   | jerseyNumber | position | sortOrder |
        | $Team2.id | 張大華 | 1            | C        | 1         |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球員, with table:
        | teamId    | name   | jerseyNumber | status |
        | $Team2.id | 張大華 | 1            | ACTIVE |

  Rule: 背號範圍為 0-99

    @boundary
    Example: 背號為 0 應成功
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      When (UID="$User.id") 新增球員, call table:
        | teamId   | name   | jerseyNumber | position | sortOrder |
        | $Team.id | 王小明 | 0            | P        | 1         |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球員, with table:
        | teamId   | name   | jerseyNumber |
        | $Team.id | 王小明 | 0            |

    @boundary
    Example: 背號為 99 應成功
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      When (UID="$User.id") 新增球員, call table:
        | teamId   | name   | jerseyNumber | position | sortOrder |
        | $Team.id | 王小明 | 99           | P        | 1         |
      Then 回應, with table:
        | statusCode | 200 |
      And 應該存在一個球員, with table:
        | teamId   | name   | jerseyNumber |
        | $Team.id | 王小明 | 99           |

    @boundary @error-handling
    Example: 背號超過 99 應失敗
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      When (UID="$User.id") 新增球員, call table:
        | teamId   | name   | jerseyNumber | position | sortOrder |
        | $Team.id | 王小明 | 100          | P        | 1         |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 400 |

    @boundary @error-handling
    Example: 背號為負數應失敗
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      When (UID="$User.id") 新增球員, call table:
        | teamId   | name   | jerseyNumber | position | sortOrder |
        | $Team.id | 王小明 | -1           | P        | 1         |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 400 |

  # ===== Phase 3: 邊界條件 =====

  Rule: 必填欄位不可為空

    @boundary @error-handling
    Example: 姓名為空應失敗
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      When (UID="$User.id") 新增球員, call table:
        | teamId   | name | jerseyNumber | position | sortOrder |
        | $Team.id |      | 1            | P        | 1         |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 400 |

    @boundary @error-handling
    Example: 未指定排序應失敗
      Given 準備一個使用者, with table:
        | >User.id | name   | role  | status |
        | <userId  | 管理者 | ADMIN | ACTIVE |
      And 準備一個球隊, with table:
        | >Team.id | teamName | status | createdBy |
        | <teamId  | 閃電隊   | ACTIVE | $User.id  |
      When (UID="$User.id") 新增球員, call table:
        | teamId   | name   | jerseyNumber | position |
        | $Team.id | 王小明 | 1            | P        |
      Then 操作失敗
      And 回應, with table:
        | statusCode | 400 |
