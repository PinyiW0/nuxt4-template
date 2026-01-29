Feature: 查詢球員列表

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
      | id | number | name   | height | position | team_id | sort_order | created_at          | status  |
      | 1  | 1      | 王小明 | 175    | 投手     | 1       | 1          | 2026-01-01T10:00:00 | active  |
      | 2  | 10     | 李大華 | 180    | 捕手     | 1       | 2          | 2026-01-02T10:00:00 | active  |
      | 3  | 5      | 張三豐 | 178    | 游擊手   | 2       | 1          | 2026-01-03T10:00:00 | active  |
      | 4  | 99     | 陳小強 | 172    | 外野手   | 1       | 3          | 2026-01-04T10:00:00 | deleted |

  Rule: 教練只能查詢自己球隊的球員

    Example: 教練查詢球員列表
      Given 教練 "coach1" 已登入
      When 教練查詢球員列表
      Then 操作成功
      And 回傳以下球員：
        | id | number | name   | height | position | team_name | created_at          | sort_order |
        | 2  | 10     | 李大華 | 180    | 捕手     | 藍鷹隊    | 2026-01-02T10:00:00 | 2          |
        | 1  | 1      | 王小明 | 175    | 投手     | 藍鷹隊    | 2026-01-01T10:00:00 | 1          |

  Rule: 管理者可查詢所有球員

    Example: 管理者查詢球員列表
      Given 管理者 "admin" 已登入
      When 管理者查詢球員列表
      Then 操作成功
      And 回傳所有 active 狀態的球員（共 3 筆）

  Rule: 支援依球隊篩選

    Example: 管理者篩選特定球隊的球員
      Given 管理者 "admin" 已登入
      When 管理者查詢球員列表，篩選球隊 "藍鷹隊"
      Then 只回傳藍鷹隊的球員（共 2 筆）

  Rule: 列表依建立時間倒序排列（最新在前）

    Example: 球員列表排序
      Given 教練 "coach1" 已登入
      When 教練查詢球員列表
      Then 第一筆為 "李大華"（較新建立）
      And 第二筆為 "王小明"（較早建立）

  Rule: 列表回傳欄位包含 ID、背號、姓名、身高、守備位置、所屬球隊、建立時間、排序順位

    Example: 確認回傳欄位
      Given 教練 "coach1" 已登入
      When 教練查詢球員列表
      Then 每筆資料包含以下欄位：
        | field      | description  |
        | id         | 球員 ID      |
        | number     | 背號         |
        | name       | 姓名         |
        | height     | 身高（公分） |
        | position   | 守備位置     |
        | team_name  | 所屬球隊名稱 |
        | created_at | 建立時間     |
        | sort_order | 排序順位     |

  Rule: 支援分頁查詢，預設每頁 20 筆，可選 10/20/50 筆

    Example: 使用預設分頁
      Given 教練 "coach1" 已登入
      When 教練查詢球員列表（未指定分頁參數）
      Then 回傳第 1 頁
      And 每頁筆數為 20

  Rule: 已刪除的球員不顯示在列表中

    Example: 列表不包含已刪除球員
      Given 教練 "coach1" 已登入
      When 教練查詢球員列表
      Then 結果不包含 "陳小強"（已刪除）
