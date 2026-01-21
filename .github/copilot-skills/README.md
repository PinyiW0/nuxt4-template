# Copilot Skills - Event Storming Pipeline

## 概述

此目錄包含 Event Storming 自動化流程的專業角色定義。每個角色都有特定的職責和專業知識，負責檢核和執行特定階段的工作。

## 架構設計

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

## 專業角色清單

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

## 互動機制

### 邊界問題處理

當遇到模糊或需要確認的問題時，系統會：

1. 提供選項讓使用者選擇（依可能性排序）
2. 選項 A 為最可能的答案
3. 最後一個選項允許自由文字輸入
4. 支援複選

### 範例格式

```
邊界問題確認

關於「球員建立」操作，系統需要確認：

Q1: 球員背號的唯一性範圍？
- [ ] A) 同一球隊內背號不可重複（推薦）
- [ ] B) 全系統背號不可重複
- [ ] C) 允許重複，但需要顯示警告
- [ ] D) 其他：_______________

請選擇（可複選）：
```

## Event-Command 關係模型

支援三種對應關係：

```
1:1  一個 Command 產生一個 Event
     CreateTeam ──▶ TeamCreated

1:N  一個 Command 產生多個 Events
     DeleteTeam ──┬▶ TeamDeleted
                  └▶ PlayersOrphaned

N:1  多個 Commands 可產生相同 Event
     CreateTeam ──┬
     ImportTeam ──┴▶ TeamCreated
```

## 輸出格式

### JSON 格式（Stage 0-5）
- 結構化資料
- 版本追蹤 (`version`, `generatedAt`)
- 可機器處理

### Gherkin 格式（Stage 6）
- Gherkin 6.x 語法
- Data Driven（Scenario Outline + Examples）
- Rule + Example 結構
- 框架中立

### PlantUML 格式（Stage 7）
- 流程圖
- 狀態圖
- Event-Command 關係圖

## 使用方式

```
@workspace 請對 docs/user-stories/us-xxx.md 執行 Event Storming
```

系統會自動：
1. 讀取 User Story
2. 依序呼叫各專業角色
3. 在邊界問題時暫停並詢問
4. 輸出完整的分析結果
