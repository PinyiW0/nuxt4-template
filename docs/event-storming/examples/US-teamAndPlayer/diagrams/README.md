# PlantUML 圖表預覽

> 按 `Cmd+K V` 或右鍵選擇「Markdown Preview Enhanced: Open Preview to the Side」來預覽

---

## 01. Event-Command Flow（事件指令流程圖）

```plantuml
@startuml event-command-flow
!theme plain
skinparam backgroundColor #FEFEFE
skinparam defaultFontName "Noto Sans TC"

title Event-Command Flow Diagram
caption 球隊/球員資料管理 - 事件指令流程圖

' 定義樣式
skinparam rectangle {
  BackgroundColor<<Command>> #FFE4B5
  BorderColor<<Command>> #FF8C00
  BackgroundColor<<Event>> #E6F3FF
  BorderColor<<Event>> #4169E1
  BackgroundColor<<Policy>> #E8F5E9
  BorderColor<<Policy>> #2E7D32
  BackgroundColor<<Actor>> #FFF3E0
  BorderColor<<Actor>> #E65100
  BackgroundColor<<System>> #F5F5F5
  BorderColor<<System>> #757575
}

' Actors
rectangle "管理者/教練" <<Actor>> as Actor

' === 球隊相關 Commands ===
rectangle "QueryTeamList" <<Command>> as C001
rectangle "SelectTeam" <<Command>> as C002
rectangle "CreateTeam" <<Command>> as C003
rectangle "UpdateTeam" <<Command>> as C004
rectangle "DeleteTeam" <<Command>> as C005

' === 球隊相關 Events ===
rectangle "TeamListQueried" <<Event>> as E001
rectangle "TeamListRetrieved" <<Event>> as E002
rectangle "TeamSelected" <<Event>> as E003
rectangle "TeamContextEstablished" <<Event>> as E004
rectangle "TeamCreationRequested" <<Event>> as E005
rectangle "TeamValidated" <<Event>> as E006
rectangle "TeamCreated" <<Event>> as E007
rectangle "TeamCacheInvalidated" <<Event>> as E008
rectangle "TeamUpdated" <<Event>> as E009
rectangle "TeamDeleted" <<Event>> as E010
rectangle "TeamPlayersDeleted" <<Event>> as E011

' === 球員相關 Commands ===
rectangle "QueryPlayerList" <<Command>> as C006
rectangle "CreatePlayer" <<Command>> as C007
rectangle "UpdatePlayer" <<Command>> as C008
rectangle "DeletePlayer" <<Command>> as C009
rectangle "UpdatePlayerOrder" <<Command>> as C010

' === 球員相關 Events ===
rectangle "PlayerListQueried" <<Event>> as E012
rectangle "PlayerListRetrieved" <<Event>> as E013
rectangle "PlayerCreated" <<Event>> as E014
rectangle "PlayerListRefreshed" <<Event>> as E015
rectangle "PlayerUpdated" <<Event>> as E016
rectangle "PlayerDeleted" <<Event>> as E017
rectangle "PlayerOrderChanged" <<Event>> as E018

' === Policies ===
rectangle "AutoLoadPlayersOnTeamSelection" <<Policy>> as POL001
rectangle "InvalidateCacheOnTeamModification" <<Policy>> as POL002
rectangle "RefreshPlayerListOnModification" <<Policy>> as POL003
rectangle "CascadeDeletePlayersOnTeamDeletion" <<Policy>> as POL004

' === 球隊操作流程 ===
Actor --> C001 : 執行
C001 --> E001 : 產生
E001 --> E002 : 觸發系統

Actor --> C002 : 執行
C002 --> E003 : 產生
E003 --> E004 : 系統處理
E004 --> POL001 : 觸發 Policy

Actor --> C003 : 執行
C003 --> E005 : 產生
E005 --> E006 : 系統驗證
E006 --> E007 : 驗證通過
E007 --> POL002 : 觸發 Policy
POL002 --> E008 : 執行

Actor --> C004 : 執行
C004 --> E009 : 產生
E009 --> POL002 : 觸發 Policy

Actor --> C005 : 執行
C005 --> E010 : 產生
E010 --> POL004 : 觸發 Policy
POL004 --> E011 : 執行
E010 --> POL002 : 觸發 Policy

' === 球員操作流程 ===
POL001 --> C006 : 自動執行
Actor --> C006 : 執行
C006 --> E012 : 產生
E012 --> E013 : 觸發系統

Actor --> C007 : 執行
C007 --> E014 : 產生
E014 --> POL003 : 觸發 Policy
POL003 --> E015 : 執行

Actor --> C008 : 執行
C008 --> E016 : 產生
E016 --> POL003 : 觸發 Policy

Actor --> C009 : 執行
C009 --> E017 : 產生
E017 --> POL003 : 觸發 Policy

Actor --> C010 : 執行
C010 --> E018 : 產生
E018 --> POL003 : 觸發 Policy

' === 圖例 ===
legend right
  |= 元素類型 |= 說明 |
  | <back:#FFF3E0>Actor</back> | 執行操作的用戶角色 |
  | <back:#FFE4B5>Command</back> | 用戶發起的指令 |
  | <back:#E6F3FF>Event</back> | 已發生的領域事件 |
  | <back:#E8F5E9>Policy</back> | 事件驅動的自動化策略 |
endlegend

note right of POL002
  POL-002: InvalidateCacheOnTeamModification
  當球隊資料變更時自動失效快取
end note

note right of POL003
  POL-003: RefreshPlayerListOnModification
  當球員資料變更時自動刷新列表
end note

@enduml
```

---

## 02. Aggregate Structure（聚合結構圖）

```plantuml
@startuml aggregate-structure
!theme plain
skinparam backgroundColor #FEFEFE
skinparam defaultFontName "Noto Sans TC"

title Aggregate Structure Diagram
caption 球隊/球員資料管理 - 聚合結構圖

skinparam class {
  BackgroundColor #FFFACD
  BorderColor #DAA520
  ArrowColor #666666
}

skinparam stereotype {
  ABackgroundColor #E6F3FF
  EBackgroundColor #FFE4E1
  VBackgroundColor #F0F8FF
}

package "Team Aggregate" <<Rectangle>> #FAFAD2 {
  class Team <<Aggregate Root>> {
    ==== Identity ====
    +teamId: TeamId
    ==== Properties ====
    +teamName: TeamName
    +description: string?
    +status: TeamStatus
    +createdAt: DateTime
    +createdBy: UserId
    +updatedAt: DateTime?
    +updatedBy: UserId?
    ==== Methods ====
    +create(name, desc, createdBy): Team
    +update(name, desc, updatedBy): void
    +delete(deletedBy): void
    +validateTeamName(name): boolean
  }

  class TeamId <<Value Object>> {
    +value: UUID
    --
    +equals(other): boolean
  }

  class TeamName <<Value Object>> {
    +value: string
    --
    +validate(): boolean
    +equals(other): boolean
  }

  class TeamStatus <<Value Object>> {
    +value: Active|Inactive
    --
    +equals(other): boolean
  }

  Team *-- "1" TeamId : has
  Team *-- "1" TeamName : has
  Team *-- "1" TeamStatus : has
}

package "Player Aggregate" <<Rectangle>> #E0F0E3 {
  class Player <<Aggregate Root>> {
    ==== Identity ====
    +playerId: PlayerId
    +teamId: TeamId
    ==== Properties ====
    +jerseyNumber: JerseyNumber
    +name: PlayerName
    +position: Position
    +height: Height?
    +sortOrder: integer
    +createdAt: DateTime
    +createdBy: UserId
    +updatedAt: DateTime?
    +updatedBy: UserId?
    ==== Methods ====
    +create(...): Player
    +update(...): void
    +delete(deletedBy): void
    +updateSortOrder(order): void
    +validateJerseyNumber(teamId, number): boolean
  }

  class PlayerId <<Value Object>> {
    +value: UUID
    --
    +equals(other): boolean
  }

  class PlayerName <<Value Object>> {
    +value: string
    --
    +validate(): boolean
    +equals(other): boolean
  }

  class JerseyNumber <<Value Object>> {
    +value: integer (0-99)
    --
    +validate(): boolean
    +isUniqueInTeam(teamId): boolean
    +equals(other): boolean
  }

  class Position <<Value Object>> {
    +value: P|C|1B|2B|3B|SS|LF|CF|RF|DH
    --
    +validate(): boolean
    +equals(other): boolean
    +getDisplayName(): string
  }

  class Height <<Value Object>> {
    +value: integer (140-220)
    +unit: "cm"
    --
    +validate(): boolean
    +equals(other): boolean
  }

  Player *-- "1" PlayerId : has
  Player *-- "1" PlayerName : has
  Player *-- "1" JerseyNumber : has
  Player *-- "1" Position : has
  Player *-- "0..1" Height : has
}

' Aggregate 之間的關係
Team "1" o-- "0..*" Player : references by\nteamId
note on link
  Aggregate 之間使用 ID 引用
  而非直接持有參照
end note

' 共用的 Value Objects
class UserId <<Value Object>> {
  +value: UUID
  --
  +equals(other): boolean
}

Team ..> UserId : uses
Player ..> UserId : uses

' 說明
note top of Team
  **Team Aggregate Root**

  Invariants:
  - 球隊名稱必須唯一
  - 球隊名稱長度 2-50 字元
  - 刪除的球隊不可再操作
end note

note top of Player
  **Player Aggregate Root**

  Invariants:
  - 背號在同一球隊內必須唯一
  - 背號必須在 0-99 之間
  - 守備位置必須為標準棒球位置
  - 球員必須屬於一個存在的球隊
end note

' 圖例
legend right
  |= 元素類型 |= 說明 |
  | <<Aggregate Root>> | 聚合根，對外唯一入口 |
  | <<Value Object>> | 值物件，不可變且可替換 |
  | <<Entity>> | 實體，有唯一識別和生命週期 |

  **關係說明**:
  - **實線箭頭** (-->): 依賴關係
  - **組合** (*--): Aggregate 包含 Value Object
  - **聚合** (o--): Aggregate 之間透過 ID 引用
endlegend

@enduml
```

---

## 03. Business Flow（業務流程圖）

請參考：[03-business-flow.puml](03-business-flow.puml)

---

## 04. State Diagram（狀態轉換圖）

請參考：[04-state-diagram.puml](04-state-diagram.puml)

---

## 05. Mapping Matrix（對應矩陣圖）

請參考：[05-mapping-matrix.puml](05-mapping-matrix.puml)

---

## 使用說明

### 開啟預覽
1. **方式 1**：按 `Cmd+K V`（先按 Cmd+K，放開後按 V）
2. **方式 2**：右鍵點擊檔案 → 「Markdown Preview Enhanced: Open Preview to the Side」
3. **方式 3**：按 `Cmd+Shift+P` → 輸入「Markdown Preview Enhanced」→ 選擇「Open Preview to the Side」

### 匯出圖片
在預覽視窗中：
1. 右鍵點擊圖表
2. 選擇「Save as PNG」或「Copy as PNG」

### 如果圖表無法顯示
確保在 Markdown Preview Enhanced 設定中啟用了線上 PlantUML 服務：
1. 按 `Cmd+,` 開啟設定
2. 搜尋「Markdown Preview Enhanced」
3. 找到「PlantUML Server」設定
4. 確認使用線上服務（預設應該已啟用）
