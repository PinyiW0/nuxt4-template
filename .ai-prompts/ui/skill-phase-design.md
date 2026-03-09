# Skill Phase 設計模式：Fork 隔離與檔案傳遞

## 核心概念

當一個 AI Skill 的工作量超過單一 context window 能處理的範圍時，必須將工作拆成多個 **Phase**，並使用 `context: fork` 讓每個 Phase 在獨立的 context 中執行。

這帶來一個根本限制：**Phase 之間無法對話**。每個 Phase 啟動時是一張白紙，不知道前面的 Phase 做了什麼。因此，所有跨 Phase 的資訊必須透過**磁碟上的檔案**傳遞，不能依賴對話記憶。

```
Phase 0（子代理 A）              Phase 1（子代理 B）
┌─────────────────┐             ┌─────────────────┐
│ 分析 feature    │             │ 讀取 Phase 0     │
│ 產出分析結果     │ ──寫入檔案──→ │ 留下的檔案        │
│ 寫入 route-map  │             │ 建立 mock API    │
│ context 釋放    │             │ context 釋放     │
└─────────────────┘             └─────────────────┘
      ↕ 不共享記憶 ↕
```

## 為什麼需要 Fork

不使用 fork 的問題：

1. **Context 耗盡**：Phase 0 讀了 20 個 feature 檔、Phase 1 又讀了 types 和 mock data，到 Phase 6 實作頁面時，context window 已經被前面的內容塞滿，AI 品質下降。
2. **資訊干擾**：Phase 6 實作表單時，context 裡還殘留 Phase 2 的色彩計算過程，AI 可能被無關資訊分散注意力。

使用 fork 後，每個 Phase 都有完整的 context 空間可用，專注做好一件事。

## 設計 Phase 的三個原則

### 原則一：每個 Phase 的產出必須是檔案

Phase 之間唯一的溝通管道是磁碟。任何需要傳遞給下游 Phase 的資訊，都必須寫入檔案。

| 產出類型 | 檔案形式 | 範例 |
|---------|---------|------|
| 分析結果 | YAML / Markdown | `route-map.yaml`、`sync-report.md` |
| 合約定義 | TypeScript | `app/types/api/*.ts` |
| 程式碼 | Vue / TS | `server/api/**/*.ts`、`components/*.vue` |
| 設定 | YAML / TS | `ui-config.yaml`、`app.config.ts` |

反面教材：如果 Phase 0 的分析結論只存在對話記憶裡（「我發現有 3 個新路由」），Phase 1 完全拿不到這個資訊。

### 原則二：每個 Phase 必須有「必讀清單」

因為子代理啟動時什麼都不知道，所以 Phase 定義檔的開頭必須列出：**你要去哪裡讀、讀什麼**。

```markdown
## 必讀規範

必須讀取：
- docs/route-map.yaml              ← Phase 0 寫的分析結果
- app/types/api/*.ts               ← Phase 0 寫的合約型別
- server/api/**/*.ts               ← Phase 1 寫的 API 端點
- app/components/common/*.vue      ← Phase 5 寫的共用元件
- rules.md [P6]                    ← 規則手冊（只讀自己的段落）
```

這份清單的作用是：讓子代理在空白 context 中，能迅速重建必要的上下文。

### 原則三：Phase 之間的合約要穩定

Phase 0 寫入的 `route-map.yaml` 結構，就是 Phase 0 和 Phase 1-6 之間的合約。這個結構不能隨意變動，否則下游 Phase 會讀到預期外的格式。

設計時要把「Phase 間的檔案」視為 API：
- 格式固定、有版本號（`version: 1`）
- 欄位有明確定義（在 Phase 定義檔中記錄「欄位說明」表格）
- 變更時要考慮向下相容（如：「讀到舊格式 → 視為無 hash，全部重新比對」）

## 規則檔的 Tag 系統

當多個 Phase 共用同一份規則檔時，用 tag 標記每段規則適用哪些 Phase，讓每個 Phase 只讀自己需要的部分，節省 context。

```markdown
## 配色策略 [P2, P4, P5, P6]
（Phase 2, 4, 5, 6 讀取）

## Zod v4 規範 [P6]
（只有 Phase 6 讀取）

## Server API 類型規範 [P1]
（只有 Phase 1 讀取）
```

好處：
- **集中管理**：所有規則在一個檔案，避免散落各處、版本不一致
- **按需載入**：每個 Phase 只讀標有自己編號的段落，不浪費 context

## 檢查清單：設計新 Phase 時

- [ ] 這個 Phase 的所有產出都會寫入檔案嗎？
- [ ] 必讀清單是否涵蓋了所有需要的上游產出？
- [ ] 必讀清單是否只包含必要的檔案？（避免載入不需要的資訊）
- [ ] Phase 間的檔案格式是否有明確的結構定義？
- [ ] 如果規則是共用的，是否用 tag 標記了適用的 Phase？
- [ ] Phase 完成後是否有確認步驟？（讓使用者審核產出）
