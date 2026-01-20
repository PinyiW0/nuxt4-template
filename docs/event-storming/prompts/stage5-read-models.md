# Stage 5: Read Models & Views 設計

## 目的
設計查詢模型和 UI 視圖需求

## 輸入
- Stage 1 輸出：Domain Events List
- Stage 3 輸出：Aggregates Structure
- User Story

## 輸出
- Read Models & UI Views（JSON 格式）

## 執行指引

### Step 7: 展開 Read Model（查詢介面）
- 設計專門用於查詢的資料模型（與 Aggregate 分離）
- 定義 UI Views 和組件結構
- 標註每個 View 需要訂閱哪些 Events
- 定義前後端資料契約

### 設計原則
1. **CQRS 分離**：Read Model 與 Write Model（Aggregate）分離
2. **為查詢優化**：結構設計符合 UI 顯示需求
3. **Event Sourcing**：透過訂閱 Events 更新 Read Model
4. **最終一致性**：允許 Read Model 有短暫延遲

### Read Model 類型
1. **List View Model**：列表顯示用
2. **Detail View Model**：詳細資訊顯示用
3. **Summary View Model**：摘要/儀表板用
4. **Search View Model**：搜尋結果用

## Prompt Template

你是一位前端架構師，請設計 Read Models 和 UI Views。

### 輸入資料

#### User Story
將 User Story 內容貼上這裡

#### Domain Events
將 Stage 1 的輸出 JSON 貼上這裡

#### Aggregates
將 Stage 3 的輸出 JSON 貼上這裡

### 任務要求
1. 設計 Read Models（專門用於查詢的資料模型）
2. 定義 UI Views 和組件結構
3. 標註每個 View 需要訂閱哪些 Events
4. 定義 View 的狀態管理需求
5. 明確前後端資料契約（API Endpoints）
6. 為每個 Read Model 定義更新觸發條件
7. 區分 Command UI 和 Query UI 的設計
8. 定義 Loading/Error 狀態處理

### 輸出格式（JSON）

```json
{
  "userStoryId": "US-B1",
  "readModels": [
    {
      "modelName": "TeamListViewModel",
      "description": "球隊列表的視圖模型",
      "type": "ListView",
      "properties": [
        {
          "name": "teams",
          "type": "Array<TeamSummary>",
          "description": "球隊摘要列表"
        },
        {
          "name": "totalCount",
          "type": "number",
          "description": "總筆數"
        },
        {
          "name": "currentPage",
          "type": "number",
          "description": "當前頁碼"
        },
        {
          "name": "pageSize",
          "type": "number",
          "description": "每頁筆數"
        },
        {
          "name": "filters",
          "type": "TeamFilters",
          "description": "當前套用的篩選條件"
        }
      ],
      "nestedTypes": [
        {
          "name": "TeamSummary",
          "properties": [
            { "name": "id", "type": "string" },
            { "name": "name", "type": "string" },
            { "name": "playerCount", "type": "number" },
            { "name": "status", "type": "string" },
            { "name": "lastUpdated", "type": "DateTime" }
          ]
        }
      ],
      "updatedBy": [
        "TeamListRetrieved",
        "TeamCreated",
        "TeamUpdated",
        "TeamDeleted"
      ],
      "queryEndpoint": {
        "method": "GET",
        "path": "/api/teams",
        "queryParams": ["page", "pageSize", "filters"]
      }
    },
    {
      "modelName": "SelectedTeamViewModel",
      "description": "當前選擇的球隊詳細資訊",
      "type": "DetailView",
      "properties": [
        {
          "name": "team",
          "type": "TeamDetail",
          "description": "球隊詳細資訊"
        },
        {
          "name": "players",
          "type": "Array<PlayerSummary>",
          "description": "球隊球員列表"
        },
        {
          "name": "isSelected",
          "type": "boolean",
          "description": "是否為當前選擇"
        }
      ],
      "nestedTypes": [
        {
          "name": "TeamDetail",
          "properties": [
            { "name": "id", "type": "string" },
            { "name": "name", "type": "string" },
            { "name": "description", "type": "string" },
            { "name": "createdAt", "type": "DateTime" }
          ]
        },
        {
          "name": "PlayerSummary",
          "properties": [
            { "name": "id", "type": "string" },
            { "name": "jerseyNumber", "type": "number" },
            { "name": "name", "type": "string" },
            { "name": "position", "type": "string" }
          ]
        }
      ],
      "updatedBy": [
        "TeamSelected",
        "TeamContextEstablished",
        "PlayerListRetrieved"
      ],
      "queryEndpoint": {
        "method": "GET",
        "path": "/api/teams/{teamId}",
        "pathParams": ["teamId"]
      }
    }
  ],
  "uiViews": [
    {
      "viewName": "TeamManagementView",
      "description": "球隊管理主頁面",
      "route": "/teams",
      "components": [
        {
          "componentName": "TeamListPanel",
          "type": "Container",
          "description": "球隊列表面板",
          "children": [
            {
              "componentName": "SearchBar",
              "type": "Input",
              "emitsCommands": ["QueryTeamList"],
              "localState": ["searchKeyword", "filters"]
            },
            {
              "componentName": "TeamGrid",
              "type": "DataGrid",
              "subscribesTo": ["TeamListRetrieved", "TeamCreated", "TeamDeleted"],
              "emitsCommands": ["SelectTeam"],
              "readModel": "TeamListViewModel"
            },
            {
              "componentName": "Pagination",
              "type": "Navigation",
              "subscribesTo": ["TeamListRetrieved"],
              "emitsCommands": ["QueryTeamList"],
              "localState": ["currentPage"]
            }
          ]
        },
        {
          "componentName": "TeamDetailPanel",
          "type": "Container",
          "description": "選中球隊的詳細資訊",
          "children": [
            {
              "componentName": "TeamInfo",
              "type": "Display",
              "subscribesTo": ["TeamSelected"],
              "readModel": "SelectedTeamViewModel"
            },
            {
              "componentName": "PlayerList",
              "type": "DataList",
              "subscribesTo": ["PlayerListRetrieved", "PlayerCreated"],
              "readModel": "SelectedTeamViewModel.players"
            }
          ]
        }
      ],
      "stateManagement": {
        "localState": [
          "selectedTeamId",
          "searchFilters",
          "currentPage"
        ],
        "globalState": [
          "currentUser",
          "teamListCache"
        ]
      },
      "loadingStates": [
        {
          "state": "loadingTeamList",
          "triggers": ["QueryTeamList"],
          "clears": ["TeamListRetrieved"]
        },
        {
          "state": "loadingTeamDetail",
          "triggers": ["SelectTeam"],
          "clears": ["TeamContextEstablished"]
        }
      ],
      "errorStates": [
        {
          "state": "teamListError",
          "triggers": ["TeamListQueryFailed"],
          "display": "ErrorBanner"
        }
      ]
    }
  ],
  "apiContracts": [
    {
      "endpoint": "/api/teams",
      "method": "GET",
      "description": "查詢球隊列表",
      "queryParams": {
        "page": { "type": "number", "required": false, "default": 1 },
        "pageSize": { "type": "number", "required": false, "default": 20 },
        "status": { "type": "string", "required": false },
        "nameKeyword": { "type": "string", "required": false }
      },
      "response": {
        "type": "TeamListViewModel",
        "statusCode": 200
      }
    },
    {
      "endpoint": "/api/teams/{teamId}",
      "method": "GET",
      "description": "查詢球隊詳細資訊",
      "pathParams": {
        "teamId": { "type": "string", "required": true }
      },
      "response": {
        "type": "SelectedTeamViewModel",
        "statusCode": 200
      }
    }
  ]
}
```

請開始分析。

## 驗證檢查清單

產出的 Read Models & Views 應該滿足：
- [ ] 每個 Read Model 都有明確的 type（ListView/DetailView/SummaryView）
- [ ] 定義了完整的 properties 和 nestedTypes
- [ ] 標註了 updatedBy（訂閱的 Events）
- [ ] 定義了 queryEndpoint（API 契約）
- [ ] UI Views 包含完整的組件樹
- [ ] 組件標註了 subscribesTo 和 emitsCommands
- [ ] 定義了 stateManagement（local/global）
- [ ] 定義了 loadingStates 和 errorStates
- [ ] API Contracts 完整定義了 request/response

## 範例參考

### 輸入：US-B3 球員維護
Commands:
- CreatePlayer, UpdatePlayer, DeletePlayer, QueryPlayerList

### 輸出：Read Models
```json
{
  "userStoryId": "US-B3",
  "readModels": [
    {
      "modelName": "PlayerListViewModel",
      "description": "球員列表視圖模型",
      "type": "ListView",
      "properties": [
        {
          "name": "teamId",
          "type": "string",
          "description": "所屬球隊識別碼"
        },
        {
          "name": "players",
          "type": "Array<PlayerDetail>",
          "description": "球員詳細列表"
        }
      ],
      "nestedTypes": [
        {
          "name": "PlayerDetail",
          "properties": [
            { "name": "id", "type": "string" },
            { "name": "jerseyNumber", "type": "number" },
            { "name": "name", "type": "string" },
            { "name": "height", "type": "number" },
            { "name": "position", "type": "string" },
            { "name": "sortOrder", "type": "number" }
          ]
        }
      ],
      "updatedBy": [
        "PlayerListRetrieved",
        "PlayerCreated",
        "PlayerUpdated",
        "PlayerDeleted",
        "PlayerOrderChanged"
      ],
      "queryEndpoint": {
        "method": "GET",
        "path": "/api/teams/{teamId}/players",
        "pathParams": ["teamId"]
      }
    }
  ]
}
```

## Read Model vs Aggregate 對比

| 項目 | Aggregate（Write Model） | Read Model |
|------|-------------------------|------------|
| **目的** | 處理 Commands，保證一致性 | 優化查詢效能 |
| **結構** | 正規化，符合業務邏輯 | 非正規化，符合 UI 需求 |
| **更新方式** | 透過 Commands | 透過訂閱 Events |
| **一致性** | 強一致性（ACID） | 最終一致性 |
| **範例** | Team Aggregate（含業務規則） | TeamListViewModel（扁平化） |

## UI 組件設計原則

1. **單一職責**：每個組件只負責一個功能
2. **Event 驅動**：透過訂閱 Events 更新 UI
3. **Command 發送**：用戶交互發送 Commands
4. **狀態隔離**：區分 local state 和 global state
5. **錯誤處理**：明確定義 loading 和 error 狀態
