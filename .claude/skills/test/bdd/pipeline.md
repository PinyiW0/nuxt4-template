# Pipeline / Batch / Auto 模式規則

## 概述

提供三種批次執行 BDD 測試流程的方式，自動依序執行 map → red → green → blue。

---

## 指令格式

```bash
/test pipeline <feature>         # 單一 feature 完整流程
/test batch <start> <end>        # 批次處理指定範圍
/test auto [--limit N]           # 自動偵測未完成的 features
```

---

## Pipeline 模式

### 用法

```bash
/test pipeline 03
/test pipeline 03-查詢球隊列表
```

### 執行流程

```
┌─────────────────────────────────────────────────────────────┐
│  Pipeline: Feature XX                                        │
├─────────────────────────────────────────────────────────────┤
│  1. [MAP]   產出 mapping.md                                  │
│       ↓ 成功                                                 │
│  2. [RED]   生成 step definitions，執行測試確認紅燈 🔴        │
│       ↓ 確認失敗（紅燈）                                      │
│  3. [GREEN] 實作最小程式碼，執行測試確認綠燈 🟢               │
│       ↓ 確認通過（綠燈）                                      │
│  4. [BLUE]  重構改善，執行測試確認持續通過 🔵                 │
│       ↓ 確認通過                                             │
│  ✅ Pipeline 完成                                            │
└─────────────────────────────────────────────────────────────┘
```

### 失敗處理

任一階段失敗時：
1. 輸出錯誤訊息和失敗位置
2. **停止** pipeline，不繼續下一階段
3. 提示使用者手動修正後可用 `/test <phase> <feature>` 繼續

---

## Batch 模式

### 用法

```bash
/test batch 03 10              # 處理 03 到 10
/test batch 03 10 --skip-blue  # 跳過藍燈階段（加速）
```

### 執行流程

```
Batch: Features 03-10
├── Feature 03 ─── pipeline ─── ✅
├── Feature 04 ─── pipeline ─── ✅
├── Feature 05 ─── pipeline ─── ❌ (停止)
│
└── 結果: 2/8 完成，停在 Feature 05 的 green 階段
```

### 選項

| 選項 | 說明 |
|------|------|
| `--skip-blue` | 跳過藍燈階段，只執行 map → red → green |
| `--continue-on-error` | 某 feature 失敗時繼續下一個（預設：停止） |

---

## Auto 模式

### 用法

```bash
/test auto                     # 處理所有未完成的 features
/test auto --limit 5           # 最多處理 5 個
/test auto --skip-blue         # 跳過藍燈階段
```

### 偵測邏輯

判斷 feature 是否「已完成」：

```typescript
function isFeatureComplete(featureNumber: string): boolean {
  // 1. 檢查 mapping.md 是否存在
  const mappingExists = fileExists(`test/bdd/${featureNumber}-*.mapping.md`)

  // 2. 執行測試，檢查是否全部通過
  const testResult = runTest(featureNumber)

  return mappingExists && testResult.allPassed
}
```

### 執行順序

按 feature 編號由小到大排序，依序執行 pipeline。

---

## 輸出格式

### Pipeline 進度

```
🚀 Pipeline: 03-查詢球隊列表
────────────────────────────────
[1/4] MAP    ✅ 產出 mapping.md
[2/4] RED    ✅ 生成 5 個 step definitions，紅燈確認
[3/4] GREEN  🔄 實作中...
```

### Batch 摘要

```
📦 Batch 執行結果 (03-10)
────────────────────────────────
✅ 03-查詢球隊列表     [完成]
✅ 04-建立球隊         [完成]
❌ 05-編輯球隊         [失敗於 GREEN]
⏭️ 06-刪除球隊         [跳過]
...
────────────────────────────────
完成: 2/8 | 失敗: 1 | 跳過: 5
```

### Auto 摘要

```
🤖 Auto 模式執行結果
────────────────────────────────
掃描: 26 個 features
已完成: 2 個 (01, 02)
待處理: 24 個
本次處理: 5 個 (--limit 5)
────────────────────────────────
✅ 03-查詢球隊列表     [完成]
✅ 04-建立球隊         [完成]
...
```

---

## 實作細節

### 階段驗證

每個階段完成後必須驗證：

| 階段 | 驗證條件 |
|------|---------|
| MAP | `test/bdd/{feature}.mapping.md` 存在 |
| RED | `npm run lint` 零錯誤 + 測試執行後有失敗（紅燈），且錯誤訊息為「紅燈階段：尚未實作」 |
| GREEN | `npm run lint` 零錯誤 + 測試全部通過（綠燈） |
| BLUE | `npm run lint` 零錯誤 + 測試持續通過，無 TODO 註解 |

> **Lint Gate**：每個產出程式碼的階段（RED / GREEN / BLUE）結束前，必須執行 `npm run lint --fix && npm run lint` 確認零錯誤。這是 **阻塞條件**——lint 不通過則該階段視為失敗。

### 錯誤類型

```typescript
type PipelineError =
  | { phase: 'MAP', reason: 'parse_error' | 'write_error' }
  | { phase: 'RED', reason: 'no_new_steps' | 'unexpected_pass' }
  | { phase: 'GREEN', reason: 'test_failed' | 'compile_error' }
  | { phase: 'BLUE', reason: 'test_failed' | 'todo_remaining' }
```

---

## 使用建議

1. **首次使用**：先用 `/test pipeline 03` 測試單一 feature
2. **批次處理**：確認流程穩定後用 `/test batch`
3. **日常開發**：用 `/test auto --limit 3` 每次處理幾個

---

## 範例

### 完整 Pipeline 執行

```bash
> /test pipeline 03

🚀 Pipeline: 03-查詢球隊列表
────────────────────────────────

[1/4] MAP 階段
- 讀取 docs/gherkin-spec/features/03-查詢球隊列表.dsl.feature
- 產出 test/bdd/03-查詢球隊列表.mapping.md
✅ MAP 完成

[2/4] RED 階段
- 掃描現有 step definitions
- 新增 3 個 step definitions
- 執行測試確認紅燈
✅ RED 完成（3 個測試失敗，符合預期）

[3/4] GREEN 階段
- 實作 TeamRepository
- 實作 TeamService
- 實作 step definitions
- 執行測試
✅ GREEN 完成（3 個測試通過）

[4/4] BLUE 階段
- 移除 TODO 註解
- 提取共用邏輯
- 執行測試確認
✅ BLUE 完成

────────────────────────────────
🎉 Pipeline 完成！Feature 03 已就緒。
```
