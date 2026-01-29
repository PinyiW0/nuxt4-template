Feature: 查詢選手分析列表

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
      | id | name   | number | team_id | status |
      | 1  | 王小明 | 1      | 1       | active |
      | 2  | 李大華 | 10     | 1       | active |
      | 3  | 張三豐 | 5      | 2       | active |
    And 系統中有以下選手分析數據：
      | player_id | training_count | total_pitches | last_training_date | avg_velocity |
      | 1         | 10             | 500           | 2026-01-25         | 128.5        |
      | 2         | 8              | 400           | 2026-01-24         | 125.3        |
      | 3         | 5              | 250           | 2026-01-23         | 130.2        |

  Rule: 教練只能查詢自己球隊的選手分析

    Example: 教練查詢選手分析列表
      Given 教練 "coach1" 已登入
      When 教練查詢選手分析列表
      Then 操作成功
      And 回傳以下選手分析：
        | id | name   | number | team_name | training_count | total_pitches | last_training_date | avg_velocity |
        | 1  | 王小明 | 1      | 藍鷹隊    | 10             | 500           | 2026-01-25         | 128.5        |
        | 2  | 李大華 | 10     | 藍鷹隊    | 8              | 400           | 2026-01-24         | 125.3        |

  Rule: 管理者可查詢所有選手分析

    Example: 管理者查詢選手分析列表
      Given 管理者 "admin" 已登入
      When 管理者查詢選手分析列表
      Then 操作成功
      And 回傳所有選手分析（共 3 筆）

  Rule: 列表依建立時間倒序排列（最新在前）

    Example: 選手分析列表排序
      Given 教練 "coach1" 已登入
      When 教練查詢選手分析列表
      Then 依建立時間由新到舊排列

  Rule: 列表回傳欄位包含 ID、姓名、背號、球隊、訓練次數、投球數、最近訓練日、平均球速

    Example: 確認回傳欄位
      Given 教練 "coach1" 已登入
      When 教練查詢選手分析列表
      Then 每筆資料包含以下欄位：
        | field              | description          |
        | id                 | 球員 ID              |
        | name               | 球員姓名             |
        | number             | 背號                 |
        | team_name          | 所屬球隊名稱         |
        | training_count     | 總訓練次數           |
        | total_pitches      | 總投球數             |
        | last_training_date | 最近訓練日期         |
        | avg_velocity       | 平均球速（km/h）     |

  Rule: 支援依球隊篩選

    Example: 管理者篩選特定球隊的選手分析
      Given 管理者 "admin" 已登入
      When 管理者查詢選手分析列表，篩選球隊 "藍鷹隊"
      Then 只回傳藍鷹隊的選手分析（共 2 筆）

  Rule: 支援關鍵字搜尋（姓名）

    Example: 依姓名搜尋
      Given 教練 "coach1" 已登入
      When 教練查詢選手分析列表，關鍵字 "王"
      Then 只回傳姓名包含 "王" 的選手

  Rule: 支援分頁查詢，預設每頁 20 筆，可選 10/20/50 筆

    Example: 使用預設分頁
      Given 教練 "coach1" 已登入
      When 教練查詢選手分析列表（未指定分頁參數）
      Then 回傳第 1 頁
      And 每頁筆數為 20

  Rule: 已刪除的球員不顯示在列表中

    Example: 列表不包含已刪除球員
      Given 教練 "coach1" 已登入
      When 教練查詢選手分析列表
      Then 結果不包含已刪除的球員
