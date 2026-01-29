# @publishes: 訓練已批次刪除
Feature: 批次刪除訓練

  Background:
    Given 系統中有以下使用者：
      | 帳號    | 角色   |
      | admin  | 管理者 |
      | coach1 | 教練   |
    And 系統中有以下訓練：
      | 編號  | 日期       | 受測選手 | 建立者  | 狀態   |
      | T001 | 2026-01-20 | 王小明   | coach1 | active |
      | T002 | 2026-01-21 | 王小明   | coach1 | active |
      | T003 | 2026-01-22 | 李大華   | coach1 | active |

  Rule: 批次刪除訓練採用軟刪除

    Example: 成功批次刪除訓練
      Given 教練 "coach1" 已登入
      When 教練批次刪除訓練 "T001", "T002"
      Then 操作成功
      And 系統產生 "訓練已批次刪除" 事件
      And 訓練 "T001" 的狀態為 "deleted"
      And 訓練 "T002" 的狀態為 "deleted"

  Rule: 批次刪除訓練時連帶軟刪除所有投球數據

    Example: 批次刪除有投球數據的訓練
      Given 訓練 "T001" 有 10 筆投球紀錄
      And 訓練 "T002" 有 5 筆投球紀錄
      And 教練 "coach1" 已登入
      When 教練批次刪除訓練 "T001", "T002"
      Then 操作成功
      And 訓練 "T001" 的所有投球紀錄狀態為 "deleted"
      And 訓練 "T002" 的所有投球紀錄狀態為 "deleted"

  Rule: 批次刪除需要二次確認

    Example: 批次刪除前需確認
      Given 教練 "coach1" 已登入
      When 教練選擇批次刪除訓練 "T001", "T002"
      Then 系統顯示確認對話框 "確定要刪除 2 筆訓練紀錄？"

  Rule: 教練只能批次刪除自己建立的訓練

    Example: 教練批次刪除自己的訓練
      Given 教練 "coach1" 已登入
      When 教練批次刪除訓練 "T001", "T002"
      Then 操作成功

    Example: 教練批次刪除包含他人訓練
      Given 系統中有訓練 "T004" 由 "coach2" 建立
      And 教練 "coach1" 已登入
      When 教練批次刪除訓練 "T001", "T004"
      Then 操作失敗
      And 系統顯示 "包含無權限操作的訓練"

  Rule: 管理者可批次刪除所有訓練

    Example: 管理者批次刪除任意訓練
      Given 系統中有訓練 "T004" 由 "coach2" 建立
      And 管理者 "admin" 已登入
      When 管理者批次刪除訓練 "T001", "T004"
      Then 操作成功
