# 檔案名稱：US-B1-team-query-and-selection.feature

Feature: 球隊列表查詢與選擇
  身為 管理者/教練
  我想要 查詢並選擇球隊
  以便 管理該隊球員

  Background:
    Given 用戶已登入系統
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
      | userId     | user-001                 |
      | filters    | {"status": "Active"}     |
      | pagination | {"page": 1, "pageSize": 20} |
    
    # Events Emission
    And 系統應該觸發 "TeamListQueried" event
    And 系統應該顯示載入中狀態
    
    # Postconditions
    When 查詢完成
    Then 系統應該觸發 "TeamListRetrieved" event
    And 列表應該顯示 2 筆結果
    And 結果應該包含球隊 "勇士隊"
    And 結果應該包含球隊 "老虎隊"
    And 結果不應該包含球隊 "飛鷹隊"
    And 系統應該隱藏載入中狀態

  @happy-path @command @ui
  Scenario: 成功選擇球隊
    # Preconditions
    Given 球隊列表已顯示以下球隊：
      | teamId | teamName   |
      | T001   | 勇士隊     |
      | T002   | 老虎隊     |
    And 用戶尚未選擇任何球隊
    
    # Command Request
    When 用戶點擊球隊 "勇士隊"
    
    # Command Execution
    Then 系統應該發送 "SelectTeam" command，參數為：
      | teamId | T001      |
      | userId | user-001  |
    
    # Preconditions Validation
    And 系統應該驗證前置條件：
      | UserAuthenticated    | PASS |
      | TeamExists          | PASS |
      | UserHasTeamAccess   | PASS |
    
    # Events Emission
    And 系統應該觸發 "TeamSelected" event，資料為：
      | teamId   | T001      |
      | teamName | 勇士隊    |
      | userId   | user-001  |
    And 系統應該觸發 "TeamContextEstablished" event
    
    # Postconditions
    And 球隊 "勇士隊" 應該被標記為已選擇狀態
    And 系統應該建立球隊操作上下文
    And Session 的 currentTeamId 應該為 "T001"

  @validation @command
  Scenario: 選擇不存在的球隊應該失敗
    # Preconditions
    Given 用戶位於球隊管理頁面
    
    # Command Request (Invalid)
    When 用戶嘗試選擇球隊 ID "T999"
    
    # Command Execution
    Then 系統應該發送 "SelectTeam" command
    
    # Preconditions Validation
    And 系統應該驗證前置條件：
      | UserAuthenticated    | PASS |
      | TeamExists          | FAIL |
    
    # Validation Failure
    Then 系統應該拒絕 "SelectTeam" command
    And 系統應該觸發 "ValidationFailed" event
    And 錯誤類型應該為 "TeamNotFound"
    And 應該顯示錯誤訊息 "球隊不存在"
    And 系統狀態不應該改變

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
    Then 系統應該拒絕 "QueryTeamList" command
    And 系統應該觸發 "ValidationFailed" event
    And 驗證規則 "<failedRule>" 應該失敗
    And 應該顯示錯誤訊息 "<errorMessage>"
    And 列表不應該更新

    Examples:
      | page | pageSize | failedRule       | errorMessage                      |
      | 0    | 20       | ValidPageNumber  | 頁碼必須大於 0                    |
      | 1    | 5        | ValidPageSize    | 每頁筆數必須在 10-100 之間        |
      | 1    | 150      | ValidPageSize    | 每頁筆數必須在 10-100 之間        |
      | -1   | 20       | ValidPageNumber  | 頁碼必須大於 0                    |

  @policy @automation
  Scenario: 選擇球隊後自動載入球員列表
    # Preconditions
    Given 球隊列表已載入完成
    And 球隊 "T001" 有 12 名球員
    
    # Command Request
    When 用戶選擇球隊 "T001"
    
    # Events Emission
    Then 系統應該觸發 "TeamSelected" event
    
    # Policy Trigger
    And Policy "AutoLoadPlayersOnTeamSelection" 應該被觸發
    And 系統應該觸發 "PlayerListAutoLoadTriggered" event
    
    # Automated Action
    Then 系統應該自動發送 "QueryPlayerList" command，參數為：
      | teamId | T001 |
    
    # Postconditions
    And 球員列表區域應該顯示載入中狀態
    When 球員資料載入完成
    Then 系統應該觸發 "PlayerListRetrieved" event
    And 球員列表應該顯示 12 名球員
    And 球員應該按照 sortOrder 排序

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
    And 應該顯示 "無符合條件的球隊" 訊息
    And 列表應該顯示空狀態提示

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
    And TeamInfo 子組件應該訂閱 "TeamSelected" event
    And PlayerList 子組件應該訂閱 "PlayerListRetrieved" event

  @error-handling
  Scenario: 查詢球隊列表時發生錯誤
    # Preconditions
    Given 用戶位於球隊管理頁面
    And 後端服務暫時無法使用
    
    # Query Request
    When 用戶點擊查詢按鈕
    
    # Error Handling
    Then 系統應該發送 "QueryTeamList" command
    And 系統應該觸發 "TeamListQueried" event
    And 系統應該顯示載入中狀態
    When 後端回傳錯誤
    Then 系統應該觸發 "TeamListQueryFailed" event
    And 錯誤狀態 "teamListError" 應該被設置
    And 應該顯示錯誤訊息 "載入球隊列表失敗，請稍後再試"
    And 應該提供重試按鈕
    And 系統應該隱藏載入中狀態

  @command @authorization
  Scenario: 用戶沒有權限選擇球隊
    # Preconditions
    Given 用戶已登入系統
    And 球隊 "T001" 存在
    And 用戶沒有存取球隊 "T001" 的權限
    
    # Command Request
    When 用戶嘗試選擇球隊 "T001"
    
    # Preconditions Validation
    Then 系統應該驗證前置條件：
      | UserAuthenticated    | PASS |
      | TeamExists          | PASS |
      | UserHasTeamAccess   | FAIL |
    
    # Authorization Failure
    And 系統應該拒絕 "SelectTeam" command
    And 系統應該觸發 "AuthorizationFailed" event
    And 應該顯示錯誤訊息 "您沒有權限存取此球隊"
    And 系統狀態不應該改變
