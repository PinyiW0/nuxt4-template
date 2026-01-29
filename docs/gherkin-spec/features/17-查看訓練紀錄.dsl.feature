Feature: 查看訓練紀錄

  Background:
    Given 系統中有以下使用者：
      | account | role   | status |
      | coach1  | 教練   | active |
      | coach2  | 教練   | active |
    And 系統中有以下球隊：
      | id | name   | created_by | status |
      | 1  | 藍鷹隊 | coach1     | active |
    And 系統中有以下球員：
      | id | name   | team_id | height | status |
      | 1  | 王小明 | 1       | 175    | active |
    And 系統中有以下訓練：
      | id | date       | player_id | team_id | strike_zone_top | strike_zone_bottom | created_by | status |
      | 1  | 2026-01-26 | 1         | 1       | 120             | 50                 | coach1     | active |
    And 訓練 1 有以下投球紀錄：
      | id | sequence | time                | velocity | spin_rate | is_strike | location_x | location_y |
      | 1  | 1        | 2026-01-26T10:01:00 | 125.5    | 2200      | true      | 0.1        | 0.8        |
      | 2  | 2        | 2026-01-26T10:02:00 | 128.3    | 2350      | false     | -0.3       | 1.2        |
      | 3  | 3        | 2026-01-26T10:03:00 | 130.1    | 2180      | true      | 0.0        | 0.6        |

  Rule: 訓練紀錄頁顯示訓練基本資訊

    Example: 查看訓練基本資訊
      Given 教練 "coach1" 已登入
      When 教練查看訓練 1 的紀錄
      Then 操作成功
      And 顯示訓練基本資訊：
        | field              | value      |
        | date               | 2026-01-26 |
        | team_name          | 藍鷹隊     |
        | player_name        | 王小明     |
        | strike_zone_top    | 120 cm     |
        | strike_zone_bottom | 50 cm      |

  Rule: 訓練紀錄頁顯示投球清單

    Example: 查看投球清單
      Given 教練 "coach1" 已登入
      When 教練查看訓練 1 的紀錄
      Then 顯示投球清單：
        | sequence | time     | velocity | spin_rate | is_strike | location   |
        | 1        | 10:01:00 | 125.5    | 2200      | 好球      | (0.1, 0.8) |
        | 2        | 10:02:00 | 128.3    | 2350      | 壞球      | (-0.3, 1.2)|
        | 3        | 10:03:00 | 130.1    | 2180      | 好球      | (0.0, 0.6) |

  Rule: 投球清單顯示球序、投球時間、球速、轉速、好壞球判定、落點位置

    Example: 確認投球清單欄位
      Given 教練 "coach1" 已登入
      When 教練查看訓練 1 的紀錄
      Then 投球清單每筆資料包含以下欄位：
        | field     | description      |
        | sequence  | 球序（第幾球）   |
        | time      | 投球時間         |
        | velocity  | 球速（km/h）     |
        | spin_rate | 轉速（rpm）      |
        | is_strike | 好壞球判定       |
        | location  | 落點位置         |

  Rule: 訓練紀錄頁顯示即時統計摘要

    Example: 查看即時統計
      Given 教練 "coach1" 已登入
      When 教練查看訓練 1 的紀錄
      Then 顯示即時統計摘要：
        | field          | value  |
        | total_pitches  | 3      |
        | strike_count   | 2      |
        | ball_count     | 1      |
        | strike_rate    | 66.7%  |
        | avg_velocity   | 127.97 |

  Rule: 教練只能查看自己建立的訓練紀錄

    Example: 教練查看他人的訓練紀錄
      Given 教練 "coach2" 已登入
      When 教練查看訓練 1 的紀錄
      Then 操作失敗
      And 系統顯示 "無權限查看此訓練"

  Rule: 投球清單支援 SSE 即時更新

    Example: 新投球即時加入清單
      Given 教練 "coach1" 已登入
      And 教練正在查看訓練 1 的紀錄
      When AI 系統偵測到新投球
      Then 投球清單自動新增該筆紀錄
      And 即時統計摘要自動更新
