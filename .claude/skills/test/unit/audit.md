# 盤點階段規則（Phase: unit audit）📋

## 目標

掃描專案中所有可測試的程式碼檔案，判斷測試狀態和優先級，產出全局盤點報告。

---

## 核心原則

### ✅ 要做的事

1. **掃描所有分類目錄**：找出可測試的檔案
2. **檢查測試是否已存在**：對照鏡像路徑
3. **評估優先級**：根據邏輯複雜度
4. **標記建議跳過的檔案**：邏輯太薄不值得測
5. **輸出結構化報告**：方便使用者決策

### ❌ 不要做的事

1. **不要讀取完整原始碼**：只需快速掃描識別複雜度
2. **不要產生測試程式碼**：audit 只做盤點
3. **不要自動執行後續階段**：讓使用者決定優先順序

---

## 執行流程

### 步驟 1：掃描來源檔案

```bash
# 各分類的掃描範圍
glob server/api/**/*.ts          # 分類 A：API Handler
glob app/stores/**/*.ts          # 分類 B：Store
glob app/middleware/**/*.ts      # 分類 C：Middleware
glob app/pages/**/*.vue          # 分類 D：Page
glob app/components/**/*.vue     # 分類 E：Component
```

#### 排除規則

| 排除項目 | 原因 |
|---------|------|
| `server/api/_test/**` | 測試輔助 API |
| `server/mock/data/**` | 純資料檔案 |
| `app/components/**/index.ts` | 僅 re-export |
| `app/pages/**/[...slug].vue` | catch-all 路由 |
| `app/app.vue` | 應用入口（由 E2E 覆蓋） |

### 步驟 2：檢查測試狀態

對每個來源檔案，依鏡像規則檢查測試檔案是否存在：

| 來源路徑 | 測試路徑 |
|---------|---------|
| `server/api/auth/login.post.ts` | `test/unit/server/api/auth/login.post.test.ts` |
| `app/stores/auth.ts` | `test/nuxt/stores/auth.test.ts` |
| `app/middleware/auth.global.ts` | `test/nuxt/middleware/auth.global.test.ts` |
| `app/pages/teams/index.vue` | `test/nuxt/pages/teams/index.test.ts` |
| `app/components/common/X.vue` | `test/nuxt/components/common/X.test.ts` |

狀態判斷：

```
測試檔案不存在       → ❌ 未測試
測試檔案存在且通過    → ✅ 已測試
測試檔案存在但有紅燈  → 🔴 進行中
```

### 步驟 3：評估優先級

快速讀取每個檔案的 `<script setup>` 或函式內容，計算邏輯指標：

#### 優先級判斷規則

| 優先級 | 條件 | 標記 |
|--------|------|------|
| **高** | 符合下列任一條件 | 🔴 高 |
| | - 5 個以上 if/else 分支 | |
| | - 狀態機邏輯（status 切換） | |
| | - 日期計算/比較 | |
| | - 搜尋/篩選邏輯（.filter + 多條件） | |
| | - 鎖定/重試/累計邏輯 | |
| | - 批次操作 | |
| **中** | 符合下列任一條件 | 🟡 中 |
| | - 2-4 個 if/else 分支 | |
| | - CRUD 帶參數驗證 | |
| | - 有 computed + watch | |
| | - 有 try/catch 錯誤處理 | |
| **跳過** | 符合下列全部條件 | ⏭️ 跳過 |
| | - 0-1 個 if 分支 | |
| | - 純 CRUD（find → return） | |
| | - 無計算邏輯 | |
| | - 純展示元件（無事件 handler） | |

#### 各分類的跳過判斷

**API Handler**：
- ⏭️ 跳過：`[id].get.ts` 只做 find + 404 check（2 行邏輯）
- ⏭️ 跳過：`[id].delete.ts` / `[id].put.ts` 只做 find + update/delete
- ❌ 不跳過：有篩選、排序、狀態檢查的 handler

**Page**：
- ⏭️ 跳過：只有 `useFetch` + 直接渲染，沒有 computed/handler
- ❌ 不跳過：有 filteredItems、分頁、批次選取、表單驗證

**Component**：
- ⏭️ 跳過：純展示元件（只有 props + template）
- ❌ 不跳過：有 emit、v-model、事件 handler

---

## 輸出格式

### 全局盤點

```
📋 單元測試盤點
═══════════════════════════════════════════════

分類 A：API Handler → test/unit/（unit 專案）
────────────────────────────────────────────────
🔴高 ❌ server/api/auth/login.post.ts         鎖定機制、參數驗證
🔴高 ❌ server/api/ai/start.post.ts           狀態機（stopped→running）
🔴高 ❌ server/api/ai/stop.post.ts            狀態機（running→stopped）
🔴高 ❌ server/api/trainings/index.get.ts     日期篩選 + 多條件
🔴高 ❌ server/api/trainings/history.get.ts   日期篩選 + team_id
🔴高 ❌ server/api/trainings/batch-delete.post.ts  批次軟刪除
🔴高 ❌ server/api/players/sort.put.ts        排序邏輯
🔴高 ❌ server/api/player-analysis/index.get.ts  keyword 搜尋
🟡中 ❌ server/api/auth/refresh.post.ts       Token 驗證
🟡中 ❌ server/api/players/index.get.ts       active + team_id 篩選
🟡中 ❌ server/api/teams/index.get.ts         active + created_by 篩選
🟡中 ❌ server/api/ai/status.get.ts           查詢 + 404
⏭️   server/api/players/[id].put.ts           純 CRUD
⏭️   server/api/players/[id].delete.ts        純 CRUD
⏭️   server/api/teams/[id].put.ts             純 CRUD
⏭️   server/api/teams/[id].delete.ts          純 CRUD
⏭️   server/api/trainings/[id].get.ts         find + 404
⏭️   server/api/trainings/[id].delete.ts      純 CRUD
⏭️   server/api/trainings/[id]/pitches/index.get.ts     find + 回傳
⏭️   server/api/trainings/[id]/pitches/[pitchId].get.ts find + 404
⏭️   server/api/player-analysis/batch-delete.post.ts    同 trainings 的

分類 B：Store → test/nuxt/（nuxt 專案）
────────────────────────────────────────────────
🔴高 ❌ app/stores/auth.ts                    login/logout/refresh 狀態流轉

分類 C：Middleware → test/nuxt/（nuxt 專案）
────────────────────────────────────────────────
🟡中 ❌ app/middleware/auth.global.ts          4 個路由分支

分類 D：Page → test/nuxt/（nuxt 專案）
────────────────────────────────────────────────
🔴高 ❌ app/pages/index.vue                   搜尋/分頁/CRUD/AI控制/權限
🔴高 ❌ app/pages/players/index.vue            搜尋/分頁/CRUD/排序/表單驗證
🔴高 ❌ app/pages/trainings/history.vue        搜尋/分頁/批次選取+刪除
🔴高 ❌ app/pages/analysis/index.vue           搜尋/分頁/批次選取+刪除
🟡中 ❌ app/pages/teams/index.vue              搜尋/分頁/CRUD
🟡中 ❌ app/pages/trainings/[id]/index.vue     stats 計算/AI 控制/好球帶表單
🟡中 ❌ app/pages/trainings/[id]/analysis.vue  getHeatColor/getPosition
🟡中 ❌ app/pages/trainings/[id]/pitches/[pitchId].vue  落點計算/軌跡
🟡中 ❌ app/pages/analysis/[id].vue            getHeatColor/getPosition
🟡中 ❌ app/pages/login.vue                    表單驗證/密碼切換/錯誤處理

分類 E：Component → test/nuxt/（nuxt 專案）
────────────────────────────────────────────────
🟡中 ❌ app/components/common/ConfirmModal.vue  emit/loading 禁用
🟡中 ❌ app/components/common/ListContainer.vue  分頁 v-model
⏭️   app/components/common/SearchInput.vue      純展示
⏭️   app/components/common/EmptyState.vue       純展示
⏭️   app/components/common/PageHeader.vue       純展示

═══════════════════════════════════════════════
統計：
  🔴 高優先：12 個
  🟡 中優先：12 個
  ⏭️ 建議跳過：11 個
  ✅ 已完成：0 個
  ────────────
  待測試合計：24 個

建議執行順序：
  1. /test unit pipeline server/api/auth/login.post.ts
  2. /test unit pipeline server/api/ai/start.post.ts
  3. /test unit pipeline app/stores/auth.ts
  ...
```

### 單一分類盤點（`/test unit audit api`）

只輸出該分類的部分，格式同上。

---

## 分類篩選

| 指令 | 掃描範圍 |
|------|---------|
| `/test unit audit` | 全部 5 個分類 |
| `/test unit audit api` | 只有 `server/api/**` |
| `/test unit audit store` | 只有 `app/stores/**` |
| `/test unit audit middleware` | 只有 `app/middleware/**` |
| `/test unit audit page` | 只有 `app/pages/**` |
| `/test unit audit component` | 只有 `app/components/**` |

---

## 與後續階段的銜接

audit 完成後，使用者可以：

1. **按報告建議的順序**，逐一執行 pipeline：
   ```bash
   /test unit pipeline server/api/auth/login.post.ts
   ```

2. **批次處理某分類**的所有待測檔案：
   ```bash
   /test unit batch api
   ```

3. **自動處理**，從高優先開始：
   ```bash
   /test unit auto --limit 5
   ```

auto 模式會參照 audit 的優先級排序，高優先 → 中優先 → 跳過低優先。

---

## 檢查清單

- [ ] 已掃描所有 5 個分類的目錄
- [ ] 已排除不需要測試的檔案（測試輔助、純資料）
- [ ] 每個檔案都有狀態標記（❌/✅/🔴/⏭️）
- [ ] 每個檔案都有優先級標記（🔴高/🟡中/⏭️跳過）
- [ ] 高優先和中優先的檔案有簡短的邏輯描述
- [ ] 底部有統計和建議執行順序
