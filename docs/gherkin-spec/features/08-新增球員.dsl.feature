# @publishes: 球員已新增
Feature: 新增球員

  Background:
    Given 系統中有以下使用者：
      | 帳號    | 角色   |
      | coach1 | 教練   |
    And 系統中有以下球隊：
      | 名稱     | 建立者  | 狀態   |
      | 藍鷹隊   | coach1 | active |
    And 球隊 "藍鷹隊" 中有以下球員：
      | 背號 | 姓名   | 身高  | 守備位置 |
      | 1   | 王小明 | 175  | 投手     |

  Rule: 新增球員需提供背號、姓名、身高、守備位置

    Example: 成功新增球員
      Given 教練 "coach1" 已登入
      When 教練在 "藍鷹隊" 新增球員：
        | 背號 | 姓名   | 身高  | 守備位置 |
        | 10  | 李大華 | 180  | 捕手     |
      Then 操作成功
      And 系統產生 "球員已新增" 事件

  Rule: 背號必須為 0-999 的整數

    Example: 背號超出範圍
      Given 教練 "coach1" 已登入
      When 教練在 "藍鷹隊" 新增球員背號為 1000
      Then 操作失敗
      And 系統顯示 "背號必須為 0-999"

    Example: 背號為負數
      Given 教練 "coach1" 已登入
      When 教練在 "藍鷹隊" 新增球員背號為 -1
      Then 操作失敗
      And 系統顯示 "背號必須為 0-999"

  Rule: 同球隊內背號必須唯一

    Example: 新增重複背號的球員
      Given 教練 "coach1" 已登入
      When 教練在 "藍鷹隊" 新增球員背號為 1
      Then 操作失敗
      And 系統顯示 "該背號已被使用"

    Example: 不同球隊可使用相同背號
      Given 系統中有球隊 "紅龍隊" 由 "coach1" 建立
      And 教練 "coach1" 已登入
      When 教練在 "紅龍隊" 新增球員背號為 1
      Then 操作成功

  Rule: 身高必須為 100-250 公分

    Example: 身高低於下限
      Given 教練 "coach1" 已登入
      When 教練在 "藍鷹隊" 新增球員身高為 99 公分
      Then 操作失敗
      And 系統顯示 "身高必須為 100-250 公分"

    Example: 身高超出上限
      Given 教練 "coach1" 已登入
      When 教練在 "藍鷹隊" 新增球員身高為 251 公分
      Then 操作失敗
      And 系統顯示 "身高必須為 100-250 公分"

  Rule: 守備位置必須為固定選項之一

    # 固定選項：投手、捕手、一壘手、二壘手、三壘手、游擊手、左外野手、中外野手、右外野手、指定打擊

    Example: 使用有效的守備位置
      Given 教練 "coach1" 已登入
      When 教練在 "藍鷹隊" 新增球員守備位置為 "游擊手"
      Then 操作成功

    Example: 使用無效的守備位置
      Given 教練 "coach1" 已登入
      When 教練在 "藍鷹隊" 新增球員守備位置為 "跑壘員"
      Then 操作失敗
      And 系統顯示 "守備位置無效"

  Rule: 球員姓名長度為 1-50 字元

    Example: 球員姓名為空
      Given 教練 "coach1" 已登入
      When 教練在 "藍鷹隊" 新增球員姓名為 ""
      Then 操作失敗
      And 系統顯示 "球員姓名不可為空"

  Rule: 教練只能在自己的球隊中新增球員

    Example: 教練在自己的球隊新增球員
      Given 教練 "coach1" 已登入
      When 教練在 "藍鷹隊" 新增球員
      Then 操作成功

    Example: 教練在他人的球隊新增球員
      Given 系統中有球隊 "紅龍隊" 由 "coach2" 建立
      And 教練 "coach1" 已登入
      When 教練在 "紅龍隊" 新增球員
      Then 操作失敗
      And 系統顯示 "無權限操作此球隊"
