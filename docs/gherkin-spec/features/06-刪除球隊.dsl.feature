# @publishes: 球隊已刪除
Feature: 刪除球隊

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
      | 背號 | 姓名   |
      | 1   | 王小明 |
      | 10  | 李大華 |

  Rule: 刪除球隊採用軟刪除（標記 is_deleted = true）

    Example: 成功刪除球隊
      Given 教練 "coach1" 已登入
      When 教練刪除球隊 "藍鷹隊"
      Then 操作成功
      And 系統產生 "球隊已刪除" 事件
      And 球隊 "藍鷹隊" 的狀態為 "deleted"

  Rule: 刪除球隊時連帶軟刪除所有關聯球員

    Example: 刪除有球員的球隊
      Given 教練 "coach1" 已登入
      When 教練刪除球隊 "藍鷹隊"
      Then 操作成功
      And 球隊 "藍鷹隊" 的狀態為 "deleted"
      And 球員 "王小明" 的狀態為 "deleted"
      And 球員 "李大華" 的狀態為 "deleted"

  Rule: 教練只能刪除自己建立或被指派的球隊

    Example: 教練刪除自己的球隊
      Given 教練 "coach1" 已登入
      When 教練刪除球隊 "藍鷹隊"
      Then 操作成功

    Example: 教練刪除他人的球隊
      Given 教練 "coach1" 已登入
      When 教練刪除球隊 "紅龍隊"
      Then 操作失敗
      And 系統顯示 "無權限操作此球隊"

  Rule: 管理者可刪除所有球隊

    Example: 管理者刪除任意球隊
      Given 管理者 "admin" 已登入
      When 管理者刪除球隊 "紅龍隊"
      Then 操作成功

  Rule: 已刪除的球隊不可再次刪除

    Example: 重複刪除已刪除的球隊
      Given 球隊 "藍鷹隊" 已被刪除
      And 管理者 "admin" 已登入
      When 管理者刪除球隊 "藍鷹隊"
      Then 操作失敗
      And 系統顯示 "球隊不存在或已刪除"
