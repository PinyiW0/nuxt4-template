Feature: 查詢球隊列表

  Background:
    Given 系統中有以下使用者：
      | account | role   | status |
      | admin   | 管理者 | active |
      | coach1  | 教練   | active |
      | coach2  | 教練   | active |
    And 系統中有以下球隊：
      | id | name     | created_by | player_count | created_at          | status  |
      | 1  | 藍鷹隊   | coach1     | 15           | 2026-01-01T10:00:00 | active  |
      | 2  | 紅龍隊   | coach1     | 12           | 2026-01-05T10:00:00 | active  |
      | 3  | 白虎隊   | coach2     | 10           | 2026-01-10T10:00:00 | active  |
      | 4  | 黑豹隊   | admin      | 8            | 2026-01-15T10:00:00 | deleted |

  Rule: 教練只能查詢自己建立的球隊

    Example: 教練查詢球隊列表
      Given 教練 "coach1" 已登入
      When 教練查詢球隊列表
      Then 操作成功
      And 回傳以下球隊：
        | id | name   | player_count | created_at          | created_by |
        | 2  | 紅龍隊 | 12           | 2026-01-05T10:00:00 | coach1     |
        | 1  | 藍鷹隊 | 15           | 2026-01-01T10:00:00 | coach1     |

  Rule: 管理者可查詢所有球隊

    Example: 管理者查詢球隊列表
      Given 管理者 "admin" 已登入
      When 管理者查詢球隊列表
      Then 操作成功
      And 回傳所有 active 狀態的球隊（共 3 筆）

  Rule: 列表依建立時間倒序排列（最新在前）

    Example: 球隊列表排序
      Given 教練 "coach1" 已登入
      When 教練查詢球隊列表
      Then 第一筆為 "紅龍隊"（較新建立）
      And 第二筆為 "藍鷹隊"（較早建立）

  Rule: 列表回傳欄位包含 ID、名稱、球員數量、建立時間、建立者

    Example: 確認回傳欄位
      Given 教練 "coach1" 已登入
      When 教練查詢球隊列表
      Then 每筆資料包含以下欄位：
        | field        | description |
        | id           | 球隊 ID     |
        | name         | 球隊名稱    |
        | player_count | 球員數量    |
        | created_at   | 建立時間    |
        | created_by   | 建立者名稱  |

  Rule: 支援分頁查詢，預設每頁 20 筆，可選 10/20/50 筆

    Example: 使用預設分頁
      Given 教練 "coach1" 已登入
      When 教練查詢球隊列表（未指定分頁參數）
      Then 回傳第 1 頁
      And 每頁筆數為 20

    Example: 指定每頁筆數
      Given 管理者 "admin" 已登入
      When 管理者查詢球隊列表，每頁 10 筆
      Then 每頁筆數為 10

  Rule: 已刪除的球隊不顯示在列表中

    Example: 列表不包含已刪除球隊
      Given 管理者 "admin" 已登入
      When 管理者查詢球隊列表
      Then 結果不包含 "黑豹隊"（已刪除）
