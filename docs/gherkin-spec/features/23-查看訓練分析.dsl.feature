Feature: 查看訓練分析

  Background:
    Given 系統中有以下使用者：
      | account | role   | status |
      | coach1  | 教練   | active |
      | coach2  | 教練   | active |
    And 系統中有以下球隊：
      | id | name   | created_by | status |
      | 1  | 藍鷹隊 | coach1     | active |
    And 系統中有以下球員：
      | id | name   | team_id | status |
      | 1  | 王小明 | 1       | active |
    And 系統中有以下訓練：
      | id | date       | player_id | team_id | created_by | status |
      | 1  | 2026-01-26 | 1         | 1       | coach1     | active |
    And 訓練 1 有以下投球紀錄：
      | id | velocity | spin_rate | is_strike | location_x | location_y |
      | 1  | 125.5    | 2200      | true      | 0.1        | 0.8        |
      | 2  | 128.3    | 2350      | false     | -0.3       | 1.2        |
      | 3  | 130.1    | 2180      | true      | 0.0        | 0.6        |
      | 4  | 127.8    | 2280      | true      | 0.2        | 0.7        |
      | 5  | 126.2    | 2150      | false     | -0.1       | 1.1        |

  Rule: 訓練分析頁為統計彙總視圖，用於賽後分析

    Example: 查看訓練分析
      Given 教練 "coach1" 已登入
      When 教練查看訓練 1 的分析
      Then 操作成功
      And 顯示訓練統計彙總

  Rule: 顯示總投球數

    Example: 查看總投球數
      Given 教練 "coach1" 已登入
      When 教練查看訓練 1 的分析
      Then 顯示總投球數為 5

  Rule: 顯示好球數與壞球數

    Example: 查看好壞球數
      Given 教練 "coach1" 已登入
      When 教練查看訓練 1 的分析
      Then 顯示好球數為 3
      And 顯示壞球數為 2

  Rule: 顯示好球率

    Example: 查看好球率
      Given 教練 "coach1" 已登入
      When 教練查看訓練 1 的分析
      Then 顯示好球率為 60%

  Rule: 顯示平均球速、最快球速、最慢球速

    Example: 查看球速統計
      Given 教練 "coach1" 已登入
      When 教練查看訓練 1 的分析
      Then 顯示平均球速為 127.58 km/h
      And 顯示最快球速為 130.1 km/h
      And 顯示最慢球速為 125.5 km/h

  Rule: 顯示平均轉速

    Example: 查看轉速統計
      Given 教練 "coach1" 已登入
      When 教練查看訓練 1 的分析
      Then 顯示平均轉速為 2232 rpm

  Rule: 顯示落點熱區圖（累積分布）

    Example: 查看熱區圖
      Given 教練 "coach1" 已登入
      When 教練查看訓練 1 的分析
      Then 顯示落點熱區圖
      And 熱區圖以顏色漸層顯示投球落點密度

  Rule: 訓練分析包含 7 項統計指標

    Example: 確認統計指標完整
      Given 教練 "coach1" 已登入
      When 教練查看訓練 1 的分析
      Then 顯示以下統計指標：
        | field         | description          |
        | total_pitches | 總投球數             |
        | strike_count  | 好球數               |
        | ball_count    | 壞球數               |
        | strike_rate   | 好球率（%）          |
        | avg_velocity  | 平均球速（km/h）     |
        | max_velocity  | 最快球速（km/h）     |
        | min_velocity  | 最慢球速（km/h）     |
        | avg_spin_rate | 平均轉速（rpm）      |
        | heat_map      | 落點熱區圖           |

  Rule: 教練只能查看自己建立的訓練分析

    Example: 教練查看他人的訓練分析
      Given 教練 "coach2" 已登入
      When 教練查看訓練 1 的分析
      Then 操作失敗
      And 系統顯示 "無權限查看此訓練"
