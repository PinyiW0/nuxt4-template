# Stage 4: Policies & Business Rules 梳理

## 目的
定義業務規則和策略（Policies）

## 輸入
- Stage 2 輸出：Commands List
- Stage 3 輸出：Aggregates Structure

## 輸出
- Business Rules & Policies（JSON 格式）

## 執行指引

### Step 4: 展開 Rules（前/後置條件）

#### Preconditions（前置條件）
執行操作前必須滿足的條件：
- 權限驗證：用戶是否有權限執行該操作
- 資料驗證：輸入參數是否符合格式要求
- 業務約束：是否符合業務邏輯規則
- 狀態檢查：Aggregate 當前狀態是否允許此操作

#### Postconditions（後置條件）
執行成功後系統應達到的狀態：
- 狀態變更：Aggregate 的狀態改變
- Event 產生：發出對應的 Domain Event
- 資料一致性：相關資料保持一致
- 副作用觸發：觸發其他 Policies 或 Commands

### Rules 分類

1. **Validation Rules**
   - Command 執行前的驗證規則
   - 對應 Gherkin 的 **Given**

2. **Business Invariants**
   - 必須始終保持的業務約束
   - 對應 Gherkin 的 **Then** (驗證部分)

3. **Event-driven Policies**
   - 當某事件發生時觸發的自動化流程
   - 對應 Gherkin 的 **When-Then** (自動化部分)

## Prompt Template

你是一位業務分析專家，請定義系統的業務規則和策略。

### 輸入資料

#### Commands
將 Stage 2 的輸出 JSON 貼上這裡

#### Aggregates
將 Stage 3 的輸出 JSON 貼上這裡

### 任務要求
1. 為每個 Command 定義 Preconditions（前置條件）
2. 為每個 Command 定義 Postconditions（後置條件）
3. 識別 Event-driven Policies（當某事件發生時觸發的自動化流程）
4. 定義 Validation Rules（Command 執行前的驗證規則）
5. 定義 Business Invariants（必須始終保持的業務約束）
6. 標註每個 Policy 的觸發條件和執行動作
7. 明確區分 Command Operation 和 Query Operation 的規則差異

### 輸出格式（JSON）

```json
{
  "userStoryId": "US-B1",
  "commandRules": [
    {
      "commandName": "SelectTeam",
      "operationType": "Command",
      "preconditions": [
        {
          "name": "UserAuthenticated",
          "description": "用戶必須已登入",
          "type": "Authorization",
          "expression": "userId IS NOT NULL"
        },
        {
          "name": "TeamExists",
          "description": "球隊必須存在於系統中",
          "type": "DataValidation",
          "expression": "EXISTS(Team WHERE id = teamId)"
        },
        {
          "name": "UserHasTeamAccess",
          "description": "用戶必須有權限存取該球隊",
          "type": "Authorization",
          "expression": "user.hasAccessTo(teamId)"
        }
      ],
      "postconditions": [
        {
          "name": "TeamContextEstablished",
          "description": "系統建立該球隊的操作上下文",
          "type": "StateChange",
          "expression": "session.currentTeamId = teamId"
        },
        {
          "name": "TeamSelectedEventEmitted",
          "description": "發出 TeamSelected 事件",
          "type": "EventEmission",
          "event": "TeamSelected"
        }
      ]
    },
    {
      "commandName": "QueryTeamList",
      "operationType": "Query",
      "preconditions": [
        {
          "name": "UserAuthenticated",
          "description": "用戶必須已登入",
          "type": "Authorization",
          "expression": "userId IS NOT NULL"
        },
        {
          "name": "ValidPaginationParams",
          "description": "分頁參數必須有效",
          "type": "DataValidation",
          "expression": "page > 0 AND pageSize BETWEEN 10 AND 100"
        }
      ],
      "postconditions": [
        {
          "name": "TeamListReturned",
          "description": "回傳符合條件的球隊列表",
          "type": "DataReturn",
          "expression": "RETURN List<Team>"
        }
      ]
    }
  ],
  "policies": [
    {
      "policyName": "AutoLoadPlayersOnTeamSelection",
      "description": "當球隊被選擇時，自動載入該球隊的球員列表",
      "trigger": {
        "type": "event",
        "eventName": "TeamSelected"
      },
      "actions": [
        {
          "type": "command",
          "commandName": "QueryPlayerList",
          "parameters": {
            "teamId": "event.teamId"
          }
        }
      ],
      "priority": 1
    }
  ],
  "validationRules": [
    {
      "appliesTo": "CreatePlayer",
      "rules": [
        {
          "name": "UniqueJerseyNumber",
          "description": "同一球隊內背號不可重複",
          "expression": "NOT EXISTS(Player WHERE teamId = input.teamId AND jerseyNumber = input.jerseyNumber)",
          "errorMessage": "背號已被使用"
        },
        {
          "name": "ValidHeight",
          "description": "身高必須在合理範圍內",
          "expression": "input.height >= 150 AND input.height <= 250",
          "errorMessage": "身高必須在 150-250 公分之間"
        },
        {
          "name": "ValidPosition",
          "description": "守備位置必須是有效值",
          "expression": "input.position IN ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF']",
          "errorMessage": "無效的守備位置"
        }
      ]
    }
  ],
  "businessInvariants": [
    {
      "aggregateName": "Team",
      "invariant": "球隊必須至少有 9 名球員才能進行比賽",
      "constraint": "team.players.count >= 9",
      "enforcedAt": "PreGameValidation"
    },
    {
      "aggregateName": "Player",
      "invariant": "球員的排序順序必須唯一",
      "constraint": "UNIQUE(Player.sortOrder WHERE teamId = player.teamId)",
      "enforcedAt": "UpdatePlayerOrder"
    }
  ]
}
```

請開始分析。

## 驗證檢查清單

產出的 Rules & Policies 應該滿足：
- [ ] 每個 Command 都定義了 Preconditions
- [ ] 每個 Command 都定義了 Postconditions
- [ ] Preconditions 分類明確（Authorization/DataValidation/BusinessRule）
- [ ] Postconditions 分類明確（StateChange/EventEmission/DataReturn）
- [ ] 定義了 Event-driven Policies
- [ ] 定義了 Validation Rules 並包含錯誤訊息
- [ ] 定義了 Business Invariants
- [ ] 區分了 Command 和 Query 的規則差異

## 範例參考

### 輸入：US-B4 球員排序調整
Commands:
- UpdatePlayerOrder

### 輸出：Rules & Policies
```json
{
  "userStoryId": "US-B4",
  "commandRules": [
    {
      "commandName": "UpdatePlayerOrder",
      "operationType": "Command",
      "preconditions": [
        {
          "name": "UserAuthenticated",
          "description": "用戶必須已登入",
          "type": "Authorization",
          "expression": "userId IS NOT NULL"
        },
        {
          "name": "TeamSelected",
          "description": "必須先選擇球隊",
          "type": "BusinessRule",
          "expression": "session.currentTeamId IS NOT NULL"
        },
        {
          "name": "PlayersBelongToTeam",
          "description": "所有球員必須屬於當前球隊",
          "type": "DataValidation",
          "expression": "ALL(playerIds IN Player WHERE teamId = session.currentTeamId)"
        },
        {
          "name": "UniqueOrderValues",
          "description": "排序值不可重複",
          "type": "DataValidation",
          "expression": "UNIQUE(input.playerOrders.map(o => o.sortOrder))"
        }
      ],
      "postconditions": [
        {
          "name": "PlayersReordered",
          "description": "球員順序已更新",
          "type": "StateChange",
          "expression": "FORALL(playerOrders: player.sortOrder = newOrder)"
        },
        {
          "name": "PlayerOrderChangedEventEmitted",
          "description": "發出 PlayerOrderChanged 事件",
          "type": "EventEmission",
          "event": "PlayerOrderChanged"
        }
      ]
    }
  ],
  "policies": [],
  "validationRules": [
    {
      "appliesTo": "UpdatePlayerOrder",
      "rules": [
        {
          "name": "ConsecutiveOrdering",
          "description": "排序值應該連續（1, 2, 3...）",
          "expression": "input.playerOrders.map(o => o.sortOrder).sort() == range(1, playerCount)",
          "errorMessage": "排序值必須從 1 開始連續"
        }
      ]
    }
  ],
  "businessInvariants": [
    {
      "aggregateName": "Player",
      "invariant": "同一球隊內球員的排序順序必須唯一",
      "constraint": "UNIQUE(Player.sortOrder WHERE teamId = player.teamId)",
      "enforcedAt": "UpdatePlayerOrder"
    }
  ]
}
```

## Rules 類型對照表

| 類型 | 英文 | 定義 | 對應 Gherkin | 範例 |
|------|------|------|--------------|------|
| **前置條件** | Precondition | 執行前必須滿足的條件 | **Given** | 用戶已登入、球隊存在 |
| **後置條件** | Postcondition | 執行後達到的狀態 | **Then** | 狀態變為 SELECTED、發出 Event |
| **驗證規則** | Validation Rule | 輸入資料的驗證 | **Given** | 背號不重複、身高範圍 |
| **業務不變量** | Business Invariant | 永遠成立的約束 | **Then** | 排序唯一、至少 9 名球員 |
| **策略規則** | Policy | 事件觸發的自動化 | **When-Then** | 選擇球隊後載入球員 |

## Command vs Query 的規則差異

### Command Operation
- **Preconditions**：完整的業務規則驗證
- **Postconditions**：狀態改變 + Event 發出
- **複雜度**：高（需要確保一致性）

### Query Operation
- **Preconditions**：主要是權限驗證
- **Postconditions**：資料回傳
- **複雜度**：低（唯讀操作）
