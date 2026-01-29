# @publishes: 球員已更新
Feature: 編輯球員

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
      | 背號 | 姓名   | 身高  | 守備位置 | 狀態   |
      | 1   | 王小明 | 175  | 投手     | active |
      | 10  | 李大華 | 180  | 捕手     | active |

  Rule: 編輯球員可修改背號、姓名、身高、守備位置

    Example: 成功編輯球員資料
      Given 教練 "coach1" 已登入
      When 教練將球員 "王小明" 的身高修改為 178 公分
      Then 操作成功
      And 系統產生 "球員已更新" 事件

  Rule: 編輯球員時可修改背號，需檢查同隊內唯一性

    Example: 成功修改背號
      Given 教練 "coach1" 已登入
      When 教練將球員 "王小明" 的背號修改為 99
      Then 操作成功

    Example: 修改背號為已存在的號碼
      Given 教練 "coach1" 已登入
      When 教練將球員 "王小明" 的背號修改為 10
      Then 操作失敗
      And 系統顯示 "該背號已被使用"

  Rule: 背號必須為 0-999 的整數

    Example: 修改背號超出範圍
      Given 教練 "coach1" 已登入
      When 教練將球員 "王小明" 的背號修改為 1000
      Then 操作失敗
      And 系統顯示 "背號必須為 0-999"

  Rule: 身高必須為 100-250 公分

    Example: 修改身高超出範圍
      Given 教練 "coach1" 已登入
      When 教練將球員 "王小明" 的身高修改為 300 公分
      Then 操作失敗
      And 系統顯示 "身高必須為 100-250 公分"

  Rule: 守備位置必須為固定選項之一

    # 固定選項：投手、捕手、一壘手、二壘手、三壘手、游擊手、左外野手、中外野手、右外野手、指定打擊

    Example: 修改為無效的守備位置
      Given 教練 "coach1" 已登入
      When 教練將球員 "王小明" 的守備位置修改為 "跑壘員"
      Then 操作失敗
      And 系統顯示 "守備位置無效"

  Rule: 教練只能編輯自己球隊的球員

    Example: 教練編輯自己球隊的球員
      Given 教練 "coach1" 已登入
      When 教練將球員 "王小明" 的身高修改為 178 公分
      Then 操作成功

    Example: 教練編輯他人球隊的球員
      Given 球隊 "紅龍隊" 中有球員 "張三"
      And 教練 "coach1" 已登入
      When 教練將球員 "張三" 的身高修改為 178 公分
      Then 操作失敗
      And 系統顯示 "無權限操作此球員"

  Rule: 管理者可編輯所有球員

    Example: 管理者編輯任意球員
      Given 球隊 "紅龍隊" 中有球員 "張三"
      And 管理者 "admin" 已登入
      When 管理者將球員 "張三" 的身高修改為 178 公分
      Then 操作成功

  Rule: 已刪除的球員不可編輯

    Example: 編輯已刪除的球員
      Given 球員 "王小明" 已被刪除
      And 管理者 "admin" 已登入
      When 管理者將球員 "王小明" 的身高修改為 178 公分
      Then 操作失敗
      And 系統顯示 "球員不存在或已刪除"
