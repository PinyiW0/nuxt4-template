# language: zh-TW
# Feature: 球隊/球員資料管理
# Source: US-B (docs/user-stories/us-teamAndPlayer.md)
# Generated: 2026-01-21T10:40:00Z

Feature: 球隊/球員資料管理
  作為管理者或教練
  我想要管理球隊和球員的資料
  以便進行賽事規劃和人員調度

  Background:
    Given 用戶已登入系統
    And 用戶擁有必要的權限

  # ========================================
  # F-B1: 球隊查詢
  # ========================================

  Rule: 用戶可以查詢球隊列表並套用篩選條件

    Example: 查詢所有 Active 球隊（預設）
      Given 系統中存在以下球隊：
        | teamId | teamName | status   |
        | T001   | 閃電隊   | Active   |
        | T002   | 勇士隊   | Active   |
        | T003   | 老鷹隊   | Inactive |
      When 執行 QueryTeamList 不帶任何參數
      Then 應成功產生 TeamListQueried
      And 應產生 TeamListRetrieved 包含：
        | totalCount | 2    |
        | teams      | T001, T002 |

    Scenario Outline: 使用不同篩選條件查詢球隊
      Given 系統中存在 <總數> 支球隊，其中 <Active數> 支為 Active
      When 執行 QueryTeamList 帶入：
        | status  | <status>  |
        | keyword | <keyword> |
      Then 應成功產生 TeamListQueried
      And 應產生 TeamListRetrieved 包含 <結果數> 支球隊

      Examples: 不同篩選條件
        | 總數 | Active數 | status   | keyword | 結果數 |
        | 5    | 3        | Active   |         | 3      |
        | 5    | 3        | Inactive |         | 2      |
        | 5    | 3        |          | 閃電    | 1      |

  # ========================================
  # F-B2: 球隊選擇
  # ========================================

  Rule: 選擇球隊後建立操作上下文

    Example: 成功選擇存在的球隊
      Given 系統中存在球隊 "T001"
      When 執行 SelectTeam 帶入：
        | teamId | T001 |
      Then 應成功產生 TeamSelected
      And 應產生 TeamContextEstablished 包含：
        | teamId | T001 |

    Example: 選擇不存在的球隊應失敗
      Given 系統中不存在球隊 "T999"
      When 執行 SelectTeam 帶入：
        | teamId | T999 |
      Then 應拒絕執行
      And 應回傳錯誤碼 "TEAM_NOT_FOUND"
      And 應回傳錯誤訊息 "找不到指定的球隊"

  Rule: 選擇球隊後自動載入球員列表

    Example: TeamContextEstablished 觸發 AutoLoadPlayersOnTeamSelection Policy
      Given 球隊 "T001" 存在且有 5 名球員
      When 產生 TeamContextEstablished 事件：
        | teamId | T001 |
      Then Policy "AutoLoadPlayersOnTeamSelection" 應被觸發
      And 應自動執行 QueryPlayerList 帶入：
        | teamId | T001 |
      And 最終應產生 PlayerListRetrieved

  # ========================================
  # F-B3: 球隊建立
  # ========================================

  Rule: 球隊名稱必須唯一

    Example: 使用未被使用的名稱建立球隊
      Given 系統中不存在名為 "閃電隊" 的球隊
      When 執行 CreateTeam 帶入：
        | teamName    | 閃電隊           |
        | description | 2026 新成立球隊  |
      Then 應成功產生 TeamCreationRequested
      And 應產生 TeamValidated 包含：
        | isValid | true |
      And 應產生 TeamCreated 包含：
        | teamName | 閃電隊  |
        | status   | Active |
      And 應產生 TeamCacheInvalidated

    Example: 使用已存在的名稱建立球隊應失敗
      Given 系統中已存在名為 "勇士隊" 的球隊
      When 執行 CreateTeam 帶入：
        | teamName | 勇士隊 |
      Then 應產生 TeamValidated 包含：
        | isValid | false |
      And 應回傳錯誤碼 "TEAM_NAME_DUPLICATE"
      And 應回傳錯誤訊息 "球隊名稱已被使用"
      And 不應產生 TeamCreated

  Rule: 球隊名稱必須符合長度規範

    Scenario Outline: 驗證球隊名稱長度
      When 執行 CreateTeam 帶入 teamName="<teamName>"
      Then 應 <result>
      And <assertion>

      Examples: 有效的球隊名稱
        | teamName         | result | assertion                 |
        | 閃電             | 成功   | 產生 TeamCreated          |
        | 超級無敵宇宙戰隊 | 成功   | 產生 TeamCreated          |

      Examples: 無效的球隊名稱
        | teamName                                      | result | assertion                          |
        |                                               | 失敗   | 回傳錯誤碼 TEAM_NAME_REQUIRED      |
        | A                                             | 失敗   | 回傳錯誤碼 TEAM_NAME_INVALID_LENGTH|
        | 這個球隊名稱超級長超過五十個字元的限制應該失敗 | 失敗   | 回傳錯誤碼 TEAM_NAME_INVALID_LENGTH|

  # ========================================
  # F-B4: 球隊編輯
  # ========================================

  Rule: 更新球隊資訊時名稱仍須唯一

    Example: 更新球隊名稱為未使用的名稱
      Given 系統中存在球隊 "T001" 名為 "閃電隊"
      And 系統中不存在名為 "雷霆隊" 的球隊
      When 執行 UpdateTeam 帶入：
        | teamId   | T001   |
        | teamName | 雷霆隊 |
      Then 應成功產生 TeamUpdated 包含：
        | teamId   | T001   |
        | teamName | 雷霆隊 |
      And 應產生 TeamCacheInvalidated

    Example: 更新球隊名稱為已存在的名稱應失敗
      Given 系統中存在球隊 "T001" 名為 "閃電隊"
      And 系統中存在球隊 "T002" 名為 "勇士隊"
      When 執行 UpdateTeam 帶入：
        | teamId   | T001   |
        | teamName | 勇士隊 |
      Then 應拒絕執行
      And 應回傳錯誤碼 "TEAM_NAME_DUPLICATE"

  # ========================================
  # F-B5: 球隊刪除
  # ========================================

  Rule: 刪除球隊時應 cascade delete 所有球員

    Example: 刪除含有球員的球隊
      Given 系統中存在球隊 "T001"
      And 球隊 "T001" 有以下球員：
        | playerId | name   |
        | P001     | 王小明 |
        | P002     | 李大華 |
        | P003     | 張三豐 |
      When 執行 DeleteTeam 帶入：
        | teamId | T001 |
      Then 應成功產生 TeamDeleted 包含：
        | teamId | T001 |
      And 應產生 TeamPlayersDeleted 包含：
        | teamId       | T001         |
        | deletedCount | 3            |
      And 應產生 TeamCacheInvalidated

    Example: 刪除不存在的球隊應失敗
      Given 系統中不存在球隊 "T999"
      When 執行 DeleteTeam 帶入：
        | teamId | T999 |
      Then 應拒絕執行
      And 應回傳錯誤碼 "TEAM_NOT_FOUND"

  # ========================================
  # F-B6: 球員查詢
  # ========================================

  Rule: 查詢球員列表時依 sortOrder 排序

    Example: 查詢球隊的所有球員
      Given 球隊 "T001" 有以下球員：
        | playerId | name   | sortOrder |
        | P003     | 張三豐 | 1         |
        | P001     | 王小明 | 2         |
        | P002     | 李大華 | 3         |
      When 執行 QueryPlayerList 帶入：
        | teamId | T001 |
      Then 應成功產生 PlayerListQueried
      And 應產生 PlayerListRetrieved 包含球員順序：
        | P003, P001, P002 |

    Example: 查詢不存在的球隊應失敗
      Given 系統中不存在球隊 "T999"
      When 執行 QueryPlayerList 帶入：
        | teamId | T999 |
      Then 應拒絕執行
      And 應回傳錯誤碼 "TEAM_NOT_FOUND"

  # ========================================
  # F-B7: 球員新增
  # ========================================

  Rule: 背號在同一球隊內必須唯一

    Example: 使用未被使用的背號新增球員
      Given 球隊 "T001" 存在
      And 球隊 "T001" 沒有背號 23 的球員
      When 執行 CreatePlayer 帶入：
        | teamId       | T001   |
        | jerseyNumber | 23     |
        | name         | 王小明 |
        | position     | P      |
        | height       | 180    |
      Then 應成功產生 PlayerCreated 包含：
        | jerseyNumber | 23     |
        | sortOrder    | (最大值+1) |
      And 應產生 PlayerListRefreshed

    Example: 使用已存在的背號新增球員應失敗
      Given 球隊 "T001" 已有背號 23 的球員
      When 執行 CreatePlayer 帶入：
        | teamId       | T001   |
        | jerseyNumber | 23     |
        | name         | 李大華 |
        | position     | C      |
      Then 應拒絕執行
      And 應回傳錯誤碼 "JERSEY_NUMBER_DUPLICATE"

  Rule: 背號必須在 0-99 之間

    Scenario Outline: 驗證背號範圍
      Given 球隊 "T001" 存在
      When 執行 CreatePlayer 帶入 jerseyNumber=<jerseyNumber>
      Then 應 <result>
      And <assertion>

      Examples: 有效的背號
        | jerseyNumber | result | assertion           |
        | 0            | 成功   | 產生 PlayerCreated  |
        | 50           | 成功   | 產生 PlayerCreated  |
        | 99           | 成功   | 產生 PlayerCreated  |

      Examples: 無效的背號
        | jerseyNumber | result | assertion                         |
        | -1           | 失敗   | 回傳錯誤碼 JERSEY_NUMBER_INVALID  |
        | 100          | 失敗   | 回傳錯誤碼 JERSEY_NUMBER_INVALID  |

  Rule: 守備位置必須為標準棒球位置

    Scenario Outline: 驗證守備位置
      Given 球隊 "T001" 存在
      When 執行 CreatePlayer 帶入 position="<position>"
      Then 應 <result>
      And <assertion>

      Examples: 有效的守備位置
        | position | result | assertion          |
        | P        | 成功   | 產生 PlayerCreated |
        | C        | 成功   | 產生 PlayerCreated |
        | 1B       | 成功   | 產生 PlayerCreated |
        | 2B       | 成功   | 產生 PlayerCreated |
        | 3B       | 成功   | 產生 PlayerCreated |
        | SS       | 成功   | 產生 PlayerCreated |
        | LF       | 成功   | 產生 PlayerCreated |
        | CF       | 成功   | 產生 PlayerCreated |
        | RF       | 成功   | 產生 PlayerCreated |
        | DH       | 成功   | 產生 PlayerCreated |

      Examples: 無效的守備位置
        | position | result | assertion                     |
        | XX       | 失敗   | 回傳錯誤碼 POSITION_INVALID   |
        | OF       | 失敗   | 回傳錯誤碼 POSITION_INVALID   |

  Rule: 新增球員時自動分配 sortOrder

    Example: sortOrder 應為目前最大值 + 1
      Given 球隊 "T001" 有以下球員：
        | playerId | sortOrder |
        | P001     | 1         |
        | P002     | 2         |
        | P003     | 5         |
      When 執行 CreatePlayer 建立新球員到球隊 "T001"
      Then 應產生 PlayerCreated 包含：
        | sortOrder | 6 |

  # ========================================
  # F-B8: 球員編輯
  # ========================================

  Rule: 更新球員時背號仍須在同球隊內唯一

    Example: 更新背號為未使用的背號
      Given 球隊 "T001" 有球員 "P001" 背號 23
      And 球隊 "T001" 沒有背號 45 的球員
      When 執行 UpdatePlayer 帶入：
        | playerId     | P001 |
        | jerseyNumber | 45   |
      Then 應成功產生 PlayerUpdated 包含：
        | playerId     | P001 |
        | jerseyNumber | 45   |
      And 應產生 PlayerListRefreshed

    Example: 更新背號為已存在的背號應失敗
      Given 球隊 "T001" 有球員 "P001" 背號 23
      And 球隊 "T001" 有球員 "P002" 背號 45
      When 執行 UpdatePlayer 帶入：
        | playerId     | P001 |
        | jerseyNumber | 45   |
      Then 應拒絕執行
      And 應回傳錯誤碼 "JERSEY_NUMBER_DUPLICATE"

  # ========================================
  # F-B9: 球員刪除
  # ========================================

  Rule: 刪除球員應觸發列表刷新

    Example: 成功刪除球員
      Given 球隊 "T001" 有球員 "P001"
      When 執行 DeletePlayer 帶入：
        | playerId | P001 |
      Then 應成功產生 PlayerDeleted 包含：
        | playerId | P001 |
      And 應產生 PlayerListRefreshed

    Example: 刪除不存在的球員應失敗
      Given 系統中不存在球員 "P999"
      When 執行 DeletePlayer 帶入：
        | playerId | P999 |
      Then 應拒絕執行
      And 應回傳錯誤碼 "PLAYER_NOT_FOUND"

  # ========================================
  # F-B10: 球員排序調整
  # ========================================

  Rule: 調整排序時所有球員必須屬於同一球隊

    Example: 成功調整球員排序
      Given 球隊 "T001" 有以下球員：
        | playerId | sortOrder |
        | P001     | 1         |
        | P002     | 2         |
        | P003     | 3         |
      When 執行 UpdatePlayerOrder 帶入：
        | teamId       | T001                                   |
        | orderChanges | P001:3, P002:1, P003:2 (playerId:newOrder) |
      Then 應成功產生 PlayerOrderChanged 包含：
        | orderChanges | [P001:3, P002:1, P003:2] |
      And 應產生 PlayerListRefreshed

    Example: 調整不同球隊的球員排序應失敗
      Given 球隊 "T001" 有球員 "P001"
      And 球隊 "T002" 有球員 "P002"
      When 執行 UpdatePlayerOrder 帶入：
        | teamId       | T001          |
        | orderChanges | P001:1, P002:2 |
      Then 應拒絕執行
      And 應回傳錯誤碼 "PLAYER_TEAM_MISMATCH"
      And 應回傳錯誤訊息 "所有球員必須屬於同一球隊"

  # ========================================
  # Policies 測試
  # ========================================

  Rule: Policy POL-002 - InvalidateCacheOnTeamModification

    Scenario Outline: 球隊變更時自動失效快取
      When 產生 <event> 事件
      Then Policy "InvalidateCacheOnTeamModification" 應被觸發
      And 應產生 TeamCacheInvalidated

      Examples: 會觸發快取失效的事件
        | event        |
        | TeamCreated  |
        | TeamUpdated  |
        | TeamDeleted  |

  Rule: Policy POL-003 - RefreshPlayerListOnModification

    Scenario Outline: 球員變更時自動刷新列表
      When 產生 <event> 事件
      Then Policy "RefreshPlayerListOnModification" 應被觸發
      And 應產生 PlayerListRefreshed

      Examples: 會觸發列表刷新的事件
        | event              |
        | PlayerCreated      |
        | PlayerUpdated      |
        | PlayerDeleted      |
        | PlayerOrderChanged |

  # ========================================
  # Invariants 測試
  # ========================================

  Rule: Invariant INV-001 - 球隊名稱必須唯一

    Scenario Outline: 嘗試違反球隊名稱唯一性
      Given 系統中已存在球隊名稱 "勇士隊"
      When 執行 <command> 嘗試使用名稱 "勇士隊"
      Then 應拒絕執行
      And 應回傳錯誤碼 "TEAM_NAME_DUPLICATE"

      Examples: 會檢查名稱唯一性的操作
        | command    |
        | CreateTeam |
        | UpdateTeam |

  Rule: Invariant INV-003 - 背號在同一球隊內必須唯一

    Scenario Outline: 嘗試違反背號唯一性
      Given 球隊 "T001" 已有球員背號 23
      When 執行 <command> 嘗試使用背號 23
      Then 應拒絕執行
      And 應回傳錯誤碼 "JERSEY_NUMBER_DUPLICATE"

      Examples: 會檢查背號唯一性的操作
        | command      |
        | CreatePlayer |
        | UpdatePlayer |
