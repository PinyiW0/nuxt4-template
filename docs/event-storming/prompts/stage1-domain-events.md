# Stage 1: Domain Events 識別

## 目的
從 User Story 中識別出所有領域事件（已發生的事實）

## 輸入
- User Story 文件

## 輸出
- Domain Events List（JSON 格式）

## 執行指引

### Step 1: 確定 Event（切入點）
- 閱讀 User Story，識別用戶操作過程中會觸發的所有業務事件
- 事件代表「已經發生的事實」，使用過去式
- 事件應該代表業務上有意義的狀態變化

### Step 2: Event 來源是什麼？
為每個 Event 標註來源：
- **Actor**：由用戶操作觸發（如：用戶點擊、用戶輸入）
- **System**：由系統自動觸發（如：定時任務、策略規則）

### 命名規範
- 使用「過去式動詞 + 名詞」格式
- 範例：
  - TeamListQueried（球隊列表已查詢）
  - TeamSelected（球隊已選擇）
  - PlayerCreated（球員已建立）
  - PlayerOrderChanged（球員順序已變更）

### 事件分類
根據系統邊界模型，將事件分為：
1. **Command Events**：由修改型操作產生
   - 改變系統狀態
   - 範例：TeamCreated, PlayerUpdated, PlayerDeleted

2. **Query Events**：由查詢型操作產生（選擇性記錄）
   - 不改變系統狀態
   - 範例：TeamListQueried, PlayerListRetrieved

## Prompt Template

你是一位 DDD 專家，請分析以下 User Story，識別出所有的 Domain Events。

### User Story
```
{將 User Story 內容貼上這裡}
```

### 任務要求
1. 識別用戶操作過程中會觸發的所有領域事件
2. 事件命名使用「過去式動詞 + 名詞」格式（如：OrderCreated, PaymentCompleted）
3. 事件應該代表業務上有意義的狀態變化
4. 標註每個事件的來源（Actor 或 System）
5. 區分 Command Events 和 Query Events
6. 按照時間順序排列事件

### 輸出格式（JSON）

```json
{
  "userStoryId": "US-B1",
  "userStoryTitle": "球隊列表查詢與選擇",
  "domainEvents": [
    {
      "eventName": "TeamListQueried",
      "description": "用戶開始查詢球隊列表",
      "sequence": 1,
      "source": "Actor",
      "eventType": "Query",
      "data": ["queryParams", "userId", "timestamp"]
    },
    {
      "eventName": "TeamListRetrieved",
      "description": "系統回傳球隊列表資料",
      "sequence": 2,
      "source": "System",
      "eventType": "Query",
      "data": ["teams", "totalCount", "pagination"]
    },
    {
      "eventName": "TeamSelected",
      "description": "用戶選擇特定球隊",
      "sequence": 3,
      "source": "Actor",
      "eventType": "Command",
      "data": ["teamId", "userId", "timestamp"]
    }
  ],
  "notes": [
    "TeamListQueried 和 TeamListRetrieved 是查詢型操作，不改變狀態",
    "TeamSelected 是修改型操作，會改變用戶的當前選擇狀態"
  ]
}
```

請開始分析。

## 驗證檢查清單

產出的 Domain Events 應該滿足：
- [ ] 所有事件名稱使用過去式
- [ ] 每個事件都有明確的 description
- [ ] 事件按照時間順序排列（sequence）
- [ ] 標註了 source（Actor/System）
- [ ] 區分了 eventType（Command/Query）
- [ ] data 欄位列出事件攜帶的資料
- [ ] 包含 notes 欄位說明重要的業務邏輯

## 範例參考

### 輸入：US-B1 球隊列表查詢與選擇
```
**身為** 管理者/教練
**我想要** 查詢並選擇球隊
**以便** 管理該隊球員
```

### 輸出：Domain Events
```json
{
  "userStoryId": "US-B1",
  "userStoryTitle": "球隊列表查詢與選擇",
  "domainEvents": [
    {
      "eventName": "TeamListQueried",
      "description": "管理者發起球隊列表查詢",
      "sequence": 1,
      "source": "Actor",
      "eventType": "Query",
      "data": ["filters", "pagination", "userId"]
    },
    {
      "eventName": "TeamListRetrieved",
      "description": "系統回傳符合條件的球隊列表",
      "sequence": 2,
      "source": "System",
      "eventType": "Query",
      "data": ["teams", "totalCount", "currentPage"]
    },
    {
      "eventName": "TeamSelected",
      "description": "管理者選擇特定球隊",
      "sequence": 3,
      "source": "Actor",
      "eventType": "Command",
      "data": ["teamId", "teamName", "userId", "timestamp"]
    },
    {
      "eventName": "TeamContextEstablished",
      "description": "系統建立該球隊的操作上下文",
      "sequence": 4,
      "source": "System",
      "eventType": "Command",
      "data": ["teamId", "sessionId"]
    }
  ],
  "notes": [
    "Query 型操作：TeamListQueried → TeamListRetrieved",
    "Command 型操作：TeamSelected → TeamContextEstablished"
  ]
}
```
