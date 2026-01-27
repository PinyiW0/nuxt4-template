# Feature: 刪除球員
# @publishes: 球員已刪除

Feature: 刪除球員

  作為 已登入的使用者
  我想要 刪除球員
  以便 移除不需要的球員資料

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
      | player_id | name       | jersey_number | is_deleted |
      | 101       | 王小明     | 1             | false      |
      | 102       | 已刪除球員 | 99            | true       |

  Rule: 管理者可刪除所有球隊的球員

    Example: 管理者刪除球員
      Given 使用者 "admin" 已登入系統
      When 使用者 "admin" 刪除球員 "王小明"
      Then 操作成功
      And 球員 "王小明" 的 is_deleted 為 true
      And 球員 "王小明" 的 deleted_by 為 "admin"
      And 球員 "王小明" 的 deleted_at 已記錄

  Rule: 教練只能刪除自己球隊的球員

    Example: 教練刪除自己球隊的球員
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 刪除球員 "王小明"
      Then 操作成功
      And 球員 "王小明" 的 is_deleted 為 true

    Example: 教練無法刪除他人球隊的球員
      Given 使用者 "coach1" 已登入系統
      And 球隊 "紅龍隊" 有球員 "林小龍"
      When 使用者 "coach1" 刪除球員 "林小龍"
      Then 操作失敗
      And 系統顯示 "無權限刪除此球員"

  Rule: 刪除球員時採用軟刪除機制

    Example: 軟刪除球員
      Given 使用者 "admin" 已登入系統
      And 目前時間為 "2026-01-23T15:00:00"
      When 使用者 "admin" 刪除球員 "王小明"
      Then 操作成功
      And 球員 "王小明" 的 is_deleted 為 true
      And 球員 "王小明" 的 deleted_by 為 "admin"
      And 球員 "王小明" 的 deleted_at 為 "2026-01-23T15:00:00"
      And 球員 "王小明" 的資料仍存在於資料庫中

  Rule: 不可重複刪除已刪除的球員

    Example: 重複刪除已刪除的球員
      Given 使用者 "admin" 已登入系統
      When 使用者 "admin" 刪除球員 "已刪除球員"
      Then 操作失敗
      And 系統顯示 "球員不存在或已刪除"
