# @publishes: 球隊已更新
Feature: 編輯球隊

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

  Rule: 編輯球隊時可修改名稱，需檢查全系統唯一性

    Example: 成功編輯球隊名稱
      Given 教練 "coach1" 已登入
      When 教練將球隊 "藍鷹隊" 的名稱修改為 "藍鷹猛禽隊"
      Then 操作成功
      And 系統產生 "球隊已更新" 事件

    Example: 編輯球隊名稱為已存在的名稱
      Given 教練 "coach1" 已登入
      When 教練將球隊 "藍鷹隊" 的名稱修改為 "紅龍隊"
      Then 操作失敗
      And 系統顯示 "球隊名稱已存在"

  Rule: 球隊名稱長度為 1-50 字元

    Example: 編輯球隊名稱為空
      Given 教練 "coach1" 已登入
      When 教練將球隊 "藍鷹隊" 的名稱修改為 ""
      Then 操作失敗
      And 系統顯示 "球隊名稱不可為空"

  Rule: 教練只能編輯自己建立或被指派的球隊

    Example: 教練編輯自己的球隊
      Given 教練 "coach1" 已登入
      When 教練將球隊 "藍鷹隊" 的名稱修改為 "藍鷹猛禽隊"
      Then 操作成功

    Example: 教練編輯他人的球隊
      Given 教練 "coach1" 已登入
      When 教練將球隊 "紅龍隊" 的名稱修改為 "紅龍火焰隊"
      Then 操作失敗
      And 系統顯示 "無權限操作此球隊"

  Rule: 管理者可編輯所有球隊

    Example: 管理者編輯任意球隊
      Given 管理者 "admin" 已登入
      When 管理者將球隊 "紅龍隊" 的名稱修改為 "紅龍火焰隊"
      Then 操作成功

  Rule: 已刪除的球隊不可編輯

    Example: 編輯已刪除的球隊
      Given 球隊 "藍鷹隊" 已被刪除
      And 管理者 "admin" 已登入
      When 管理者將球隊 "藍鷹隊" 的名稱修改為 "藍鷹猛禽隊"
      Then 操作失敗
      And 系統顯示 "球隊不存在或已刪除"
