# Epic B: 球隊/球員資料管理

## US-B1: 球隊列表查詢與選擇

Feature: 球隊列表查詢與選擇
  身為 管理者/教練
  我想要 查詢並選擇球隊
  以便 管理該隊球員

  Background:
    Given 用戶 "coach-001" 已登入系統
    And 系統中存在以下球隊：
      | teamId | teamName   | playerCount | status   |
      | T001   | 勇士隊     | 12          | Active   |
      | T002   | 老虎隊     | 10          | Active   |
      | T003   | 飛鷹隊     | 8           | Inactive |

  @happy-path @query @ui
  Scenario: 成功查詢球隊列表
    # Preconditions
    Given 用戶位於球隊管理頁面
    And 用戶擁有查詢球隊的權限

    # Query Request
    When 用戶輸入查詢條件：
      | status | Active |
    And 用戶點擊查詢按鈕

    # Command Execution
    Then 系統應該發送 "QueryTeamList" command，參數為：
      | userId     | coach-001                    |
      | filters    | {"status": "Active"}         |
      | pagination | {"page": 1, "pageSize": 20} |

    # Events Emission
    And 系統應該觸發 "TeamListQueried" event
    And UI 應該顯示載入中狀態

    # Postconditions
    When 查詢完成
    Then 系統應該觸發 "TeamListRetrieved" event，資料為：
      | teams      | [T001, T002] |
      | totalCount | 2            |
    And 列表應該顯示 2 筆結果
    And 結果應該包含球隊 "勇士隊"
    And 結果應該包含球隊 "老虎隊"
    And 結果不應該包含球隊 "飛鷹隊"
    And UI 應該隱藏載入中狀態

  @happy-path @command @ui
  Scenario: 成功選擇球隊
    # Preconditions
    Given 球隊列表已顯示以下球隊：
      | teamId | teamName   |
      | T001   | 勇士隊     |
      | T002   | 老虎隊     |
    And 用戶尚未選擇任何球隊
    And Session 的 currentTeamId 為 null

    # Command Request
    When 用戶點擊球隊 "勇士隊"

    # Command Execution
    Then 系統應該發送 "SelectTeam" command，參數為：
      | teamId | T001      |
      | userId | coach-001 |

    # Precondition Validation
    And 系統應該驗證前置條件：
      | UserAuthenticated  | PASS |
      | TeamExists         | PASS |
      | UserHasTeamAccess  | PASS |

    # Events Emission
    And 系統應該觸發 "TeamSelected" event，資料為：
      | teamId   | T001      |
      | teamName | 勇士隊    |
      | userId   | coach-001 |
    And 系統應該觸發 "TeamContextEstablished" event，資料為：
      | teamId    | T001                |
      | sessionId | session-xyz-123     |

    # Postconditions
    And 球隊 "勇士隊" 應該被標記為已選擇狀態
    And Session 的 currentTeamId 應該為 "T001"
    And UI 應該顯示球隊詳細資訊面板

  @validation @command
  Scenario: 選擇不存在的球隊應該失敗
    # Preconditions
    Given 用戶位於球隊管理頁面

    # Command Request (Invalid)
    When 用戶嘗試選擇球隊 ID "T999"

    # Precondition Validation Failure
    Then 系統應該驗證前置條件：
      | UserAuthenticated  | PASS |
      | TeamExists         | FAIL |
    And 系統應該拒絕 "SelectTeam" command

    # Validation Failure
    And 系統應該觸發 "ValidationFailed" event，資料為：
      | errorType    | TeamNotFound |
      | errorMessage | 球隊不存在   |
    And UI 應該顯示錯誤訊息 "球隊不存在"
    And 系統狀態不應該改變
    And Session 的 currentTeamId 應該維持 null

  @validation @query
  Scenario Outline: 無效的分頁參數應該被拒絕
    # Preconditions
    Given 用戶位於球隊管理頁面

    # Query Request (Invalid)
    When 用戶輸入分頁參數：
      | page     | <page>     |
      | pageSize | <pageSize> |
    And 用戶點擊查詢按鈕

    # Validation Failure
    Then 系統應該驗證前置條件：
      | UserAuthenticated     | PASS  |
      | ValidPaginationParams | <validationResult> |
    And 系統應該拒絕 "QueryTeamList" command
    And 系統應該觸發 "ValidationFailed" event
    And UI 應該顯示錯誤訊息 "<errorMessage>"
    And 列表不應該更新

    Examples:
      | page | pageSize | validationResult | errorMessage                      |
      | 0    | 20       | FAIL             | 頁碼必須大於 0                    |
      | 1    | 5        | FAIL             | 每頁筆數必須在 10-100 之間        |
      | 1    | 150      | FAIL             | 每頁筆數必須在 10-100 之間        |
      | -1   | 20       | FAIL             | 頁碼必須大於 0                    |

  @policy @automation
  Scenario: 選擇球隊後自動載入球員列表
    # Preconditions
    Given 球隊列表已載入完成
    And 球隊 "T001" 有 12 名球員

    # Command Request
    When 用戶選擇球隊 "T001"

    # Policy Trigger
    Then 系統應該觸發 "TeamSelected" event
    And Policy "AutoLoadPlayersOnTeamSelection" 應該被觸發

    # Automated Action
    Then 系統應該自動發送 "QueryPlayerList" command，參數為：
      | teamId | T001      |
      | userId | coach-001 |

    # Postconditions
    And UI 球員列表區域應該顯示載入中狀態
    When 球員資料載入完成
    Then 系統應該觸發 "PlayerListRetrieved" event，資料為：
      | players    | [12 players] |
      | totalCount | 12           |
      | teamId     | T001         |
    And UI 球員列表應該顯示 12 名球員

  @edge-case @query
  Scenario: 查詢結果為空應該正確處理
    # Preconditions
    Given 用戶位於球隊管理頁面
    And 系統中沒有符合條件的球隊

    # Query Request
    When 用戶輸入查詢條件：
      | status | Archived |
    And 用戶點擊查詢按鈕

    # Postconditions
    Then 系統應該觸發 "TeamListRetrieved" event，資料為：
      | teams      | []  |
      | totalCount | 0   |
    And UI 應該顯示 "無符合條件的球隊" 訊息
    And UI 列表應該顯示空狀態提示

  @ui @state-management
  Scenario: 前端狀態正確管理
    # Preconditions
    Given 用戶位於球隊管理頁面
    And 組件的 localState.selectedTeamId 為 null

    # UI Interaction
    When 用戶點擊球隊 "T001"

    # State Changes
    Then 組件的 localState.selectedTeamId 應該更新為 "T001"
    And globalState.currentUser 不應該改變
    And 組件應該重新渲染

    # Event Subscription
    When "TeamSelected" event 被觸發
    Then TeamDetailPanel 組件應該收到通知
    And TeamDetailPanel 應該開始載入球隊詳細資訊

---

## US-B2: 球隊維護（建立/編輯/刪除）

Feature: 球隊維護
  身為 管理者/教練
  我想要 維護球隊資料
  以便 確保名單正確

  Background:
    Given 用戶 "admin-001" 已登入系統
    And 用戶擁有 "team:create", "team:update", "team:delete" 權限

  @happy-path @command
  Scenario: 成功建立新球隊
    # Preconditions
    Given 用戶位於球隊管理頁面
    And 系統中不存在名為 "閃電隊" 的球隊

    # Command Request
    When 用戶點擊 "建立球隊" 按鈕
    And 用戶輸入球隊資料：
      | teamName    | 閃電隊           |
      | description | 2024 新成立球隊  |
    And 用戶點擊 "確認建立" 按鈕

    # Command Execution
    Then 系統應該發送 "CreateTeam" command，參數為：
      | teamName    | 閃電隊           |
      | description | 2024 新成立球隊  |
      | userId      | admin-001        |

    # Precondition Validation
    And 系統應該驗證前置條件：
      | UserAuthenticated        | PASS |
      | UserHasCreatePermission  | PASS |
      | TeamNameNotEmpty         | PASS |
      | UniqueTeamName           | PASS |

    # Events Emission
    And 系統應該觸發 "TeamCreationRequested" event
    And 系統應該觸發 "TeamValidated" event，資料為：
      | validationResult | PASS |
    And 系統應該觸發 "TeamCreated" event，資料為：
      | teamId      | T004             |
      | teamName    | 閃電隊           |
      | description | 2024 新成立球隊  |
      | status      | Active           |

    # Postconditions
    And 新球隊 "閃電隊" 應該存在於系統中
    And 球隊狀態應該為 "Active"
    And UI 應該顯示成功訊息 "球隊建立成功"
    And 球隊列表應該自動重新載入

  @validation @command
  Scenario: 球隊名稱為空應該被拒絕
    # Command Request (Invalid)
    When 用戶嘗試建立球隊，參數為：
      | teamName    |      |
      | description | 測試 |

    # Validation Failure
    Then 系統應該驗證前置條件：
      | TeamNameNotEmpty | FAIL |
    And 系統應該拒絕 "CreateTeam" command
    And 系統應該觸發 "ValidationFailed" event，資料為：
      | field        | teamName       |
      | errorMessage | 球隊名稱不可為空 |
    And UI 應該顯示錯誤訊息 "球隊名稱不可為空"

  @validation @command
  Scenario: 重複的球隊名稱應該被拒絕
    # Preconditions
    Given 系統中已存在名為 "勇士隊" 的球隊

    # Command Request (Invalid)
    When 用戶嘗試建立球隊，參數為：
      | teamName | 勇士隊 |

    # Validation Failure
    Then 系統應該驗證前置條件：
      | UniqueTeamName | FAIL |
    And 系統應該拒絕 "CreateTeam" command
    And UI 應該顯示錯誤訊息 "球隊名稱 勇士隊 已存在"

  @happy-path @command
  Scenario: 成功更新球隊資料
    # Preconditions
    Given 系統中存在球隊：
      | teamId | teamName | description |
      | T001   | 勇士隊   | 老牌球隊    |

    # Command Request
    When 用戶選擇球隊 "T001"
    And 用戶點擊 "編輯" 按鈕
    And 用戶修改球隊資料：
      | description | 老牌強隊，成立於 2020 |
    And 用戶點擊 "確認更新" 按鈕

    # Command Execution
    Then 系統應該發送 "UpdateTeam" command，參數為：
      | teamId      | T001                      |
      | description | 老牌強隊，成立於 2020     |
      | userId      | admin-001                 |

    # Events Emission
    And 系統應該觸發 "TeamUpdateRequested" event
    And 系統應該觸發 "TeamValidated" event
    And 系統應該觸發 "TeamUpdated" event，資料為：
      | teamId         | T001                      |
      | updatedFields  | {"description": "..."}    |
      | previousValues | {"description": "老牌球隊"} |

    # Postconditions
    And 球隊 "T001" 的 description 應該為 "老牌強隊，成立於 2020"
    And UI 應該顯示成功訊息 "球隊資料更新成功"

  @happy-path @command
  Scenario: 成功刪除球隊（軟刪除）
    # Preconditions
    Given 系統中存在球隊 "T003"
    And 球隊 "T003" 沒有啟用中的球員

    # Command Request
    When 用戶選擇球隊 "T003"
    And 用戶點擊 "刪除" 按鈕
    And 用戶確認刪除操作

    # Command Execution
    Then 系統應該發送 "DeleteTeam" command，參數為：
      | teamId | T003      |
      | userId | admin-001 |

    # Precondition Validation
    And 系統應該驗證前置條件：
      | NoActivePlayers | PASS |

    # Events Emission
    And 系統應該觸發 "TeamDeletionRequested" event
    And 系統應該觸發 "TeamDeleted" event，資料為：
      | teamId    | T003      |
      | deletedBy | admin-001 |

    # Postconditions
    And 球隊 "T003" 的狀態應該為 "Inactive"
    And 球隊列表中不應該顯示 "T003"（預設只顯示 Active）
    And UI 應該顯示成功訊息 "球隊已刪除"

  @validation @command
  Scenario: 有球員的球隊無法刪除
    # Preconditions
    Given 系統中存在球隊 "T001"
    And 球隊 "T001" 有 5 名啟用中的球員

    # Command Request
    When 用戶嘗試刪除球隊 "T001"

    # Validation Failure
    Then 系統應該驗證前置條件：
      | NoActivePlayers | FAIL |
    And 系統應該拒絕 "DeleteTeam" command
    And UI 應該顯示錯誤訊息 "球隊仍有啟用中的球員，無法刪除"

---

## US-B3: 球員維護（列表/新增/編輯/刪除）

Feature: 球員維護
  身為 管理者/教練
  我想要 維護球員名單
  以便 用於訓練與分析

  Background:
    Given 用戶 "coach-001" 已登入系統
    And 用戶已選擇球隊 "T001"
    And Session 的 currentTeamId 為 "T001"

  @happy-path @query @ui
  Scenario: 成功查詢球員列表
    # Preconditions
    Given 球隊 "T001" 有以下球員：
      | playerId | jerseyNumber | name   | position |
      | P001     | 1            | 王小明 | P        |
      | P002     | 10           | 李大華 | C        |
      | P003     | 25           | 張三   | 1B       |

    # Query Request
    When 用戶進入球員管理頁面

    # Command Execution
    Then 系統應該自動發送 "QueryPlayerList" command，參數為：
      | teamId | T001      |
      | userId | coach-001 |

    # Events Emission
    And 系統應該觸發 "PlayerListQueried" event
    And 系統應該觸發 "PlayerListRetrieved" event，資料為：
      | players    | [P001, P002, P003] |
      | totalCount | 3                  |
      | teamId     | T001               |

    # Postconditions
    And UI 應該顯示 3 名球員
    And 球員列表應該按照 sortOrder 排序

  @happy-path @command
  Scenario: 成功新增球員
    # Preconditions
    Given 球隊 "T001" 不存在背號 "15" 的球員

    # Command Request
    When 用戶點擊 "新增球員" 按鈕
    And 用戶輸入球員資料：
      | jerseyNumber | 15     |
      | name         | 陳小華 |
      | height       | 175    |
      | position     | SS     |
    And 用戶點擊 "確認新增" 按鈕

    # Command Execution
    Then 系統應該發送 "CreatePlayer" command，參數為：
      | teamId       | T001   |
      | jerseyNumber | 15     |
      | name         | 陳小華 |
      | height       | 175    |
      | position     | SS     |
      | userId       | coach-001 |

    # Precondition Validation
    And 系統應該驗證前置條件：
      | UserAuthenticated            | PASS |
      | TeamExists                   | PASS |
      | UserHasCreatePlayerPermission| PASS |
      | UniqueJerseyNumber           | PASS |
      | ValidJerseyNumber            | PASS |
      | ValidHeight                  | PASS |
      | ValidPosition                | PASS |
      | PlayerNameNotEmpty           | PASS |

    # Events Emission
    And 系統應該觸發 "PlayerCreationRequested" event
    And 系統應該觸發 "PlayerValidated" event，資料為：
      | validationResult | PASS |
    And 系統應該觸發 "PlayerCreated" event，資料為：
      | playerId     | P004   |
      | teamId       | T001   |
      | jerseyNumber | 15     |
      | name         | 陳小華 |
      | height       | 175    |
      | position     | SS     |
      | sortOrder    | 4      |
      | status       | Active |

    # Postconditions
    And 球員 "陳小華" 應該存在於球隊 "T001"
    And sortOrder 應該自動分配為 4
    And UI 應該顯示成功訊息 "球員新增成功"
    And 球員列表應該自動重新載入

  @validation @command
  Scenario Outline: 無效的球員資料應該被拒絕
    # Command Request (Invalid)
    When 用戶嘗試新增球員，參數為：
      | jerseyNumber | <jerseyNumber> |
      | name         | <name>         |
      | height       | <height>       |
      | position     | <position>     |

    # Validation Failure
    Then 系統應該驗證前置條件，結果為：
      | <validationRule> | FAIL |
    And 系統應該拒絕 "CreatePlayer" command
    And 系統應該觸發 "ValidationFailed" event
    And UI 應該顯示錯誤訊息 "<errorMessage>"

    Examples:
      | jerseyNumber | name   | height | position | validationRule      | errorMessage                      |
      | 1            | 測試   | 175    | P        | UniqueJerseyNumber  | 背號 1 已被使用                   |
      | 100          | 測試   | 175    | P        | ValidJerseyNumber   | 背號必須在 0-99 之間              |
      | 20           |        | 175    | P        | PlayerNameNotEmpty  | 球員姓名不可為空                  |
      | 20           | 測試   | 100    | P        | ValidHeight         | 身高必須在 150-250 公分之間       |
      | 20           | 測試   | 175    | XX       | ValidPosition       | 無效的守備位置：XX                |

  @happy-path @command
  Scenario: 成功更新球員資料
    # Preconditions
    Given 系統中存在球員：
      | playerId | jerseyNumber | name   | height | position |
      | P001     | 1            | 王小明 | 180    | P        |

    # Command Request
    When 用戶點擊球員 "P001" 的 "編輯" 按鈕
    And 用戶修改球員資料：
      | height | 182 |
    And 用戶點擊 "確認更新" 按鈕

    # Command Execution
    Then 系統應該發送 "UpdatePlayer" command，參數為：
      | playerId | P001      |
      | height   | 182       |
      | userId   | coach-001 |

    # Events Emission
    And 系統應該觸發 "PlayerUpdateRequested" event
    And 系統應該觸發 "PlayerValidated" event
    And 系統應該觸發 "PlayerUpdated" event，資料為：
      | playerId       | P001                    |
      | updatedFields  | {"height": 182}         |
      | previousValues | {"height": 180}         |

    # Postconditions
    And 球員 "P001" 的 height 應該為 182
    And UI 應該顯示成功訊息 "球員資料更新成功"

  @happy-path @command
  Scenario: 成功刪除球員
    # Preconditions
    Given 系統中存在球員 "P005"
    And 球員 "P005" 的 sortOrder 為 5
    And 球隊有 5 名球員

    # Command Request
    When 用戶點擊球員 "P005" 的 "刪除" 按鈕
    And 用戶確認刪除操作

    # Command Execution
    Then 系統應該發送 "DeletePlayer" command，參數為：
      | playerId | P005      |
      | userId   | coach-001 |

    # Events Emission
    And 系統應該觸發 "PlayerDeletionRequested" event
    And 系統應該觸發 "PlayerDeleted" event，資料為：
      | playerId  | P005      |
      | teamId    | T001      |
      | deletedBy | coach-001 |

    # Postconditions
    And 球員 "P005" 的狀態應該為 "Inactive"
    And 其他球員的 sortOrder 應該重新整理（sortOrder > 5 的減 1）
    And 球員列表應該顯示 4 名球員
    And UI 應該顯示成功訊息 "球員已刪除"

---

## US-B4: 球員排序調整

Feature: 球員排序調整
  身為 管理者/教練
  我想要 調整球員排序
  以便 符合教練習慣或出賽順序

  Background:
    Given 用戶 "coach-001" 已登入系統
    And 用戶已選擇球隊 "T001"
    And 球隊 "T001" 有以下球員：
      | playerId | name   | sortOrder |
      | P001     | 王小明 | 1         |
      | P002     | 李大華 | 2         |
      | P003     | 張三   | 3         |
      | P004     | 陳小華 | 4         |

  @happy-path @command @ui
  Scenario: 成功調整球員排序（拖放操作）
    # Preconditions
    Given 用戶位於球員排序調整頁面

    # UI Interaction
    When 用戶拖動球員 "P004" (陳小華)
    And 用戶將其放到位置 2（李大華之後）

    # Command Request
    Then UI 應該更新預覽排序為：
      | playerId | name   | sortOrder |
      | P001     | 王小明 | 1         |
      | P004     | 陳小華 | 2         |
      | P002     | 李大華 | 3         |
      | P003     | 張三   | 4         |

    # Command Execution
    When 用戶點擊 "儲存排序" 按鈕
    Then 系統應該發送 "UpdatePlayerOrder" command，參數為：
      | teamId       | T001 |
      | playerOrders | [{"playerId": "P001", "sortOrder": 1}, {"playerId": "P004", "sortOrder": 2}, {"playerId": "P002", "sortOrder": 3}, {"playerId": "P003", "sortOrder": 4}] |
      | userId       | coach-001 |

    # Precondition Validation
    And 系統應該驗證前置條件：
      | UserAuthenticated          | PASS |
      | TeamSelected               | PASS |
      | PlayersBelongToTeam        | PASS |
      | UniqueOrderValues          | PASS |
      | ConsecutiveOrdering        | PASS |
      | UserHasUpdateOrderPermission| PASS |

    # Events Emission
    And 系統應該觸發 "PlayerOrderChangeRequested" event
    And 系統應該觸發 "PlayerOrderValidated" event，資料為：
      | validationResult | PASS |
    And 系統應該觸發 "PlayerOrderChanged" event，資料為：
      | teamId       | T001        |
      | playerOrders | [updated orders] |
      | updatedBy    | coach-001   |
    And 系統應該觸發 "PlayerListRefreshed" event

    # Postconditions
    And 球員 "P001" 的 sortOrder 應該為 1
    And 球員 "P004" 的 sortOrder 應該為 2
    And 球員 "P002" 的 sortOrder 應該為 3
    And 球員 "P003" 的 sortOrder 應該為 4
    And UI 應該顯示成功訊息 "排序已更新"
    And 球員列表應該按新排序顯示

  @validation @command
  Scenario: 排序值不連續應該被拒絕
    # Command Request (Invalid)
    When 用戶嘗試更新球員排序，參數為：
      | playerOrders | [{"playerId": "P001", "sortOrder": 1}, {"playerId": "P002", "sortOrder": 3}, {"playerId": "P003", "sortOrder": 4}] |

    # Validation Failure
    Then 系統應該驗證前置條件：
      | ConsecutiveOrdering | FAIL |
    And 系統應該拒絕 "UpdatePlayerOrder" command
    And UI 應該顯示錯誤訊息 "排序值必須從 1 開始連續"

  @validation @command
  Scenario: 排序值重複應該被拒絕
    # Command Request (Invalid)
    When 用戶嘗試更新球員排序，參數為：
      | playerOrders | [{"playerId": "P001", "sortOrder": 1}, {"playerId": "P002", "sortOrder": 2}, {"playerId": "P003", "sortOrder": 2}] |

    # Validation Failure
    Then 系統應該驗證前置條件：
      | UniqueOrderValues | FAIL |
    And 系統應該拒絕 "UpdatePlayerOrder" command
    And UI 應該顯示錯誤訊息 "排序值不可重複"

  @ui @state-management
  Scenario: 拖放過程中的狀態管理
    # Preconditions
    Given 用戶位於球員排序調整頁面
    And 組件的 localState.isDragging 為 false

    # Drag Start
    When 用戶開始拖動球員 "P004"
    Then 組件的 localState.isDragging 應該更新為 true
    And 組件的 localState.draggedItem 應該為 "P004"
    And UI 應該顯示拖動中的視覺效果

    # Drag Over
    When 用戶拖動到位置 2
    Then 組件的 localState.dropTarget 應該更新為位置 2
    And UI 應該顯示放置位置提示

    # Drop
    When 用戶放開球員
    Then 組件的 localState.isDragging 應該更新為 false
    And 組件的 localState.draggedItem 應該清空
    And 組件應該計算新的排序
    And UI 應該顯示預覽排序

  @edge-case @command
  Scenario: 排序未改變時不應觸發更新
    # Preconditions
    Given 球員列表的當前排序為 [P001:1, P002:2, P003:3, P004:4]

    # Command Request (No Change)
    When 用戶將球員排序設為：
      | playerOrders | [{"playerId": "P001", "sortOrder": 1}, {"playerId": "P002", "sortOrder": 2}, {"playerId": "P003", "sortOrder": 3}, {"playerId": "P004", "sortOrder": 4}] |
    And 用戶點擊 "儲存排序" 按鈕

    # System Behavior
    Then 系統應該檢測到排序未改變
    And 系統不應該發送 "UpdatePlayerOrder" command
    And UI 應該顯示訊息 "排序未改變"

  @policy @automation
  Scenario: 排序更新後自動重新整理列表
    # Preconditions
    Given 用戶已更新球員排序

    # Policy Trigger
    When 系統觸發 "PlayerOrderChanged" event

    # Automated Action
    Then Policy "RefreshPlayerListOnOrderChange" 應該被觸發
    And 系統應該觸發 "PlayerListRefreshed" event，資料為：
      | teamId  | T001              |
      | players | [updated list]    |

    # Postconditions
    And UI 球員列表應該自動重新載入
    And 球員應該按新排序顯示
