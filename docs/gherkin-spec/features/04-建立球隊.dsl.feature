# @publishes: 球隊已建立
Feature: 建立球隊

  Background:
    Given 系統中有以下使用者：
      | 帳號    | 角色   |
      | admin  | 管理者 |
      | coach1 | 教練   |
    And 系統中有以下球隊：
      | 名稱     | 建立者  | 狀態   |
      | 藍鷹隊   | coach1 | active |

  Rule: 建立球隊只需提供名稱

    Example: 成功建立球隊
      Given 教練 "coach1" 已登入
      When 教練建立球隊名稱為 "紅龍隊"
      Then 操作成功
      And 系統產生 "球隊已建立" 事件
      And 球隊 "紅龍隊" 的建立者為 "coach1"

  Rule: 球隊名稱必須全系統唯一

    Example: 建立重複名稱的球隊
      Given 教練 "coach1" 已登入
      When 教練建立球隊名稱為 "藍鷹隊"
      Then 操作失敗
      And 系統顯示 "球隊名稱已存在"

  Rule: 球隊名稱長度為 1-50 字元

    Example: 球隊名稱為空
      Given 教練 "coach1" 已登入
      When 教練建立球隊名稱為 ""
      Then 操作失敗
      And 系統顯示 "球隊名稱不可為空"

  Rule: 教練只能建立自己的球隊，管理者可建立任何球隊

    Example: 教練建立球隊
      Given 教練 "coach1" 已登入
      When 教練建立球隊名稱為 "白虎隊"
      Then 操作成功
      And 球隊 "白虎隊" 的建立者為 "coach1"
