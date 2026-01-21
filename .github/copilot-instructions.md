# Copilot 專案指令

## Event Storming 自動化流程 v2.0

本流程引導非技術使用者完成 Event Storming，產出可執行的 DSL 規則（Gherkin）和視覺化圖表（PlantUML）。

### 設計原則

1. **專業角色分工**：每個階段由專業角色執行和檢核
2. **互動式確認**：遇到邊界問題時提供選項讓使用者決定
3. **Data Driven**：Gherkin 使用參數化設計
4. **TDD 導向**：產出可直接用於測試實作

### 觸發指令

#### 執行完整流程

```
do: docs/user-stories/us-XXX.md
for: event storming
```

#### 執行特定階段

```
/stage0  # 執行 Stage 0: Feature 拆解
/stage1  # 執行 Stage 1: Domain Events 識別
/stage2  # 執行 Stage 2: Commands 萃取
/stage3  # 執行 Stage 3: Aggregates 設計
/stage4  # 執行 Stage 4: Policies & Rules
/stage5  # 執行 Stage 5: Read Models
/stage6  # 執行 Stage 6: Gherkin 生成
/stage7  # 執行 Stage 7: PlantUML 視覺化
```

---

## 執行流程（8 個階段）

```
┌─────────────────────────────────────────────────────────────────┐
│                    Event Storming Pipeline                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ Stage 0  │───▶│ Stage 1  │───▶│ Stage 2  │───▶│ Stage 3  │  │
│  │ Feature  │    │ Events   │    │ Commands │    │Aggregates│  │
│  │ 拆解專家 │    │ 識別專家 │    │ 萃取專家 │    │ 設計專家 │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ Stage 4  │───▶│ Stage 5  │───▶│ Stage 6  │───▶│ Stage 7  │  │
│  │ Policies │    │ReadModels│    │ Gherkin  │    │ PlantUML │  │
│  │ 規則專家 │    │ 查詢專家 │    │ BDD專家  │    │ 視覺化   │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Facilitator (協調者)                    │   │
│  │  - 流程控制 / 邊界問題互動 / 非技術使用者引導            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Stage 0: Feature 拆解（新增）

**角色**：Feature Analyst
**目的**：將不完整的 User Story 拆解為可獨立測試的 Features
**輸出**：`00-features.json`

```
User Story（可能不完整）
    │
    ▼
┌─────────────────────────────────────┐
│ 檢查完整性                           │
│ - Who（誰是使用者）                   │
│ - What（想做什麼）                    │
│ - Why（為什麼要做）                   │
│ - Acceptance Criteria               │
└─────────────────────────────────────┘
    │
    ▼
拆解為 Features（可獨立測試的功能）
```

### Stage 1: Domain Events 識別

**角色**：Event Expert
**目的**：識別所有領域事件
**輸出**：`01-domain-events.json`

### Stage 2: Commands 萃取

**角色**：Command Expert
**目的**：萃取 Commands 並建立 Event 對應
**輸出**：`02-commands.json`

**Event-Command 關係模型**：
```
1:1  一個 Command 產生一個 Event
1:N  一個 Command 產生多個 Events
N:1  多個 Commands 產生相同 Event
```

### Stage 3: Aggregates 設計

**角色**：Aggregate Designer
**目的**：設計 Aggregates、Entities、Value Objects
**輸出**：`03-aggregates.json`

### Stage 4: Policies & Rules

**角色**：Policy Expert
**目的**：梳理業務規則、前後置條件、Policy
**輸出**：`04-policies.json`

### Stage 5: Read Models

**角色**：Query Designer
**目的**：設計查詢用的 Read Models
**輸出**：`05-read-models.json`

### Stage 6: Gherkin 生成（重大更新）

**角色**：BDD Expert
**目的**：產出 Gherkin 6.x 格式的測試場景
**輸出**：`06-scenarios.feature`

**關鍵改變**：
- 使用 `Rule` + `Example` 結構（Gherkin 6.x）
- Data Driven 設計（`Scenario Outline` + `Examples`）
- 移除 UI 相關判定
- TDD 導向（可直接用於測試實作）

**不會出現這種寫法**：
```gherkin
Then 系統應該發送 "UpdatePlayerOrder" command
And 系統應該觸發 "PlayerOrderChanged" event
```

**改用參數化**：
```gherkin
Scenario Outline: 成功執行 <操作類型> 操作
  Given <precondition>
  When 執行 <command> 帶入：
    | 參數名 | 參數值 |
    | ...    | ...    |
  Then 應成功產生 <event>
  
  Examples:
    | 操作類型 | command | event | precondition |
    | ...      | ...     | ...   | ...          |
```

### Stage 7: PlantUML 視覺化（新增）

**角色**：Visualizer
**目的**：產出視覺化圖表
**輸出**：`diagrams/*.puml`

產出圖表：
- Event-Command Flow
- Aggregate Structure
- Business Flow
- State Diagram
- Mapping Matrix

---

## 輸出目錄結構

```
docs/event-storming/examples/{story-id}/
├── 00-features.json          # Stage 0: Feature 拆解
├── 01-domain-events.json     # Stage 1: Events
├── 02-commands.json          # Stage 2: Commands
├── 03-aggregates.json        # Stage 3: Aggregates
├── 04-policies.json          # Stage 4: Policies
├── 05-read-models.json       # Stage 5: Read Models
├── 06-scenarios.feature      # Stage 6: Gherkin
└── diagrams/                 # Stage 7: PlantUML
    ├── 01-event-command-flow.puml
    ├── 02-aggregate-structure.puml
    ├── 03-business-flow.puml
    ├── 04-state-diagram.puml
    └── 05-mapping-matrix.puml
```

---

## 專業角色定義

所有角色的詳細 instruction 在 `.github/copilot-skills/` 目錄：

| 角色 | 檔案 | 職責 |
|------|------|------|
| **Facilitator** | `facilitator.md` | 流程協調、邊界問題處理、使用者引導 |
| **Feature Analyst** | `stage0-feature-analyst.md` | User Story 拆解為 Features |
| **Event Expert** | `stage1-event-expert.md` | Domain Events 識別 |
| **Command Expert** | `stage2-command-expert.md` | Commands 萃取與 Event 對應 |
| **Aggregate Designer** | `stage3-aggregate-designer.md` | Aggregates 與 Entities 設計 |
| **Policy Expert** | `stage4-policy-expert.md` | Business Rules 與 Policies 梳理 |
| **Query Designer** | `stage5-query-designer.md` | Read Models 設計 |
| **BDD Expert** | `stage6-bdd-expert.md` | Gherkin 6.x 場景生成 |
| **Visualizer** | `stage7-visualizer.md` | PlantUML 視覺化圖表 |

---

## 邊界問題互動機制

當遇到模糊或需要確認的問題時，使用以下格式：

```markdown
---
### 需要確認

**關於 [問題主題]**

[簡短說明為什麼需要確認這個問題]

**Q[編號]: [問題描述]**

- [ ] **A)** [最可能的選項] (推薦)
- [ ] **B)** [次可能的選項]
- [ ] **C)** [其他可能選項]
- [ ] **D)** 其他：_______________

**說明**：[選項 A 為什麼是推薦的簡短解釋]

請選擇（可複選，例如：A, C）：
---
```

### 常見邊界問題類型

1. **唯一性約束**：資料在什麼範圍內需要唯一？
2. **狀態轉換**：刪除是軟刪除還是硬刪除？
3. **權限範圍**：這個操作需要什麼權限？
4. **Event-Command 關係**：這個操作會產生哪些事件？

---

## 系統邊界模型

### Command Operation（修改型）

```
Actor → [Command + Input] → Rules 驗證 → Aggregate 狀態改變 → Event 產生
```

Gherkin 對應：
- Preconditions → Given
- Command + Input → When
- Postconditions + Event → Then

### Query Operation（查詢型）

```
Actor → [Query + Params] → 權限驗證 → Read Model 回傳
```

Gherkin 對應：
- Preconditions（權限驗證）→ Given
- Query 請求 → When
- Read Model 回傳資料 → Then

---

## Event-Command 關係模型

支援三種對應關係：

| 關係 | 說明 | 範例 |
|------|------|------|
| **1:1** | 一個 Command 產生一個 Event | CreateTeam → TeamCreated |
| **1:N** | 一個 Command 產生多個 Events | DeleteTeam → TeamDeleted + PlayersOrphaned |
| **N:1** | 多個 Commands 產生相同 Event | CreateTeam, ImportTeam → TeamCreated |

---

## 使用範例

### 完整流程

```
do: docs/user-stories/us-teamAndPlayer.md
for: event storming
```

### 特定階段

```
/stage0  # 執行 Feature 拆解
/stage1  # 執行 Domain Events 識別
/stage6  # 執行 Gherkin 生成
```

### 重新生成特定階段

```
/stage6  # 重新生成 Gherkin 場景
```

---

## 驗證檢查清單

### Stage 0 (Features)
- [ ] User Story 完整性已評估
- [ ] Features 可獨立測試
- [ ] 依賴關係已定義

### Stage 1-5 (Domain Model)
- [ ] JSON 格式正確
- [ ] 所有必要欄位已填寫
- [ ] Event-Command 關係已建立
- [ ] 前後階段資料可銜接

### Stage 6 (Gherkin)
- [ ] 使用 Gherkin 6.x 語法
- [ ] Data Driven 設計（參數化）
- [ ] 無 UI 相關判定
- [ ] 可用於 TDD 實作

### Stage 7 (PlantUML)
- [ ] 圖表可正確渲染
- [ ] 配色一致
- [ ] 關係正確

---

## 其他專案指令

（其他 Copilot 指令可以在這裡添加）
