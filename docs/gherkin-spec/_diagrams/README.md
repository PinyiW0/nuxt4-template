# PlantUML 視覺化圖表

> 產生於 Event Storming Stage 7
> 日期：2026-01-23

## 圖表列表

### 1. Epic 依賴關係圖
**檔案**: [epic-dependencies.puml](./epic-dependencies.puml)

展示 7 個 Epic 之間的依賴關係與處理順序。

**用途**:
- 理解 Epic 的執行順序
- 識別阻塞風險
- 規劃開發優先級

### 2. Entity 關係圖
**檔案**: [entity-relation.puml](./entity-relation.puml)

展示系統所有 Entity 及其關聯關係。

**用途**:
- 理解資料庫結構
- 識別外鍵關係
- 查看邊界決策（刪除策略、唯一性約束等）

### 3. Command-Event 對應圖

每個 Epic 都有對應的 Command-Event 關係圖：

| Epic | 檔案 | 說明 |
|------|------|------|
| A | [epic-a-command-event.puml](./epic-a-command-event.puml) | 登入/登出與權限控管 |
| B | [epic-b-command-event.puml](./epic-b-command-event.puml) | 球隊/球員資料管理 |
| C | [epic-c-command-event.puml](./epic-c-command-event.puml) | 訓練建立與 AI 系統控制 |
| D | [epic-d-command-event.puml](./epic-d-command-event.puml) | 訓練紀錄頁（即時投球檢視） |
| E | [epic-e-command-event.puml](./epic-e-command-event.puml) | 影像數據分析（歷史訓練） |
| F | [epic-f-command-event.puml](./epic-f-command-event.puml) | 選手分析（長期表現追蹤） |
| G | [epic-g-command-event.puml](./epic-g-command-event.puml) | 影像播放（Live / Replay） |

**用途**:
- 理解每個 Command 觸發哪些 Events
- 識別事件流
- 規劃 Event Handler

## 如何使用

### 方法 1: 使用 PlantUML 線上編輯器

1. 訪問 [PlantUML Online Editor](http://www.plantuml.com/plantuml/uml/)
2. 複製 `.puml` 檔案內容
3. 貼上編輯器
4. 點擊渲染

### 方法 2: 使用 VS Code 擴充套件

1. 安裝 [PlantUML 擴充套件](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml)
2. 開啟 `.puml` 檔案
3. 按 `Alt+D` 預覽圖表
4. 按 `Ctrl+Shift+E` 匯出為圖片

### 方法 3: 使用命令列工具

```bash
# 安裝 PlantUML
brew install plantuml  # macOS
sudo apt install plantuml  # Linux

# 產生 PNG 圖片
plantuml epic-dependencies.puml

# 產生 SVG 圖片
plantuml -tsvg epic-dependencies.puml

# 批次產生所有圖表
plantuml *.puml
```

## 圖表更新

當 Event Storming 分析結果變更時，請重新執行 Stage 7：

```
do: docs/user-stories/user-v1.md
for: event storming
mode: update
```

或手動更新對應的 `.puml` 檔案。

## 相關文件

- [PRD 結構](../_meta/prd-structure.json)
- [詞彙對應表](../_meta/terminology-mapping.md)
- [邊界決策記錄](../_meta/boundary-decisions.json)
- [Epic 依賴關係](../_meta/epic-dependencies.json)
