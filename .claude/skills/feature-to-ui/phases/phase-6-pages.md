# Phase 6: 頁面實作

## 必讀規範

```
必須讀取：
- 該功能對應的 .feature 檔案
- ui-config.yaml > form（表單設定）
- ui-config.yaml > toast（通知設定）
- ui-config.yaml > colorMode（深淺模式）
- docs/route-map.yaml > 對應路由的 features_used（此頁面使用的 additionalFeature）
- page-builder.md（DSL 解析 + 表單範本 + 列表範本）
- features.md（僅 features_used 有值時需讀取，了解對應元件的使用方式）
- rules.md [P6] 段落（配色、對比色、Zod v4、Nuxt UI 類型、表單型別安全、API、第三方 import、Pinia Store、testid）

⚠️ 必須先掃描 API 端點結構：
執行 glob server/api/**/*.ts 取得實際 API 路徑列表

若存在，額外讀取（testid + 操作流程來源）：
- docs/e2e-flows/pages/{對應頁面}.elements.md
- docs/e2e-flows/{NN}-{name}.flow.md
- docs/e2e-flows/_common.flow.md

Sync 模式額外讀取：
- docs/sync-report.md（變更報告，決定每個頁面的執行模式）

執行 /nuxt-ui 載入組件文檔（若尚未載入）
```

---

## 模式判斷

Phase 6 開始前，先檢查 `docs/sync-report.md` 是否存在：

| 條件 | 模式 | 行為 |
|------|------|------|
| `sync-report.md` **不存在** | **全量 build** | 所有頁面從零實作（下方「全量模式執行步驟」） |
| `sync-report.md` **存在** | **增量模式** | 讀取「頁面實作指令」表格，按標記執行 ↓ |

### 增量模式 — 頁面執行標記

| 標記 | 模式 | 行為 |
|------|------|------|
| 新增 | **build** | 從零生成（同全量模式流程） |
| 修改 | **patch** | 讀現有程式碼 → 改動清單 → 確認 → Edit（見下方 patch 流程） |
| 重大變更 | **rebuild** | 重新生成但參考舊程式碼樣式（見下方 rebuild 流程） |
| 刪除 | **delete** | 確認後移除相關程式碼（見下方 delete 流程） |
| 無變化 | **skip** | 跳過 |

### 增量模式 — 刪除確認步驟（Phase 6 最先執行）

> ⚠️ **Phase 6 增量模式開始時，必須先處理刪除項目，再處理 build/patch/rebuild。**

1. **讀取 sync-report 的「待刪除項目」區塊**
2. **若有待刪除項目 → 向用戶確認**，格式如下：

   ```
   以下 Feature 已刪除，對應的程式碼需要清理：

   | 類型 | 項目 | 說明 |
   |------|------|------|
   | 頁面程式碼 | /players 排序功能 | Feature 11-調整球員排序 已移除 |
   | 型別 | SortPlayersBody | 僅被 Feature 11 使用 |
   | API 端點 | PUT /api/players/sort | 僅被 Feature 11 使用 |
   | 欄位 | PlayerItem.sort_order | 排序功能移除後不需要 |

   確認要刪除以上項目嗎？（可逐項選擇保留或刪除）
   ```

3. **用戶確認後執行刪除**：
   - 頁面程式碼：移除對應的 script 邏輯和 template 區塊（使用 Edit）
   - 型別：移除 interface/type 定義及 re-export
   - API 端點：刪除對應的 `server/api/*.ts` 檔案
   - Mock 資料：移除相關函式和資料
   - **route-map.yaml**：移除對應的 feature 參照和 `api_contract` 條目（避免下次 sync 重複偵測）
4. **用戶拒絕（或部分保留）→ 跳過被拒絕的項目，繼續後續流程**
5. **刪除完成後，進入正常的 build/patch/rebuild 流程**

---

## 全量模式執行步驟

1. **讀取該功能的 .feature 檔**
2. **分析 Feature**
   - 表單欄位（從 When）
   - 驗證規則（從 Rule）
   - 錯誤訊息（從 Then）
3. **⚠️ 強制前置讀取（每個功能都必須執行！）**
   - **掃描 API 結構**：`glob server/api/**/*.ts`
   - **讀取該頁面用到的 API endpoint 原始碼**：確認回傳格式、query/body 參數
   - **讀取該頁面用到的 `types/api/` 型別定義**：頁面必須 import 使用，禁止定義 local interface
   - **讀取該頁面用到的共用元件原始碼**（`app/components/common/*.vue`）：確認 props、slots、events 簽名
   - **讀取 Pinia store 原始碼**（若頁面需要）：確認 store 提供的方法和屬性
   - **讀取 E2E 測試元素定義**（若存在）：
     - `docs/e2e-flows/pages/{對應頁面}.elements.md` — 取得該頁面所有 testid
     - `docs/e2e-flows/{NN}-{name}.flow.md` — 了解操作流程和涉及的 testid
     - `docs/e2e-flows/_common.flow.md` — 共用元素的 testid
4. **⚠️ 實作前對照表（必須在寫 code 之前輸出！）**
   - 逐一列出該頁面的每個 `.feature` 檔名 + Feature 標題
   - 比對 DSL Command 關鍵字 → UI 元件（**必須**查 [page-builder.md](../page-builder.md) Command 對照表）
   - 產出「Feature → UI 對照表」，格式如下：

   ```
   Feature → UI 對照表（/players）：
   | Feature 檔 | DSL Command | UI 元件 | 備註 |
   |-----------|-------------|---------|------|
   | 07-查詢球員列表 | 查詢列表 | UTable + 搜尋框 | |
   | 08-新增球員 | 建立 | Modal + 表單 | |
   | 09-編輯球員 | 編輯 | Modal + 表單（預填） | 共用新增 Modal |
   | 10-刪除球員 | 刪除 | 確認 Modal | |
   | 11-調整球員排序 | 排序/調整順序 | vuedraggable | 拖曳排序 |
   ```

   > ⚠️ **此表是 code review 用的 checklist**：實作完成後，逐列打勾確認。若表中任何 Feature 沒有對應 UI，必須補做。

5. **實作頁面**（基於步驟 3-4 的對照表和讀取的實際程式碼）
   - 所有 `data-testid` 必須與 `elements.md` 中定義的一致
   - 若 `.flow.md` 描述了特定操作步驟，確保 UI 元素的 testid 對應正確
   - **逐一檢查步驟 4 對照表，確保每個 Feature 都有對應的 UI 實作**
   - **⚠️ build 模式（fallback 防漏）：檢查 Layout 導航是否已包含此路由**。Phase 4 應已處理導航同步，此處僅做最終確認。讀取 `app/layouts/default.vue`，確認 `navigation` 陣列是否有此頁面的連結。若無 → 加入導航項目（label、icon、to）
6. **⚠️ 功能覆蓋驗證（必須執行！）**
   - 拿步驟 4 的對照表，逐列標記 ✅ 或 ❌
   - 若有任何 ❌ → 補做後重新驗證
   - 檢查 Mock 資料量是否 ≥ 11 筆，不足則補建
7. **⚠️ 規範合規檢查（必須執行！）**
   - testid 是否全部對應 `elements.md`
   - 型別是否從 `types/api/` import（禁止定義 local interface）
   - 深淺模式是否正常（禁止寫死顏色值）
8. **若步驟 6-7 發現缺漏 → 修復後重新驗證**
9. **向用戶確認（必須使用下方結構化格式，包含步驟 4 的對照表）**
10. **確認後才進入下一個功能**

## 每個功能必讀資源 Checklist

> 每個功能開始實作前，必須讀取以下資源：
> - **共用規範**：rules.md、page-builder.md、components.md、features.md（若有啟用 additionalFeatures）
> - **共用元件**：`app/components/common/*.vue`
> - **API 總覽**：`glob server/api/**/*.ts`
> - **該功能專屬**：對應的 `.dsl.feature`、API endpoint 原始碼、`types/api/` 型別、`.flow.md`（若存在）

## 實作順序建議

1. 認證（登入/登出）
2. 主要 CRUD（球隊 CRUD）
3. 關聯資料（球員管理）
4. 進階功能

## 單一功能完成後的確認格式（必須使用）

> ⚠️ 若覆蓋表有任何 ❌，**必須先修復再向用戶確認**。

```
「XXX」功能已完成

已建立/修改：
- `app/pages/xxx.vue`
- ...

Scenario 覆蓋：
| Scenario | 對應 UI | 狀態 |
|----------|---------|------|
| 查詢球員列表 | UTable + 搜尋框 | ✅ |
| 建立球員 | Modal + 表單 | ✅ |
| 調整球員順序 | vuedraggable | ✅ |
| 刪除球員 | 確認 Modal | ✅ |

資料驗證：
- Mock 資料：12 筆（≥11 ✅）
- API 路徑：全部確認 ✅
- testid：對應 elements.md ✅

確認後繼續實作下一個功能？
```

## 頁面實作範本

詳見 [page-builder.md](../page-builder.md)

---

## Patch 模式流程（sync 增量修改）

> 適用於 sync-report 標記為「修改」的頁面。目標：**最小化改動，保留現有程式碼**。

### 步驟

1. **讀取 sync-report 中該頁面的變動項**
   - 確認哪些 feature 有變更、變更內容是什麼
2. **讀取受影響的 `.dsl.feature`**（只讀變更的 feature，不讀未變更的）
3. **讀取現有 `.vue` 原始碼**
4. **讀取相關資源**（types/api、API 端點、共用元件、store、flow）
5. **定位驗證**（確認 patch 目標程式碼存在）
   - 針對每個預計修改的區塊，用 Grep 確認現有程式碼中存在預期的目標（如 schema 變數名、函式名、template 區塊）
   - ✅ 找到 → 繼續 Edit
   - ❌ 找不到 → **自動升級為 rebuild**，向用戶說明原因
   - 常見定位目標：`const schema = z.object`、`function openCreate`、`<UFormField label=`、`data-testid=`
6. **逐項 Edit**（使用 Edit tool，不 Write 整個檔案）
7. **完成後確認**（一次確認即可）

   ```
   Patch 完成：/teams

   受影響的 Features：
   - 04-建立球隊.dsl.feature（修改：新增 description 欄位）

   修改摘要：
   - [template] 建立表單 Modal → 新增 description 輸入欄位（UTextarea）
   - [script] handleCreate 函式 → body 物件新增 description 欄位

   Scenario 覆蓋（含未變更 feature）：
   | Scenario | 狀態 | 備註 |
   |----------|------|------|
   | 查詢球隊列表 | ✅ 未動 | 03 無變化 |
   | 建立球隊 | ✅ 已更新 | 新增 description |
   | 刪除球隊 | ✅ 未動 | 05 無變化 |

   確認後繼續？
   ```

8. **功能覆蓋驗證**（含未變更 feature 的 Scenario 確認，確保 patch 沒有破壞既有功能）

### Patch 注意事項

| 情況 | 處理 |
|------|------|
| patch 找不到預期的程式碼位置 | 在改動清單中標記「⚠️ 無法定位，建議改用 rebuild」，用戶確認 |
| 手動改過的 Vue 被 patch | patch 只 Edit 受影響部分，不動其他程式碼，手動修改保留 |
| 多 feature 對應同一頁面，只有部分改 | patch 只改受影響的區塊，確認清單列出「不影響的部分」 |

---

## Rebuild 模式流程（sync 重大變更）

> 適用於 sync-report 標記為「重大變更」的頁面。目標：**完整重寫，但保持原有風格**。

### 步驟

1. **讀取現有 `.vue` 程式碼**，記錄風格特徵：
   - 排版慣例（縮排、空行風格）
   - 命名慣例（變數名、函式名風格）
   - 元件使用方式（slot 寫法、props 傳遞風格）
   - 自訂邏輯（手動加的額外功能）
2. **向用戶確認覆蓋範圍**（列出步驟 1 記錄的自訂邏輯摘要）：
   ```
   Rebuild 將覆蓋：/teams

   偵測到的自訂邏輯（將被覆蓋）：
   - handleExport() 函式（手動新增的匯出功能）
   - 自訂的 CSS class .team-highlight

   （若無自訂邏輯則顯示「無自訂邏輯，可直接覆蓋」）

   確認後開始 rebuild？
   ```
3. **按 build 模式完整走一遍**（讀 feature → 對照表 → 實作 → 驗證）
4. **生成時參考舊程式碼風格**，保持一致
5. **整檔覆蓋**（Write），因為變更幅度太大，Edit 反而容易出錯

### Rebuild 注意事項

| 情況 | 處理 |
|------|------|
| 手動改過的 Vue 被 rebuild | rebuild 會整頁覆蓋，手動修改消失（**預期行為**，應回推 SDD 修正 feature） |
| 想保留手動修改 | 應使用 patch 模式，或先將手動修改回推到 .feature |
