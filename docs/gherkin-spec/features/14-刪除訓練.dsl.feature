# @publishes: 訓練已刪除
Feature: 刪除訓練

  Background:
    Given 系統中有以下使用者：
      | 帳號    | 角色   |
      | admin  | 管理者 |
      | coach1 | 教練   |
    And 系統中有以下球隊：
      | 名稱     | 建立者  |
      | 藍鷹隊   | coach1 |
    And 系統中有以下訓練：
      | 編號  | 日期       | 受測選手 | 建立者  | 狀態   |
      | T001 | 2026-01-26 | 王小明   | coach1 | active |
    And 訓練 "T001" 有以下投球紀錄：
      | 編號 | 球速  | 好壞球 |
      | P001 | 120  | 好球   |
      | P002 | 118  | 壞球   |

  Rule: 刪除訓練採用軟刪除（標記 is_deleted = true）

    Example: 成功刪除訓練
      Given 教練 "coach1" 已登入
      When 教練刪除訓練 "T001"
      Then 操作成功
      And 系統產生 "訓練已刪除" 事件
      And 訓練 "T001" 的狀態為 "deleted"

  Rule: 刪除訓練時連帶軟刪除所有投球數據

    Example: 刪除有投球紀錄的訓練
      Given 教練 "coach1" 已登入
      When 教練刪除訓練 "T001"
      Then 操作成功
      And 訓練 "T001" 的狀態為 "deleted"
      And 投球 "P001" 的狀態為 "deleted"
      And 投球 "P002" 的狀態為 "deleted"

  Rule: 教練只能刪除自己建立的訓練

    Example: 教練刪除自己建立的訓練
      Given 教練 "coach1" 已登入
      When 教練刪除訓練 "T001"
      Then 操作成功

    Example: 教練刪除他人建立的訓練
      Given 系統中有訓練 "T002" 由 "coach2" 建立
      And 教練 "coach1" 已登入
      When 教練刪除訓練 "T002"
      Then 操作失敗
      And 系統顯示 "無權限操作此訓練"

  Rule: 管理者可刪除所有訓練

    Example: 管理者刪除任意訓練
      Given 管理者 "admin" 已登入
      When 管理者刪除訓練 "T001"
      Then 操作成功

  Rule: 已刪除的訓練不可再次刪除

    Example: 重複刪除已刪除的訓練
      Given 訓練 "T001" 已被刪除
      And 管理者 "admin" 已登入
      When 管理者刪除訓練 "T001"
      Then 操作失敗
      And 系統顯示 "訓練不存在或已刪除"
