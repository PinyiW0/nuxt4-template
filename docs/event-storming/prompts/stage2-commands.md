# Stage 2: Commands 萃取

## 目的
從 Domain Events 反推出觸發這些事件的 Commands

## 輸入
- Stage 1 輸出：Domain Events List（JSON）

## 輸出
- Commands List（JSON 格式）

## 執行指引

### Step 3: 展開 Command + Actor
- 為每個 Domain Event 識別觸發它的 Command
- 確認執行 Command 的 Actor（User/System/External Service）
- 建立 Command → Event 的映射關係

### Step 5: 確認 Input/Output 參數
- **Input**：Command 所需的參數
- **Output**：Command 執行後產生的 Event 和資料

### 命名規範
- 使用「動詞 + 名詞」格式（現在式或命令式）
- 範例：
  - QueryTeamList（查詢球隊列表）
  - SelectTeam（選擇球隊）
  - CreatePlayer（建立球員）
  - UpdatePlayerOrder（更新球員順序）

### Command 分類
根據系統邊界模型：

1. **Command Operation**（修改型）
   - 改變系統狀態
   - 產生 Domain Event
   - 需要驗證 Preconditions

2. **Query Operation**（查詢型）
   - 不改變系統狀態
   - 回傳 Read Model
   - 只需驗證權限

## Prompt Template

你是一位 CQRS 架構專家，請基於以下 Domain Events 萃取出對應的 Commands。

### 輸入的 Domain Events
將 Stage 1 的輸出貼上這裡

### 任務要求
1. 為每個 Domain Event 識別觸發它的 Command
2. Command 命名使用「動詞 + 名詞」格式（如：CreateOrder, ProcessPayment）
3. 定義 Command 所需的參數（Input）
4. 定義 Command 的輸出（產生的 Events 和資料）
5. 標註 Command 的發起者（User/System/External）
6. 區分 Command Operation 和 Query Operation
7. 建立 Command → Event 的映射關係

### 輸出格式（JSON）

```json
{
  "userStoryId": "US-B1",
  "commands": [
    {
      "commandName": "QueryTeamList",
      "description": "查詢球隊列表資料",
      "operationType": "Query",
      "actor": "User",
      "input": {
        "required": ["userId"],
        "optional": ["filters", "pagination", "sorting"]
      },
      "output": {
        "events": ["TeamListQueried", "TeamListRetrieved"],
        "data": ["teams", "totalCount", "currentPage"]
      },
      "sequence": 1
    },
    {
      "commandName": "SelectTeam",
      "description": "選擇特定球隊作為當前操作對象",
      "operationType": "Command",
      "actor": "User",
      "input": {
        "required": ["teamId", "userId"],
        "optional": []
      },
      "output": {
        "events": ["TeamSelected", "TeamContextEstablished"],
        "data": ["teamId", "sessionId"]
      },
      "sequence": 2
    }
  ],
  "commandEventMapping": [
    {
      "command": "QueryTeamList",
      "events": ["TeamListQueried", "TeamListRetrieved"],
      "operationType": "Query"
    },
    {
      "command": "SelectTeam",
      "events": ["TeamSelected", "TeamContextEstablished"],
      "operationType": "Command"
    }
  ]
}
```

請開始分析。

## 驗證檢查清單

產出的 Commands 應該滿足：
- [ ] 所有 Command 名稱使用動詞開頭
- [ ] 每個 Command 都有明確的 description
- [ ] 標註了 operationType（Command/Query）
- [ ] 標註了 actor（User/System/External）
- [ ] 定義了 input（required 和 optional）
- [ ] 定義了 output（events 和 data）
- [ ] 建立了 commandEventMapping
- [ ] Commands 按照執行順序排列

## 範例參考

### 輸入：US-B2 球隊維護
Domain Events:
- TeamCreationRequested
- TeamValidated
- TeamCreated
- TeamUpdated
- TeamDeleted

### 輸出：Commands
```json
{
  "userStoryId": "US-B2",
  "commands": [
    {
      "commandName": "CreateTeam",
      "description": "建立新的球隊",
      "operationType": "Command",
      "actor": "User",
      "input": {
        "required": ["teamName", "userId"],
        "optional": ["description", "logoUrl"]
      },
      "output": {
        "events": ["TeamCreationRequested", "TeamValidated", "TeamCreated"],
        "data": ["teamId", "teamName", "createdAt"]
      },
      "sequence": 1
    },
    {
      "commandName": "UpdateTeam",
      "description": "更新球隊資料",
      "operationType": "Command",
      "actor": "User",
      "input": {
        "required": ["teamId", "userId"],
        "optional": ["teamName", "description", "logoUrl"]
      },
      "output": {
        "events": ["TeamValidated", "TeamUpdated"],
        "data": ["teamId", "updatedFields", "updatedAt"]
      },
      "sequence": 2
    },
    {
      "commandName": "DeleteTeam",
      "description": "刪除球隊",
      "operationType": "Command",
      "actor": "User",
      "input": {
        "required": ["teamId", "userId"],
        "optional": []
      },
      "output": {
        "events": ["TeamDeleted"],
        "data": ["teamId", "deletedAt"]
      },
      "sequence": 3
    }
  ],
  "commandEventMapping": [
    {
      "command": "CreateTeam",
      "events": ["TeamCreationRequested", "TeamValidated", "TeamCreated"],
      "operationType": "Command"
    },
    {
      "command": "UpdateTeam",
      "events": ["TeamValidated", "TeamUpdated"],
      "operationType": "Command"
    },
    {
      "command": "DeleteTeam",
      "events": ["TeamDeleted"],
      "operationType": "Command"
    }
  ]
}
```

## CQRS 模式說明

### Command（修改型）
```
User → CreateTeam(input) → Validation → Aggregate.handle() → TeamCreated Event
```

### Query（查詢型）
```
User → QueryTeamList(filters) → Authorization → Read Model → Return Data
```

注意：Query 通常不產生 Domain Event，除非需要記錄查詢行為（如審計需求）。
