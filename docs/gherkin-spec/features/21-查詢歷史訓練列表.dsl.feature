Feature: 查詢歷史訓練列表

  Background:
    Given 系統中有以下使用者：
      | account | role   | status |
      | admin   | 管理者 | active |
      | coach1  | 教練   | active |
      | coach2  | 教練   | active |
    And 系統中有以下球隊：
      | id | name   | created_by | status |
      | 1  | 藍鷹隊 | coach1     | active |
      | 2  | 紅龍隊 | coach2     | active |
    And 系統中有以下球員：
      | id | name   | team_id | status |
      | 1  | 王小明 | 1       | active |
      | 2  | 李大華 | 2       | active |
    And 系統中有以下訓練：
      | id | date       | player_id | team_id | pitch_count | ai_status | created_by | created_at          | status  |
      | 1  | 2026-01-20 | 1         | 1       | 50          | stopped   | coach1     | 2026-01-20T09:00:00 | active  |
      | 2  | 2026-01-26 | 1         | 1       | 30          | stopped   | coach1     | 2026-01-26T10:00:00 | active  |
      | 3  | 2026-01-27 | 1         | 1       | 0           | stopped   | coach1     | 2026-01-25T10:00:00 | active  |
      | 4  | 2026-01-22 | 2         | 2       | 45          | stopped   | coach2     | 2026-01-22T09:00:00 | active  |

  Rule: 歷史訓練列表顯示今天及過去的訓練

    Example: 查詢歷史訓練列表（今天是 2026-01-26）
      Given 教練 "coach1" 已登入
      And 今天日期為 "2026-01-26"
      When 教練查詢歷史訓練列表
      Then 操作成功
      And 回傳以下訓練：
        | id | date       | player_name | team_name | pitch_count | ai_status | created_at          | created_by |
        | 2  | 2026-01-26 | 王小明      | 藍鷹隊    | 30          | stopped   | 2026-01-26T10:00:00 | coach1     |
        | 1  | 2026-01-20 | 王小明      | 藍鷹隊    | 50          | stopped   | 2026-01-20T09:00:00 | coach1     |

  Rule: 教練只能查詢自己建立的歷史訓練

    Example: 教練查詢歷史訓練列表
      Given 教練 "coach1" 已登入
      When 教練查詢歷史訓練列表
      Then 結果不包含 coach2 建立的訓練

  Rule: 管理者可查詢所有歷史訓練

    Example: 管理者查詢歷史訓練列表
      Given 管理者 "admin" 已登入
      And 今天日期為 "2026-01-26"
      When 管理者查詢歷史訓練列表
      Then 回傳所有今天及過去的 active 訓練

  Rule: 列表依建立時間倒序排列（最新在前）

    Example: 歷史訓練列表排序
      Given 教練 "coach1" 已登入
      When 教練查詢歷史訓練列表
      Then 依建立時間由新到舊排列

  Rule: 列表回傳欄位與訓練列表相同

    Example: 確認回傳欄位
      Given 教練 "coach1" 已登入
      When 教練查詢歷史訓練列表
      Then 每筆資料包含以下欄位：
        | field        | description     |
        | id           | 訓練 ID         |
        | date         | 訓練日期        |
        | player_name  | 受測選手姓名    |
        | team_name    | 所屬球隊名稱    |
        | pitch_count  | 投球數量        |
        | ai_status    | AI 系統狀態     |
        | created_at   | 建立時間        |
        | created_by   | 建立者名稱      |

  Rule: 支援依日期範圍篩選

    Example: 篩選特定日期範圍
      Given 教練 "coach1" 已登入
      When 教練查詢歷史訓練列表，日期範圍 "2026-01-15" 至 "2026-01-25"
      Then 只回傳該日期範圍內的訓練

  Rule: 支援依球隊篩選

    Example: 管理者篩選特定球隊的歷史訓練
      Given 管理者 "admin" 已登入
      When 管理者查詢歷史訓練列表，篩選球隊 "藍鷹隊"
      Then 只回傳藍鷹隊的歷史訓練

  Rule: 支援分頁查詢，預設每頁 20 筆，可選 10/20/50 筆

    Example: 使用預設分頁
      Given 教練 "coach1" 已登入
      When 教練查詢歷史訓練列表（未指定分頁參數）
      Then 回傳第 1 頁
      And 每頁筆數為 20
