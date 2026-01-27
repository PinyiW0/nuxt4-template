# Event Storming 視覺化圖表

> 自動產生於 Stage 7: Visualizer
> 最後更新：2026-01-27

---

## 目錄結構

```
docs/gherkin-spec/
├── _diagrams/                    # 📊 PlantUML 圖表（本目錄）
│   ├── README.md                 # 本說明文件
│   ├── epic-{x}-event-flow.puml      # Event 流程圖
│   ├── epic-{x}-command-event.puml   # Command-Event 對應圖
│   ├── epic-{x}-entity-relation.puml # Entity 關係圖
│   └── full-entity-relation.puml     # 完整 Entity 關係圖
│
├── _meta/                        # 📋 中繼資料與參考文件
│   ├── glossary.json             # 詞彙表（Entity、Action、ErrorCode）
│   ├── boundary-decisions.json   # 邊界決策記錄
│   ├── feature-dependencies.json # Feature 依賴關係
│   ├── prd-structure.json        # PRD 結構解析
│   ├── terminology-mapping.md    # 📖 詞彙對應表（人類可讀）
│   ├── events/                   # 各 Epic 的 Events
│   │   └── epic-{x}-events.json
│   ├── commands/                 # 各 Epic 的 Commands
│   │   └── epic-{x}-commands.json
│   └── policies/                 # 各 Epic 的 Policies
│       └── epic-{x}-policies.json
│
├── epic-a/                       # 🔐 Epic A: 登入/登出與權限控管
│   ├── us-a1-login.feature
│   └── us-a2-logout.feature
│
├── epic-b/                       # 👥 Epic B: 球隊/球員資料管理
│   ├── us-b1-query-team.feature
│   ├── us-b1-select-team.feature
│   ├── us-b2-create-team.feature
│   ├── us-b2-update-team.feature
│   ├── us-b2-delete-team.feature
│   ├── us-b3-query-player.feature
│   ├── us-b3-create-player.feature
│   ├── us-b3-update-player.feature
│   ├── us-b3-delete-player.feature
│   └── us-b4-reorder-player.feature
│
├── epic-c/                       # ⚾ Epic C: 訓練建立與 AI 系統控制
│   ├── us-c1-query-training.feature
│   ├── us-c2-create-training.feature
│   ├── us-c3-delete-training.feature
│   ├── us-c4-start-ai-system.feature
│   └── us-c4-stop-ai-system.feature
│
├── epic-d/                       # 📹 Epic D: 訓練紀錄頁（即時投球檢視）
│   ├── us-d1-enter-training-record.feature
│   ├── us-d1-exit-training-record.feature
│   ├── us-d2-query-pitch-list.feature
│   ├── us-d3-pitch-dashboard.feature
│   └── us-d4-update-strike-zone.feature
│
├── epic-e/                       # 📊 Epic E: 影像數據分析（歷史訓練）
│   ├── us-e1-switch-analysis-tab.feature
│   ├── us-e2-query-historical-trainings.feature
│   ├── us-e2-batch-delete-trainings.feature
│   └── us-e3-view-strike-zone-record.feature
│
├── epic-f/                       # 📈 Epic F: 選手分析（長期表現追蹤）
│   ├── us-f1-query-player-records.feature
│   ├── us-f1-batch-delete-player-records.feature
│   └── us-f2-view-player-stats.feature
│
└── isa/                          # 🔧 ISA-Level Gherkin（技術層級）
    └── epic-b/
        └── *.isa.feature
```

---

## 圖表類型說明

### 1. Event Flow 圖 (`*-event-flow.puml`)

**用途**：展示 Commands/Queries 如何觸發 Events 的流程

**閱讀方式**：
- 🔵 **藍色方塊** = Command（修改操作）
- 🔵 **淺藍方塊** = Query（查詢操作）
- 🟡 **黃色方塊** = Event（領域事件）
- 🔴 **紅色方塊** = Cascade Event（級聯事件）
- ➡️ **箭頭** = 觸發關係

**範例**：
```
[建立球隊] ──觸發──▶ [TeamCreated 球隊已建立]
[刪除球隊] ──觸發──▶ [TeamDeleted] ──級聯──▶ [PlayerCascadeDeleted]
```

---

### 2. Command-Event 對應圖 (`*-command-event.puml`)

**用途**：清楚展示每個 Command 會產生哪些 Events

**閱讀方式**：
- 左側 = Commands/Queries
- 右側 = Events
- 連線 = 1:1 或 1:N 的對應關係

**適合場景**：
- 快速查找某個操作會觸發什麼事件
- 確認 Event Sourcing 的事件設計

---

### 3. Entity 關係圖 (`*-entity-relation.puml`)

**用途**：展示資料模型的 ER Diagram

**閱讀方式**：
- 方塊 = Entity（資料表）
- `* field` = 必填欄位
- `<<PK>>` = 主鍵
- `<<FK>>` = 外鍵
- `||--o{` = 一對多關係
- `||--||` = 一對一關係

**範例**：
```
Team ||--o{ Player : contains
（一個球隊包含多個球員）
```

---

### 4. 完整關係圖 (`full-entity-relation.puml`)

**用途**：展示整個系統所有 Entity 的關係總覽

**顏色說明**：
- 🔵 藍色 = 核心 Entity（User, Team, Player）
- 🟢 綠色 = 訓練相關（Training, AISystem）
- 🟡 黃色 = 分析相關（Pitch, StrikeZone）

---

## 如何渲染 PlantUML

### 方法 1：VS Code 擴充套件（推薦）

1. 安裝 [PlantUML 擴充套件](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml)
2. 開啟 `.puml` 檔案
3. 按 `Alt + D` 預覽圖表

### 方法 2：線上渲染

1. 前往 [PlantUML Server](http://www.plantuml.com/plantuml/uml/)
2. 貼上 `.puml` 檔案內容
3. 點擊 Submit 產生圖片

### 方法 3：命令列

```bash
# 安裝 PlantUML
brew install plantuml

# 渲染單一檔案
plantuml epic-b-event-flow.puml

# 渲染所有檔案
plantuml *.puml
```

---

## 參考文件說明

### `_meta/terminology-mapping.md`

**最重要的人類可讀參考文件**，包含：

| 區塊 | 內容 |
|------|------|
| Entity 對照表 | 英文名稱、中文名稱、資料表名稱 |
| 欄位對照表 | 每個 Entity 的所有欄位定義 |
| Action 對照表 | 操作動詞的中英對照與 DSL Pattern |
| Role 對照表 | 角色與權限範圍 |
| Status 對照表 | 狀態碼定義 |
| ErrorCode 對照表 | 錯誤碼與 HTTP Status |
| 邊界決策摘要 | 全域決策與 Epic 層級決策 |
| Event/Command 對照表 | 所有事件與命令的完整清單 |

---

## Epic 索引

| Epic | 名稱 | 主要 Entity | 主要功能 |
|------|------|-------------|----------|
| A | 登入/登出與權限控管 | User | 身份驗證、Token 管理 |
| B | 球隊/球員資料管理 | Team, Player | CRUD、權限控管、級聯刪除 |
| C | 訓練建立與 AI 系統控制 | Training, AISystem | 訓練管理、AI 啟停 |
| D | 訓練紀錄頁 | Pitch, StrikeZone | 即時投球檢視、好球帶調整 |
| E | 影像數據分析 | Training | 歷史訓練查詢、批次刪除 |
| F | 選手分析 | Player | 選手統計、熱區圖 |

---

## Feature 檔案命名規則

```
us-{epic}{story}-{action}.feature
```

| 欄位 | 說明 | 範例 |
|------|------|------|
| `epic` | Epic 代碼（a-f） | b |
| `story` | User Story 編號 | 3 |
| `action` | 操作名稱 | create-player |

**範例**：`us-b3-create-player.feature` = Epic B, User Story 3, 新增球員
