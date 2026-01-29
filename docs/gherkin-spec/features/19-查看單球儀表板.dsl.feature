Feature: 查看單球儀表板

  Background:
    Given 系統中有以下使用者：
      | account | role   | status |
      | coach1  | 教練   | active |
    And 系統中有以下訓練：
      | id | date       | player_id | team_id | strike_zone_top | strike_zone_bottom | created_by | status |
      | 1  | 2026-01-26 | 1         | 1       | 120             | 50                 | coach1     | active |
    And 訓練 1 有以下投球紀錄：
      | id | sequence | velocity | spin_rate | is_strike | location_x | location_y | trajectory_data |
      | 1  | 1        | 125.5    | 2200      | true      | 0.1        | 0.8        | {...}           |
      | 2  | 2        | 128.3    | 2350      | false     | -0.3       | 1.2        | {...}           |

  Rule: 單球儀表板預設顯示九宮格視圖

    Example: 開啟單球儀表板
      Given 教練 "coach1" 已登入
      And 教練正在查看訓練 1 的紀錄
      When 教練點擊投球 1 查看詳情
      Then 開啟單球儀表板
      And 預設顯示九宮格視圖

  Rule: 九宮格視圖顯示好球帶框線、落點標記、好壞球顏色區分、球速標註

    Example: 九宮格視圖內容（好球）
      Given 教練 "coach1" 已登入
      And 教練正在查看投球 1 的單球儀表板
      When 顯示九宮格視圖
      Then 顯示好球帶框線（上緣 120cm、下緣 50cm）
      And 顯示投球落點標記於位置 (0.1, 0.8)
      And 落點標記顏色為綠色（好球）
      And 落點旁標註球速 "125.5 km/h"

    Example: 九宮格視圖內容（壞球）
      Given 教練 "coach1" 已登入
      And 教練正在查看投球 2 的單球儀表板
      When 顯示九宮格視圖
      Then 顯示投球落點標記於位置 (-0.3, 1.2)
      And 落點標記顏色為紅色（壞球）
      And 落點旁標註球速 "128.3 km/h"

  Rule: 可透過 Tab 切換至 3D 軌跡視圖

    Example: 切換至 3D 軌跡視圖
      Given 教練 "coach1" 已登入
      And 教練正在查看投球 1 的單球儀表板（九宮格視圖）
      When 教練點擊 "3D 軌跡" Tab
      Then 切換顯示 3D 入壘軌跡視圖
      And 隱藏九宮格視圖

    Example: 從 3D 軌跡切回九宮格
      Given 教練 "coach1" 已登入
      And 教練正在查看投球 1 的單球儀表板（3D 軌跡視圖）
      When 教練點擊 "九宮格" Tab
      Then 切換顯示九宮格視圖
      And 隱藏 3D 軌跡視圖

  Rule: 3D 軌跡視圖顯示投球入壘軌跡

    Example: 3D 軌跡視圖內容
      Given 教練 "coach1" 已登入
      And 教練正在查看投球 1 的單球儀表板
      When 教練切換至 3D 軌跡視圖
      Then 顯示投球的 3D 入壘軌跡
      And 顯示好球帶立體框線

  Rule: 同時只顯示一種視圖

    Example: 切換視圖時隱藏另一視圖
      Given 教練 "coach1" 已登入
      And 教練正在查看投球 1 的單球儀表板
      When 顯示九宮格視圖
      Then 3D 軌跡視圖為隱藏狀態
