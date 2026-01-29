# @publishes: 訓練已建立
Feature: 建立訓練

  Background:
    Given 系統中有以下使用者：
      | 帳號    | 角色   |
      | coach1 | 教練   |
    And 系統中有以下球隊：
      | 名稱     | 建立者  | 狀態   |
      | 藍鷹隊   | coach1 | active |
    And 球隊 "藍鷹隊" 中有以下球員：
      | 背號 | 姓名   | 身高  |
      | 1   | 王小明 | 175  |
      | 10  | 李大華 | 180  |

  Rule: 每次訓練只能指定一名受測選手

    Example: 成功建立訓練
      Given 教練 "coach1" 已登入
      When 教練建立訓練：
        | 日期       | 受測選手 |
        | 2026-01-26 | 王小明   |
      Then 操作成功
      And 系統產生 "訓練已建立" 事件

    Example: 嘗試指定多名受測選手
      Given 教練 "coach1" 已登入
      When 教練建立訓練並指定多名受測選手
      Then 操作失敗
      And 系統顯示 "每次訓練只能指定一名受測選手"

  Rule: 建立訓練時好球帶身高預設帶入受測選手身高，可手動調整

    Example: 好球帶身高預設帶入
      Given 教練 "coach1" 已登入
      When 教練建立訓練並選擇受測選手 "王小明"
      Then 操作成功
      And 訓練的好球帶身高預設為 175 公分

    Example: 手動調整好球帶身高
      Given 教練 "coach1" 已登入
      When 教練建立訓練並選擇受測選手 "王小明"，並將好球帶身高調整為 170 公分
      Then 操作成功
      And 訓練的好球帶身高為 170 公分

  Rule: 教練只能為自己球隊的球員建立訓練

    Example: 教練為自己球隊的球員建立訓練
      Given 教練 "coach1" 已登入
      When 教練為球員 "王小明" 建立訓練
      Then 操作成功

    Example: 教練為他人球隊的球員建立訓練
      Given 系統中有球隊 "紅龍隊" 由 "coach2" 建立
      And 球隊 "紅龍隊" 中有球員 "張三"
      And 教練 "coach1" 已登入
      When 教練為球員 "張三" 建立訓練
      Then 操作失敗
      And 系統顯示 "無權限操作此球員"
