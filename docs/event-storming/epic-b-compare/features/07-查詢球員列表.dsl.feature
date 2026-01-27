# Feature: 查詢球員列表
# (Query - 無狀態變更)

Feature: 查詢球員列表

  作為 已登入的使用者
  我想要 查詢球隊的球員列表
  以便 瀏覽球員資料

  Background:
    Given 系統中有以下使用者:
      | account | password | role   |
      | admin   | Admin123 | 管理者 |
      | coach1  | Coach123 | 教練   |
      | coach2  | Coach456 | 教練   |
    And 系統中有以下球隊:
      | team_id | name     | created_by | is_deleted |
      | 1       | 藍鷹隊   | coach1     | false      |
      | 2       | 紅龍隊   | coach2     | false      |
    And 球隊 "藍鷹隊" 有以下球員:
      | player_id | name   | jersey_number | height | position | sort_order | is_deleted |
      | 101       | 王小明 | 1             | 175    | P        | 1          | false      |
      | 102       | 李小華 | 10            | 180    | C        | 2          | false      |
      | 103       | 張大勇 | 25            | 185    | 1B       | 3          | false      |
      | 104       | 已刪除球員 | 99        | 170    | SS       | 4          | true       |

  Rule: 管理者可查詢所有球隊的球員

    Example: 管理者查詢任意球隊的球員
      Given 使用者 "admin" 已登入系統
      When 使用者 "admin" 查詢球隊 "藍鷹隊" 的球員列表
      Then 操作成功
      And 回傳的球員列表包含:
        | name   | jersey_number |
        | 王小明 | 1             |
        | 李小華 | 10            |
        | 張大勇 | 25            |
      And 回傳的球員列表不包含 "已刪除球員"

  Rule: 教練只能查詢自己建立的球隊的球員

    Example: 教練查詢自己球隊的球員
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 查詢球隊 "藍鷹隊" 的球員列表
      Then 操作成功
      And 回傳的球員列表包含:
        | name   |
        | 王小明 |
        | 李小華 |
        | 張大勇 |

    Example: 教練無法查詢他人球隊的球員
      Given 使用者 "coach1" 已登入系統
      When 使用者 "coach1" 查詢球隊 "紅龍隊" 的球員列表
      Then 操作失敗
      And 系統顯示 "無權限查詢此球隊"

  Rule: 支援依守備位置篩選

    Example: 篩選特定守備位置的球員
      Given 使用者 "admin" 已登入系統
      When 使用者 "admin" 查詢球隊 "藍鷹隊" 的球員列表，篩選守備位置為 "P"
      Then 操作成功
      And 回傳的球員列表包含:
        | name   |
        | 王小明 |
      And 回傳的球員列表不包含 "李小華"

  Rule: 支援依姓名模糊搜尋

    Example: 模糊搜尋球員姓名
      Given 使用者 "admin" 已登入系統
      When 使用者 "admin" 查詢球隊 "藍鷹隊" 的球員列表，搜尋姓名包含 "小"
      Then 操作成功
      And 回傳的球員列表包含:
        | name   |
        | 王小明 |
        | 李小華 |
      And 回傳的球員列表不包含 "張大勇"

  Rule: 預設依 sort_order 排序，可切換為其他排序欄位

    Example: 預設依自訂順序排序
      Given 使用者 "admin" 已登入系統
      When 使用者 "admin" 查詢球隊 "藍鷹隊" 的球員列表
      Then 操作成功
      And 回傳的球員列表依 sort_order 升冪排序

    Example: 依背號排序
      Given 使用者 "admin" 已登入系統
      When 使用者 "admin" 查詢球隊 "藍鷹隊" 的球員列表，排序欄位為 "jersey_number"
      Then 操作成功
      And 回傳的球員列表依 jersey_number 升冪排序

    Example: 依姓名排序
      Given 使用者 "admin" 已登入系統
      When 使用者 "admin" 查詢球隊 "藍鷹隊" 的球員列表，排序欄位為 "name"
      Then 操作成功
      And 回傳的球員列表依 name 升冪排序

  Rule: 球隊無球員時回傳空列表

    Example: 查詢無球員的球隊
      Given 使用者 "admin" 已登入系統
      And 球隊 "紅龍隊" 沒有任何球員
      When 使用者 "admin" 查詢球隊 "紅龍隊" 的球員列表
      Then 操作成功
      And 回傳的球員列表為空

  Rule: 已刪除的球員不出現在查詢結果中

    Example: 查詢結果不包含已刪除的球員
      Given 使用者 "admin" 已登入系統
      When 使用者 "admin" 查詢球隊 "藍鷹隊" 的球員列表
      Then 操作成功
      And 回傳的球員列表不包含任何 is_deleted 為 true 的球員
