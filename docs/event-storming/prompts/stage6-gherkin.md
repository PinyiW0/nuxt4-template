# Stage 6: Gherkin Scenarios 生成

## 目的
生成完整的 BDD 測試場景（Gherkin DSL）

## 輸入
- 所有前階段的輸出（Stage 1-5）
- User Story

## 輸出
- Gherkin Feature Files（.feature 格式）

## 執行指引

### 將 Event Storming 翻譯為 Gherkin

#### Command Operation（修改型）
```
Preconditions → Given
Command + Input → When
Postconditions + Event → Then
```

#### Query Operation（查詢型）
```
Preconditions（權限驗證） → Given
Query 請求 → When
Read Model 回傳資料 → Then
```

### Scenario 類型

1. **Happy Path**（@happy-path）
   - 正常流程的測試場景
   - 所有條件都滿足，操作成功

2. **Validation**（@validation）
   - 驗證規則的測試場景
   - 測試前置條件不滿足的情況

3. **Edge Cases**（@edge-case）
   - 邊界情況測試
   - 測試極端值、空值等

4. **Policy**（@policy）
   - 自動化策略測試
   - 測試 Event-driven Policies

5. **UI Interaction**（@ui）
   - 前端交互測試
   - 測試組件行為和狀態變化

## Prompt Template

你是一位 BDD 測試專家，請生成完整的 Gherkin 測試場景。

### 輸入資料

#### User Story
將 User Story 內容貼上這裡

#### Domain Events
將 Stage 1 的輸出 JSON 貼上這裡

#### Commands
將 Stage 2 的輸出 JSON 貼上這裡

#### Business Rules
將 Stage 4 的輸出 JSON 貼上這裡

#### Read Models
將 Stage 5 的輸出 JSON 貼上這裡

### 任務要求
1. 為每個主要流程生成 Gherkin Feature
2. 涵蓋 Happy Path 和 Edge Cases
3. 包含前端交互和後端驗證
4. 使用 Given-When-Then 格式
5. 加入 Event Assertions（驗證事件發出）
6. 明確標註 Preconditions 和 Postconditions
7. 區分 Command Operation 和 Query Operation
8. 使用 Scenario Outline 處理多組測試資料
9. 加入適當的 Tags（@happy-path, @validation, @ui, @policy）

### 輸出格式（Gherkin）

```gherkin
# 檔案名稱：US-B1-team-query-and-selection.feature

Feature: 球隊列表查詢與選擇
  身為 管理者/教練
  我想要 查詢並選擇球隊
  以便 管理該隊球員

  Background:
    Given 用戶已登入系統
    And 系統中存在以下球隊：
      | teamId | teamName   | playerCount | status |
      | T001   | 勇士隊     | 12          | Active |
      | T002   | 老虎隊     | 10          | Active |
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
      | userId     | user-001  |
      | filters    | {"status": "Active"} |
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
    Then 系統應該拒絕 "SelectTeam" command

    # Validation Failure
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
    And 應該顯示錯誤訊息 "<errorMessage>"
    And 列表不應該更新

    Examples:
      | page | pageSize | errorMessage                      |
      | 0    | 20       | 頁碼必須大於 0                    |
      | 1    | 5        | 每頁筆數必須在 10-100 之間        |
      | 1    | 150      | 每頁筆數必須在 10-100 之間        |
      | -1   | 20       | 頁碼必須大於 0                    |

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
      | teamId | T001 |

    # Postconditions
    And 球員列表區域應該顯示載入中狀態
    When 球員資料載入完成
    Then 系統應該觸發 "PlayerListRetrieved" event
    And 球員列表應該顯示 12 名球員

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
```

請開始生成。

## 驗證檢查清單

產出的 Gherkin Scenarios 應該滿足：
- [ ] 使用標準的 Feature-Scenario-Given-When-Then 結構
- [ ] 每個 Scenario 都有適當的 Tags
- [ ] 包含 Background 定義共用的前置條件
- [ ] 明確標註 Preconditions（Given）
- [ ] 明確標註 Command/Query 執行（When）
- [ ] 明確標註 Postconditions（Then）
- [ ] 包含 Event Assertions（驗證事件發出）
- [ ] 使用 Scenario Outline 處理多組測試資料
- [ ] 涵蓋 Happy Path、Validation、Edge Cases
- [ ] 包含 Policy 自動化測試
- [ ] 包含 UI 狀態管理測試
- [ ] 所有斷言都是可測試的

## 常用 Tags

| Tag | 用途 | 範例 |
|-----|------|------|
| @happy-path | 正常流程 | 成功查詢列表 |
| @validation | 驗證規則 | 參數驗證失敗 |
| @edge-case | 邊界情況 | 空結果、極大值 |
| @policy | 自動化策略 | 事件觸發其他操作 |
| @ui | UI 交互 | 組件狀態變化 |
| @command | 修改型操作 | CreateTeam, UpdatePlayer |
| @query | 查詢型操作 | QueryTeamList |
| @state-management | 狀態管理 | localState, globalState |
| @error-handling | 錯誤處理 | 異常情況處理 |

## Gherkin 最佳實踐

1. **使用業務語言**：避免技術術語，讓非技術人員也能理解
2. **單一職責**：每個 Scenario 只測試一個功能點
3. **可執行性**：所有 Given-When-Then 都應該可自動化執行
4. **資料表格化**：使用表格讓測試資料清晰
5. **Event-Driven**：明確標註事件的觸發和訂閱
6. **狀態驗證**：檢查操作前後的狀態變化
