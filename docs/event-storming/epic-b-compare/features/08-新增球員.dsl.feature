# Feature: 新增球員
# @publishes: 球員已新增

Feature: 新增球員

  作為 已登入的使用者
  我想要 新增球員到球隊
  以便 建立球員資料

  Background:
    Given 系統中有以下使用者:
      | account | password | role   |
      | admin   | Admin123 | 管理者 |
      | coach1  | Coach123 | 教練   |
      | coach2  | Coach456 | 教練   |
    And 系統中有以下球隊:
      | team_id | name     | created_by | is_deleted |
      | 1       | 藍鷹隊   | coach1     | false      |
      | 2       | 紅龍隊   | coach2     | false      |
    And 球隊 "藍鷹隊" 有以下球員:
      | player_id | name   | jersey_number | height | position | sort_order |
      | 101       | 王小明 | 1             | 175    | P        | 1          |
      | 102       | 李小華 | 10            | 180    | C        | 2          |

  Rule: 管理者可在所有球隊新增球員

    Example: 管理者新增球員
      Given 使用者 "admin" 已登入系統
      When 使用者 "admin" 在球隊 "藍鷹隊" 新增球員:
        | name   | jersey_number | height | position |
        | 陳志明 | 25            | 178    | SS       |
      Then 操作成功
      And 球員 "陳志明" 已新增到球隊 "藍鷹隊"

  Rule: 教練只能在自己建立的球隊新增球員

    Example: 教練在自己球隊新增球員
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 在球隊 "藍鷹隊" 新增球員:
        | name   | jersey_number | height | position |
        | 陳志明 | 25            | 178    | SS       |
      Then 操作成功
      And 球員 "陳志明" 已新增到球隊 "藍鷹隊"

    Example: 教練無法在他人球隊新增球員
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 在球隊 "紅龍隊" 新增球員:
        | name   | jersey_number | height | position |
        | 陳志明 | 25            | 178    | SS       |
      Then 操作失敗
      And 系統顯示 "無權限操作此球隊"

  Rule: 背號必須在 0-99 範圍內

    Example: 背號超出範圍
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 在球隊 "藍鷹隊" 新增球員:
        | name   | jersey_number | height | position |
        | 陳志明 | 100           | 178    | SS       |
      Then 操作失敗
      And 系統顯示 "背號必須在 0-99 之間"

    Example: 背號為 0 是允許的
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 在球隊 "藍鷹隊" 新增球員:
        | name   | jersey_number | height | position |
        | 陳志明 | 0             | 178    | SS       |
      Then 操作成功
      And 球員 "陳志明" 的背號為 0

  Rule: 同一球隊內背號不可重複

    Example: 新增重複背號的球員
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 在球隊 "藍鷹隊" 新增球員:
        | name   | jersey_number | height | position |
        | 陳志明 | 1             | 178    | SS       |
      Then 操作失敗
      And 系統顯示 "背號已被使用"

  Rule: 身高必須在 100-220 公分範圍內（整數）

    Example: 身高超出範圍
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 在球隊 "藍鷹隊" 新增球員:
        | name   | jersey_number | height | position |
        | 陳志明 | 25            | 250    | SS       |
      Then 操作失敗
      And 系統顯示 "身高必須在 100-220 公分之間"

    Example: 身高低於最小值
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 在球隊 "藍鷹隊" 新增球員:
        | name   | jersey_number | height | position |
        | 陳志明 | 25            | 90     | SS       |
      Then 操作失敗
      And 系統顯示 "身高必須在 100-220 公分之間"

  Rule: 守備位置必須是有效值（P, C, 1B, 2B, 3B, SS, LF, CF, RF, DH）

    Example: 新增有效守備位置的球員
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 在球隊 "藍鷹隊" 新增球員:
        | name   | jersey_number | height | position |
        | 陳志明 | 25            | 178    | DH       |
      Then 操作成功
      And 球員 "陳志明" 的守備位置為 "DH"

    Example: 新增無效守備位置的球員
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 在球隊 "藍鷹隊" 新增球員:
        | name   | jersey_number | height | position |
        | 陳志明 | 25            | 178    | XX       |
      Then 操作失敗
      And 系統顯示 "守備位置無效"

  Rule: 新增球員時自動排在列表最後

    Example: 新球員的 sort_order 為最大值加一
      Given 使用者 "coach1" 已登入系統
      And 球隊 "藍鷹隊" 目前最大的 sort_order 為 2
      When 使用者 "coach1" 在球隊 "藍鷹隊" 新增球員:
        | name   | jersey_number | height | position |
        | 陳志明 | 25            | 178    | SS       |
      Then 操作成功
      And 球員 "陳志明" 的 sort_order 為 3

  Rule: 姓名、背號、身高、守備位置皆為必填

    Example: 缺少姓名
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 在球隊 "藍鷹隊" 新增球員:
        | name | jersey_number | height | position |
        |      | 25            | 178    | SS       |
      Then 操作失敗
      And 系統顯示 "姓名為必填"

    Example: 缺少守備位置
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 在球隊 "藍鷹隊" 新增球員:
        | name   | jersey_number | height | position |
        | 陳志明 | 25            | 178    |          |
      Then 操作失敗
      And 系統顯示 "守備位置為必填"
