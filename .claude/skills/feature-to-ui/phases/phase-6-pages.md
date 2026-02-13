# Phase 6: 頁面實作

## 必讀規範

```
必須讀取：
- 該功能對應的 .feature 檔案
- ui-config.yaml > form（表單設定）
- ui-config.yaml > toast（通知設定）
- ui-config.yaml > colorMode（深淺模式）
- page-builder.md（DSL 解析 + 表單範本 + 列表範本）
- rules.md（全部規則）

⚠️ 必須先掃描 API 端點結構：
執行 glob server/api/**/*.ts 取得實際 API 路徑列表

若存在，額外讀取（testid + 操作流程來源）：
- docs/e2e-flows/pages/{對應頁面}.elements.md
- docs/e2e-flows/{NN}-{name}.flow.md
- docs/e2e-flows/_common.flow.md

執行 /nuxt-ui 載入組件文檔（若尚未載入）
```

## 執行步驟

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
4. **實作頁面**（基於步驟 3 讀取的實際程式碼和 testid 定義，不是憑記憶）
   - 所有 `data-testid` 必須與 `elements.md` 中定義的一致
   - 若 `.flow.md` 描述了特定操作步驟，確保 UI 元素的 testid 對應正確
5. **⚠️ 功能覆蓋驗證（必須執行！）**
   - 重新讀取該頁面的所有 `.feature` 檔
   - 逐一列出每個 Scenario，比對是否有對應 UI 實作
   - 比對 DSL Command 關鍵字 → UI 元件（參考 [page-builder.md](../page-builder.md) Command 表）
   - 檢查 Mock 資料量是否 ≥ 11 筆，不足則補建
6. **⚠️ 規範合規檢查（必須執行！）**
   - testid 是否全部對應 `elements.md`
   - 型別是否從 `types/api/` import（禁止定義 local interface）
   - 深淺模式是否正常（禁止寫死顏色值）
7. **若步驟 5-6 發現缺漏 → 修復後重新驗證**
8. **向用戶確認（必須使用下方結構化格式）**
9. **確認後才進入下一個功能**

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
