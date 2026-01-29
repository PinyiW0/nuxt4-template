# @publishes: 球員已刪除
Feature: 刪除球員

  Background:
    Given 系統中有以下使用者：
      | 帳號    | 角色   |
      | admin  | 管理者 |
      | coach1 | 教練   |
      | coach2 | 教練   |
    And 系統中有以下球隊：
      | 名稱     | 建立者  | 狀態   |
      | 藍鷹隊   | coach1 | active |
      | 紅龍隊   | coach2 | active |
    And 球隊 "藍鷹隊" 中有以下球員：
      | 背號 | 姓名   | 狀態   |
      | 1   | 王小明 | active |
      | 10  | 李大華 | active |

  Rule: 刪除球員採用軟刪除（標記 is_deleted = true）

    Example: 成功刪除球員
      Given 教練 "coach1" 已登入
      When 教練刪除球員 "王小明"
      Then 操作成功
      And 系統產生 "球員已刪除" 事件
      And 球員 "王小明" 的狀態為 "deleted"

  Rule: 刪除球員時保留歷史訓練與投球數據

    Example: 刪除有訓練紀錄的球員
      Given 球員 "王小明" 有 5 筆訓練紀錄
      And 教練 "coach1" 已登入
      When 教練刪除球員 "王小明"
      Then 操作成功
      And 球員 "王小明" 的狀態為 "deleted"
      And 球員 "王小明" 的訓練紀錄保留不變

  Rule: 教練只能刪除自己球隊的球員

    Example: 教練刪除自己球隊的球員
      Given 教練 "coach1" 已登入
      When 教練刪除球員 "王小明"
      Then 操作成功

    Example: 教練刪除他人球隊的球員
      Given 球隊 "紅龍隊" 中有球員 "張三"
      And 教練 "coach1" 已登入
      When 教練刪除球員 "張三"
      Then 操作失敗
      And 系統顯示 "無權限操作此球員"

  Rule: 管理者可刪除所有球員

    Example: 管理者刪除任意球員
      Given 球隊 "紅龍隊" 中有球員 "張三"
      And 管理者 "admin" 已登入
      When 管理者刪除球員 "張三"
      Then 操作成功

  Rule: 已刪除的球員不可再次刪除

    Example: 重複刪除已刪除的球員
      Given 球員 "王小明" 已被刪除
      And 管理者 "admin" 已登入
      When 管理者刪除球員 "王小明"
      Then 操作失敗
      And 系統顯示 "球員不存在或已刪除"
