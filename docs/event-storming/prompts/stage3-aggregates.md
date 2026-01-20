# Stage 3: Aggregates & Entities 定義

## 目的
識別領域模型中的聚合根和實體

## 輸入
- Stage 1 輸出：Domain Events List
- Stage 2 輸出：Commands List

## 輸出
- Aggregates & Entities Structure（JSON 格式）

## 執行指引

### Step 6: 建立 Aggregate（狀態）
- 識別聚合根（Aggregate Root）- 負責處理 Commands 並產生 Events
- 定義聚合內的實體（Entities）和值對象（Value Objects）
- 明確每個 Aggregate 的邊界和職責
- 確保一個 Aggregate 負責一組相關的 Commands 和 Events

### 設計原則
1. **單一職責**：每個 Aggregate 只負責一個業務概念
2. **事務邊界**：Aggregate 內的操作保證一致性
3. **最小化依賴**：Aggregate 之間通過 ID 引用，避免直接關聯

### Aggregate 組成
- **Aggregate Root**：聚合的入口點，擁有唯一識別碼
- **Entities**：聚合內有身份的物件
- **Value Objects**：無身份的值物件（不可變）

## Prompt Template

你是一位 DDD 領域建模專家，請基於以下 Commands 和 Events 定義 Aggregates 和 Entities。

### 輸入資料

#### Commands
將 Stage 2 的輸出 JSON 貼上這裡

#### Domain Events
將 Stage 1 的輸出 JSON 貼上這裡

### 任務要求
1. 識別聚合根（Aggregate Root）- 負責處理 Commands 並產生 Events
2. 定義聚合內的實體（Entities）和值對象（Value Objects）
3. 明確每個 Aggregate 的邊界和職責
4. 定義 Aggregate 之間的關聯關係（使用 ID 引用）
5. 標註每個 Aggregate 處理哪些 Commands
6. 標註每個 Aggregate 發出哪些 Events
7. 為 Command Operation 定義狀態屬性
8. 為 Query Operation 定義查詢條件

### 輸出格式（JSON）

```json
{
  "userStoryId": "US-B1",
  "aggregates": [
    {
      "aggregateName": "Team",
      "description": "球隊聚合根，管理球隊基本資料和球員關聯",
      "aggregateRoot": {
        "name": "Team",
        "properties": [
          {
            "name": "id",
            "type": "TeamId",
            "description": "球隊唯一識別碼"
          },
          {
            "name": "name",
            "type": "string",
            "description": "球隊名稱"
          },
          {
            "name": "status",
            "type": "TeamStatus",
            "description": "球隊狀態（Active/Inactive）"
          },
          {
            "name": "createdAt",
            "type": "DateTime",
            "description": "建立時間"
          }
        ]
      },
      "entities": [
        {
          "name": "Player",
          "properties": [
            {
              "name": "id",
              "type": "PlayerId",
              "description": "球員唯一識別碼"
            },
            {
              "name": "jerseyNumber",
              "type": "number",
              "description": "背號"
            },
            {
              "name": "name",
              "type": "string",
              "description": "球員姓名"
            },
            {
              "name": "height",
              "type": "number",
              "description": "身高（公分）"
            },
            {
              "name": "position",
              "type": "Position",
              "description": "守備位置"
            },
            {
              "name": "sortOrder",
              "type": "number",
              "description": "排序順序"
            }
          ]
        }
      ],
      "valueObjects": [
        {
          "name": "TeamId",
          "properties": ["value"]
        },
        {
          "name": "Position",
          "properties": ["code", "name"],
          "description": "守備位置（投手、捕手、一壘手...）"
        },
        {
          "name": "TeamStatus",
          "properties": ["value"],
          "allowedValues": ["Active", "Inactive"]
        }
      ],
      "handlesCommands": ["SelectTeam"],
      "emitsEvents": ["TeamSelected", "TeamContextEstablished"]
    },
    {
      "aggregateName": "TeamQuery",
      "description": "球隊查詢聚合，處理列表查詢邏輯",
      "aggregateRoot": {
        "name": "TeamQueryRequest",
        "properties": [
          {
            "name": "id",
            "type": "QueryId",
            "description": "查詢請求識別碼"
          },
          {
            "name": "filters",
            "type": "TeamFilters",
            "description": "查詢條件"
          },
          {
            "name": "pagination",
            "type": "Pagination",
            "description": "分頁資訊"
          }
        ]
      },
      "entities": [],
      "valueObjects": [
        {
          "name": "TeamFilters",
          "properties": ["status", "nameKeyword"]
        },
        {
          "name": "Pagination",
          "properties": ["page", "pageSize"]
        }
      ],
      "handlesCommands": ["QueryTeamList"],
      "emitsEvents": ["TeamListQueried", "TeamListRetrieved"]
    }
  ],
  "relationships": [
    {
      "from": "Team",
      "to": "Player",
      "type": "contains",
      "cardinality": "1:N",
      "description": "一個球隊包含多個球員"
    }
  ]
}
```

請開始分析。

## 驗證檢查清單

產出的 Aggregates 應該滿足：
- [ ] 每個 Aggregate 都有明確的職責描述
- [ ] Aggregate Root 有唯一識別碼（id）
- [ ] 定義了所有必要的 properties（名稱、類型、描述）
- [ ] 區分了 Entities 和 Value Objects
- [ ] 標註了 handlesCommands 和 emitsEvents
- [ ] 定義了 Aggregate 之間的關聯關係
- [ ] Command Aggregates 有狀態屬性
- [ ] Query Aggregates 有查詢條件

## 範例參考

### 輸入：US-B3 球員維護
Commands:
- CreatePlayer
- UpdatePlayer
- DeletePlayer
- QueryPlayerList

### 輸出：Aggregates
```json
{
  "userStoryId": "US-B3",
  "aggregates": [
    {
      "aggregateName": "Player",
      "description": "球員聚合根，管理球員資料生命週期",
      "aggregateRoot": {
        "name": "Player",
        "properties": [
          {
            "name": "id",
            "type": "PlayerId",
            "description": "球員唯一識別碼"
          },
          {
            "name": "teamId",
            "type": "TeamId",
            "description": "所屬球隊識別碼"
          },
          {
            "name": "jerseyNumber",
            "type": "number",
            "description": "背號"
          },
          {
            "name": "name",
            "type": "string",
            "description": "球員姓名"
          },
          {
            "name": "height",
            "type": "number",
            "description": "身高（公分）"
          },
          {
            "name": "position",
            "type": "Position",
            "description": "守備位置"
          },
          {
            "name": "sortOrder",
            "type": "number",
            "description": "排序順序"
          },
          {
            "name": "status",
            "type": "PlayerStatus",
            "description": "球員狀態"
          }
        ]
      },
      "entities": [],
      "valueObjects": [
        {
          "name": "Position",
          "properties": ["code", "name"]
        },
        {
          "name": "PlayerStatus",
          "properties": ["value"],
          "allowedValues": ["Active", "Inactive", "Injured"]
        }
      ],
      "handlesCommands": [
        "CreatePlayer",
        "UpdatePlayer",
        "DeletePlayer"
      ],
      "emitsEvents": [
        "PlayerCreated",
        "PlayerUpdated",
        "PlayerDeleted"
      ]
    }
  ],
  "relationships": [
    {
      "from": "Player",
      "to": "Team",
      "type": "belongsTo",
      "cardinality": "N:1",
      "description": "球員屬於一個球隊"
    }
  ]
}
```

## DDD 設計模式

### Command Aggregate（修改型）
```
Command → Aggregate Root
    ↓
Validate Business Rules
    ↓
Change State
    ↓
Emit Domain Event
```

### Query Aggregate（查詢型）
```
Query → Query Handler
    ↓
Build Query Criteria
    ↓
Return Read Model
```

注意：Query 通常不需要獨立的 Aggregate，可直接使用 Read Model。但若查詢邏輯複雜（如多條件組合），可建立 Query Aggregate 統一管理。
