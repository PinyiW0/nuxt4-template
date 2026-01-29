Feature: 查詢投球清單

  Background:
    Given 系統中有以下使用者：
      | 帳號    | 角色   |
      | coach1 | 教練   |
    And 系統中有以下訓練：
      | 編號  | 日期       | 受測選手 | 建立者  |
      | T001 | 2026-01-26 | 王小明   | coach1 |
    And 訓練 "T001" 有以下投球紀錄：
      | 編號 | 球速  | 轉速  | 好壞球 |
      | P001 | 120  | 2200 | 好球   |
      | P002 | 118  | 2150 | 壞球   |

  Rule: 投球清單透過 SSE 即時更新

    Example: 查看訓練的投球清單
      Given 教練 "coach1" 已登入
      When 教練查詢訓練 "T001" 的投球清單
      Then 系統回傳投球清單：
        | 編號 | 球速  | 轉速  | 好壞球 |
        | P001 | 120  | 2200 | 好球   |
        | P002 | 118  | 2150 | 壞球   |

    Example: AI 偵測到新投球時即時更新清單
      Given 教練 "coach1" 已登入
      And 教練正在查看訓練 "T001" 的投球清單
      And AI 系統正在運行中
      When AI 系統偵測到一顆新投球
      Then 投球清單自動新增該筆投球紀錄
      And 不需要手動刷新頁面

  Rule: SSE 連線斷開時自動重連

    Example: 網路斷線後自動重連
      Given 教練 "coach1" 已登入
      And 教練正在查看訓練 "T001" 的投球清單
      When SSE 連線中斷
      Then 系統自動嘗試重新連線
      And 重連成功後繼續接收即時更新

  Rule: 教練只能查看自己訓練的投球清單

    Example: 教練查看自己訓練的投球清單
      Given 教練 "coach1" 已登入
      When 教練查詢訓練 "T001" 的投球清單
      Then 操作成功

    Example: 教練查看他人訓練的投球清單
      Given 系統中有訓練 "T002" 由 "coach2" 建立
      And 教練 "coach1" 已登入
      When 教練查詢訓練 "T002" 的投球清單
      Then 操作失敗
      And 系統顯示 "無權限查看此訓練"
