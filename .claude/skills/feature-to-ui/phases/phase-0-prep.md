# Phase 0: 準備工作

## 必讀規範

```
僅需讀取：
- .ai-prompts/ui/ui-config-pm.yaml（PM 設定）
- docs/gherkin-spec/features/*.feature（所有 feature 檔）
```

## 執行步驟

1. **讀取 PM 設定**
   - 讀取 `ui-config-pm.yaml`
   - 同步到 `ui-config.yaml`（參考下方同步邏輯）

2. **掃描所有 .feature 檔**
   - 路徑：`docs/gherkin-spec/features/*.dsl.feature`
   - ⚠️ **必須讀取全部檔案**

3. **產出功能清單**（見下方格式）

4. **產出路由規劃**（見下方格式）

5. **產出 API 合約規格**（見下方格式）
   - 定義統一的回傳格式慣例
   - 定義各端點的 Request / Response 結構
   - 定義資料型別名稱與欄位（Phase 1 會寫入 `types/api/`）
   - ⚠️ 欄位命名使用 `snake_case`（與未來後端 API 對齊）
   - ⚠️ 日期欄位使用 `string`（JSON 不支援 `Date`）

6. **產生路由對照表**（`docs/route-map.yaml`）
   - 根據步驟 3-5 的分析結果，自動產生路由對照檔
   - 此檔案是後續所有 Phase 及 **update 迭代的唯一參照來源**
   - 見下方「路由對照表格式」

7. **詢問用戶確認**（含路由對照表內容）

---

## PM 設定同步邏輯

| PM 設定欄位 | ui-config.yaml 欄位 | 轉換規則 |
|------------|---------------------|----------|
| `project.name` | `project.name` | 直接複製 |
| `project.description` | `project.description` | 直接複製 |
| `project.locale` | `project.locale` | 直接複製 |
| `customColors.*` | `theme.colors.*` | 非空值覆蓋預設，空值 fallback 到 Tailwind 內建色 |
| `colorMode.default` | `colorMode.default` | 直接複製（system / light / dark） |
| `colorMode.enableToggle` | `colorMode.enabled` | 直接複製 |
| `toast.displaySeconds` | `toast.duration` | 秒 → 毫秒 (×1000) |
| `toast.position` | `toast.position` | 中文轉英文 |
| `table.itemsPerPage` | `table.pagination.defaultPageSize` | 直接複製 |
| `deleteConfirmation.*` | `delete.confirmation.*` | 對應欄位複製 |
| `testAccounts` | `testAccounts` | 直接複製 |

---

## 輸出格式：功能清單

```markdown
## 功能清單

### 認證相關
- [ ] 登入頁面 (01-使用者登入.dsl.feature)
- [ ] 登出功能 (02-使用者登出.dsl.feature)

### 球隊管理
- [ ] 球隊列表 (03-查詢球隊列表.dsl.feature)
- [ ] 建立球隊 (04-建立球隊.dsl.feature)

### 資料模型
| 實體 | 欄位 | 來源 |
|------|------|------|
| User | account, role, status | 01-使用者登入 |
| Team | id, name, playerCount | 03-查詢球隊列表 |

### API 端點規劃
| 端點 | 方法 | 用途 | 來源 |
|------|------|------|------|
| /api/auth/login | POST | 登入 | 01 |
| /api/teams | GET | 球隊列表 | 03 |
```

---

## 輸出格式：路由規劃

```markdown
## 路由規劃

| 路由 | 頁面 | Layout | 功能來源 |
|------|------|--------|----------|
| /login | login.vue | auth | 01-使用者登入 |
| / | index.vue | default | 首頁/Dashboard |
| /teams | teams/index.vue | default | 03-查詢球隊列表 |
```

---

## 輸出格式：API 合約規格

```markdown
## API 合約規格

### 回傳格式慣例
| 類型 | 格式 |
|------|------|
| 列表 | `{ status: 'success', data: T[] }` |
| 單筆 | `{ status: 'success', data: T }` |
| 操作成功 | `{ status: 'success', message: '...' }` |
| 錯誤 | `throw createError({ statusCode, message })` |

### 各端點 Request / Response
| 端點 | 方法 | Request | Response.data 型別 |
|------|------|---------|-------------------|
| /api/auth/login | POST | `{ account, password }` | `LoginData` |
| /api/teams | GET | query: `{ user?, role? }` | `TeamItem[]` |

### 資料型別定義（Phase 1 寫入 types/api/）
| 型別名 | 欄位 | 說明 |
|--------|------|------|
| TeamItem | id, name, player_count, created_by, created_at, status | 球隊項目 |
| LoginData | accessToken, refreshToken, user | 登入回傳 |
```

> ⚠️ **注意**：此規格是前端自定義的合約，未來後端 API Spec 到位後只需修改 `types/api/` 即可對齊。

---

## 路由對照表格式（route-map.yaml）

用戶確認後，將此對照表寫入 `docs/route-map.yaml`。此檔案是後續 Phase 3-6 及 **update 迭代的唯一參照來源**。

```yaml
# docs/route-map.yaml
# 由 /feature-to-ui Phase 0 自動產生
# ⚠️ 可手動修改，修改後以此為準

generated_at: "2026-01-20"
version: 1

routes:
  - path: "/login"
    page: "app/pages/login.vue"
    layout: "auth"
    features:
      - "01-使用者登入.dsl.feature"
    api_endpoints:
      - "POST /api/auth/login"
    components: []
    store: "auth"

  - path: "/teams"
    page: "app/pages/teams/index.vue"
    layout: "default"
    features:
      - "03-查詢球隊列表.dsl.feature"
      - "04-建立球隊.dsl.feature"
    api_endpoints:
      - "GET /api/teams"
      - "POST /api/teams"
    components:
      - "PageHeader"
      - "ListContainer"
      - "ConfirmModal"
    store: null
```

### 欄位說明

| 欄位 | 說明 |
|------|------|
| `path` | 路由路徑 |
| `page` | 頁面檔案路徑（相對於專案根目錄） |
| `layout` | 使用的 Layout 名稱 |
| `features` | 對應的 .feature 檔案（一個頁面可對應多個 feature） |
| `api_endpoints` | 會呼叫的 API 端點列表 |
| `components` | 使用的共用元件 |
| `store` | 使用的 Pinia store（null 表示不使用） |

### 推導規則

| Feature 類型 | 路由推導 | 說明 |
|-------------|---------|------|
| `使用者登入` / `使用者登出` | `/login` | 認證類功能合併到登入頁 |
| `查詢 XXX 列表` | `/xxx` (複數) | 列表頁 |
| `建立 XXX` / `編輯 XXX` / `刪除 XXX` | 同列表頁 | CRUD 合併到同一個列表頁 |
| `查看 XXX 詳情` | `/xxx/[id]` | 詳情頁 |
| `XXX 的子功能` | `/xxx/[id]/yyy` | 巢狀路由 |

> ⚠️ **一個頁面可對應多個 feature**：例如球隊列表頁同時處理「查詢」「建立」「編輯」「刪除」四個 feature。
>
> ⚠️ **Phase 3 必須讀取此檔案**：建立頁面骨架時，以 route-map.yaml 為準。
>
> ⚠️ **Phase 6 必須讀取此檔案**：實作頁面時，根據 features 欄位確認要實作哪些功能。
