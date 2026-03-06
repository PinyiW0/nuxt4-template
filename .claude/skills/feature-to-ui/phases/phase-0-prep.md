# Phase 0: 準備工作

## 必讀規範

```
僅需讀取：
- .ai-prompts/ui/ui-config-pm.yaml（PM 設定）
- docs/gherkin-spec/features/*.feature（所有 feature 檔）

Sync 模式額外讀取：
- docs/route-map.yaml（現有路由對照表）
- app/types/api/*.ts（現有型別定義，欄位級比對基準）
```

---

## 模式判斷

Phase 0 開始前，先檢查 `docs/route-map.yaml` 是否存在：

| 條件 | 模式 | 行為 |
|------|------|------|
| `route-map.yaml` **不存在** | **全量模式** | 執行下方「全量模式執行步驟」（現有流程不動） |
| `route-map.yaml` **存在** | **Sync 模式** | 執行下方「Sync 模式步驟」（增量偵測 + 變更報告） |

---

## 全量模式執行步驟

1. **讀取 PM 設定**
   - 讀取 `ui-config-pm.yaml`
   - 同步到 `ui-config.yaml`（參考下方同步邏輯）
   - 記錄 `additionalFeatures` 中值為 `true` 的項目（後續步驟 6 寫入 route-map）

2. **掃描所有 .feature 檔**
   - 路徑：`docs/gherkin-spec/features/*.dsl.feature`
   - ⚠️ **必須讀取全部檔案**

3. **產出功能清單**（見下方格式）

4. **產出路由規劃**（見下方格式）

5. **建立 API 合約型別**（直接寫入 `app/types/api/*.ts`）
   - 根據 feature 分析結果，直接建立 TypeScript 型別定義檔
   - 每個資源一個檔案（如 `teams.ts`、`auth.ts`）
   - 建立 `index.ts` 統一 re-export
   - ⚠️ 欄位命名使用 `snake_case`（與未來後端 API 對齊）
   - ⚠️ 日期欄位使用 `string`（JSON 不支援 `Date`）
   - ⚠️ **必須建在 `app/types/api/`**，Nuxt 4 的 `~` 別名解析到 `app/`
   - 見下方「API 合約型別範例」

6. **產生路由對照表**（`docs/route-map.yaml`）
   - 根據步驟 3-5 的分析結果，自動產生路由對照檔
   - 此檔案是後續所有 Phase 及 **update 迭代的唯一參照來源**
   - ⚠️ **`api_contract` 區塊**：包含 `types`（型別欄位快照，作為 Sync diff 基準；程式碼 SSoT 仍是 `app/types/api/*.ts`）和 `endpoints`（端點規格）
   - 見下方「路由對照表格式」

7. **產出前自檢**（寫入檔案前逐項確認）
   - □ `/` 根路由存在（`navigateTo` 到第一個主要頁面）
   - □ 每個 `.dsl.feature` 都有對應的路由
   - □ `app/types/api/*.ts` 涵蓋所有端點的 Request/Response 型別
   - □ `api_contract.types` 的欄位與 `app/types/api/*.ts` 的 export interface 一一對應
   - □ `api_contract.endpoints` 與各路由的 `api_endpoints` 一致
   - □ `enabled_features` 反映 PM yaml 的 `additionalFeatures`（有啟用的功能才寫入）
   - □ 啟用功能的頁面已標註 `features_used`

8. **詢問用戶確認**（含路由對照表內容）

---

## PM 設定同步邏輯

| PM 設定欄位 | ui-config.yaml 欄位 | 轉換規則 |
|------------|---------------------|----------|
| `project.name` | `project.name` | 直接複製 |
| `project.description` | `project.description` | 直接複製 |
| `project.locale` | `project.locale` | 直接複製 |
| `project.favicon` | `project.favicon` | 直接複製 |
| `meta.keywords` | `meta.keywords` | 直接複製 |
| `meta.author` | `meta.author` | 直接複製 |
| `meta.og.image` | `meta.og.image` | 直接複製 |
| `meta.og.type` | `meta.og.type` | 直接複製 |
| `theme.colors.*` | `theme.colors.*` | 非空值覆蓋預設，空值 fallback 到 Tailwind 內建色 |
| `colorMode.default` | `colorMode.default` | 直接複製（system / light / dark） |
| `colorMode.enableToggle` | `colorMode.enabled` | 直接複製 |
| `toast.displaySeconds` | `toast.duration` | 秒 → 毫秒 (×1000) |
| `toast.position` | `toast.position` | 中文轉英文 |
| `table.itemsPerPage` | `table.pagination.defaultPageSize` | 直接複製 |
| `table.enablePagination` | `table.pagination.enabled` | 直接複製 |
| `table.emptyMessage` | `table.emptyState.label` | 直接複製 |
| `deleteConfirmation.title` | `delete.confirmation.title` | 直接複製 |
| `deleteConfirmation.message` | `delete.confirmation.description` | 直接複製（欄位名不同） |
| `deleteConfirmation.confirmButtonText` | `delete.confirmation.confirmButton.label` | 直接複製（結構不同） |
| `deleteConfirmation.cancelButtonText` | `delete.confirmation.cancelButton.label` | 直接複製（結構不同） |
| `testAccounts` | `testAccounts` | 直接複製 |
| `additionalFeatures.*`（boolean） | `additionalFeatures.*.required` | `true` → `true`，`false` → `false` |

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

## API 合約型別範例

Phase 0 直接建立 `app/types/api/*.ts`，消除 YAML → TypeScript 翻譯誤差。

### 型別檔案結構

```
app/types/api/
├── index.ts     # 統一 re-export
├── auth.ts      # LoginData
├── teams.ts     # TeamItem, CreateTeamBody
└── players.ts   # PlayerItem, CreatePlayerBody
```

### 型別檔範例

```typescript
// app/types/api/teams.ts
export interface TeamItem {
  id: number
  name: string
  player_count: number
  created_by: string
  created_at: string
}

export interface CreateTeamBody {
  name: string
}
```

```typescript
// app/types/api/index.ts — 統一 re-export
export type { LoginData } from './auth'
export type { CreateTeamBody, TeamItem } from './teams'
```

> ⚠️ **命名慣例**：欄位 `snake_case`、型別 `PascalCase`、日期用 `string`
>
> ⚠️ 此型別是前端自定義的合約，未來後端 API Spec 到位後只需修改 `types/api/` 即可對齊。

---

## 路由對照表格式（route-map.yaml）

用戶確認後，將此對照表寫入 `docs/route-map.yaml`。此檔案是後續 Phase 3-6 及 **update 迭代的唯一參照來源**。

```yaml
# docs/route-map.yaml
# 由 /feature-to-ui Phase 0 自動產生
# ⚠️ 可手動修改，修改後以此為準

generated_at: "2026-01-20"
version: 1

# PM 啟用的額外功能（來自 ui-config-pm.yaml > additionalFeatures）
# 只列出值為 true 的項目；全部 false 時省略此區塊
# Phase 5 據此建立對應元件，Phase 6 據此在頁面中使用
# 各功能的實作規範 → 見 features.md
enabled_features:
  - charts              # 統計圖表
  - dragAndDrop         # 拖曳排序

# API 合約規格
api_contract:
  # 回傳格式慣例
  response_conventions:
    list: "{ status: 'success', data: T[], meta: { total, page, page_size } }"
    single: "{ status: 'success', data: T }"
    action: "{ status: 'success', message: '...' }"
    error: "throw createError({ statusCode, message })"

  # 型別欄位快照（鏡像 app/types/api/*.ts，作為 Sync diff 基準）
  # 程式碼層面的 SSoT 仍是 app/types/api/*.ts
  # 手動修改只改 *.ts，此區塊由 Phase 0 自動同步覆蓋
  types:
    TeamItem:
      file: teams.ts
      fields:
        id: number
        name: string
        player_count: number
        created_by: string
        created_at: string
    CreateTeamBody:
      file: teams.ts
      fields:
        name: string

  # 端點規格（方法 + 路徑 + Request/Response 型別名引用）
  endpoints:
    - method: POST
      path: /api/auth/login
      request: "{ account: string, password: string }"
      response: LoginData
    - method: GET
      path: /api/teams
      request: "query: { page?, page_size? }"
      response: "TeamItem[]"
    - method: POST
      path: /api/teams
      request: CreateTeamBody
      response: TeamItem

routes:
  - path: "/login"
    page: "app/pages/login.vue"
    layout: "auth"
    features:
      - file: "01-使用者登入.dsl.feature"
        content_hash: "a1b2c3d4"
    api_endpoints:
      - "POST /api/auth/login"
    components: []
    store: "auth"

  - path: "/teams"
    page: "app/pages/teams/index.vue"
    layout: "default"
    features:
      - file: "03-查詢球隊列表.dsl.feature"
        content_hash: "e5f6g7h8"
      - file: "04-建立球隊.dsl.feature"
        content_hash: "i9j0k1l2"
    api_endpoints:
      - "GET /api/teams"
      - "POST /api/teams"
    components:
      - "PageHeader"
      - "ListContainer"
      - "ConfirmModal"
    store: null
    features_used: []           # 此頁面使用的 additionalFeature（空則省略或留空陣列）

  # 範例：使用 additionalFeature 的頁面
  # - path: "/analytics/[id]"
  #   features_used: [charts]   # Phase 6 據此引用圖表元件
```

### 欄位說明

| 欄位 | 說明 |
|------|------|
| `enabled_features` | PM 啟用的額外功能清單（來自 `additionalFeatures`，Phase 5/6 消費，見 `features.md`） |
| `api_contract` | API 合約規格 |
| `api_contract.response_conventions` | 回傳格式慣例 |
| `api_contract.types` | 型別欄位快照（鏡像 `app/types/api/*.ts`，Sync diff 基準；手動修改只改 `*.ts`，此區塊由 Phase 0 自動覆蓋） |
| `api_contract.endpoints` | 端點規格（方法 + 路徑 + Request/Response 型別引用） |
| `path` | 路由路徑 |
| `page` | 頁面檔案路徑（相對於專案根目錄） |
| `layout` | 使用的 Layout 名稱 |
| `features` | 對應的 .feature 檔案（物件陣列，含 `file` 和 `content_hash`） |
| `api_endpoints` | 會呼叫的 API 端點列表（引用 `api_contract.endpoints` 的路徑） |
| `components` | 使用的共用元件 |
| `store` | 使用的 Pinia store（null 表示不使用） |
| `features_used` | 此頁面使用的 `enabled_features` 項目（Phase 6 據此引用對應元件） |

### 推導規則

| Feature 類型 | 路由推導 | 說明 |
|-------------|---------|------|
| （無 feature 對應） | `/` → `index.vue` | **必建**：根路由，Phase 3 放空殼，Phase 6 填入 `navigateTo` |
| `使用者登入` / `使用者登出` | `/login` | 認證類功能合併到登入頁 |
| `查詢 XXX 列表` | `/xxx` (複數) | 列表頁 |
| `建立 XXX` / `編輯 XXX` / `刪除 XXX` | 同列表頁 | CRUD 合併到同一個列表頁 |
| `查看 XXX 詳情` | `/xxx/[id]` | 詳情頁 |
| `XXX 的子功能` | `/xxx/[id]/yyy` | 巢狀路由 |

> ⚠️ **根路由必建**：即使沒有 feature 對應 `/`，route-map.yaml 也必須包含 `/` 路由。Phase 3 建空殼，Phase 6 填入 `navigateTo('/xxx', { redirectCode: 302 })`。**禁止使用 301**（永久重定向會被瀏覽器快取，影響同 port 的其他專案）。

> ⚠️ **一個頁面可對應多個 feature**：例如球隊列表頁同時處理「查詢」「建立」「編輯」「刪除」四個 feature。
>
> ⚠️ **Phase 3 必須讀取此檔案**：建立頁面骨架時，以 route-map.yaml 為準。
>
> ⚠️ **Phase 6 必須讀取此檔案**：實作頁面時，根據 features 欄位確認要實作哪些功能。

### features 格式說明

features 欄位使用物件陣列，每個物件包含 `file`（檔名）和 `content_hash`（內容雜湊）：

```yaml
features:
  - file: "03-查詢球隊列表.dsl.feature"
    content_hash: "a1b2c3d4"
```

- `content_hash` 使用 `shasum -a 256` 計算 feature 檔案內容
- Sync 模式用此 hash 判斷 feature 是否有變更
- **向下相容**：讀到舊格式（字串陣列）→ 視為無 hash，全部標記為需要比對

計算方式（shell，統一使用 `shasum -a 256`，macOS/Linux 皆內建）：
```bash
shasum -a 256 docs/gherkin-spec/features/03-查詢球隊列表.dsl.feature | awk '{print $1}'
```

---

## Sync 模式步驟

> 僅當 `docs/route-map.yaml` 存在時進入此流程。

### 步驟 1：讀取 PM 設定 + 設定檔變更偵測

同全量模式，讀取 `ui-config-pm.yaml` 並同步到 `ui-config.yaml`。

同步完成後，比對同步前後的 `ui-config.yaml` 差異，記錄變更的設定區塊：

| 變更的設定區塊 | 影響的 Phase |
|--------------|-------------|
| `theme.colors` | Phase 2 |
| `project.*`（name, description, favicon） | Phase 2 |
| `meta.*`（keywords, author, og） | Phase 2 |
| `colorMode.*` | Phase 2 |
| `table.*` | Phase 5 |
| `delete.*` | Phase 5 |
| `toast.*` | Phase 4（UApp toaster 設定） |
| `responsive.sidebar.*` | Phase 4 |

> 此偵測結果會在步驟 8 產出「Phase 執行建議」時使用。

### 步驟 2：讀取現有 route-map.yaml

- 解析所有已登錄的路由、features（含 `content_hash`）
- 記錄當前 `version` 欄位值

### 步驟 3：掃描所有新版 .dsl.feature

- 路徑：`docs/gherkin-spec/features/*.dsl.feature`
- 計算每個檔案的 `content_hash`

### 步驟 4：讀取現有型別定義

- 讀取 `app/types/api/*.ts` 的所有 export interface / type
- 建立「型別名 → 欄位清單」對照表（作為欄位級比對基準）

### 步驟 5：逐一比對每個 feature

| 情況 | 判定 |
|------|------|
| route-map 中找不到此 feature | 標記「**新增**」 |
| 找到但 `content_hash` 不同 | 進入步驟 6 分析變更程度 |
| 找到且 `content_hash` 相同 | 標記「**無變化**」 |
| route-map 中有但 feature 檔已不存在 | 標記「**刪除**」 |

### 步驟 6：變更程度判斷

> ⚠️ 機械式規則，不是 AI 猜測。**必須按下方 checklist 逐步判定，並在變更報告中附上判定過程**。

#### 判定 Checklist（依序執行，遇到 ✅ 即停止）

```
□ 1. 端點路徑是否有變更（改名/刪除）？
     → 是 → rebuild（停止）
     → 否 → 繼續

□ 2. 是否出現全新的 Command 類型（如：從未有過的 API 操作）？
     → 是 → rebuild（停止）
     → 否 → 繼續

□ 3. 計算欄位增減數量 = |新增欄位數| + |刪除欄位數|
     → > 2 → rebuild（停止）
     → ≤ 2 → 繼續

□ 4. 計算新增 Scenario 數量，並逐一分類：
     a) 「欄位驗證型」：Scenario 名稱或內容可明確對應到新增欄位
        （如：「體重超出範圍」對應新增的 weight 欄位）
     b) 「新功能型」：無法對應到任何新增欄位
        （如：「搜尋球員」「AI 狀態篩選」「分頁」）

     → 存在任何「新功能型」Scenario → rebuild（停止）
     → 全部都是「欄位驗證型」→ patch（停止）

□ 5. 以上皆否（僅措辭/數值微調、Background 資料微調）
     → patch
```

#### 判定結果記錄格式

在變更報告的「Feature 變更總覽」表格中，`說明` 欄須包含判定依據：

```markdown
| 04-建立球隊 | 修改 | patch | /teams | 新增 1 欄位(簡介) + 2 Scenario 皆為該欄位驗證 → checklist #4a → patch |
| 12-查詢訓練列表 | 修改 | rebuild | /trainings | 新增 6 Scenario 含搜尋/篩選/分頁(新功能型) → checklist #4b → rebuild |
```

> ⚠️ **不附判定依據 = 違規**。這是確保判定可追溯、可驗證的關鍵。

### 步驟 7：推導下游影響

根據步驟 5-6 的結果，推導受影響的下游產出：

| 變更 | 影響範圍 |
|------|---------|
| 欄位變更 | → 對應的 `types/api/*.ts` → import 該型別的 API 端點 → 使用該型別的頁面 |
| Scenario 變更 | → 對應頁面的 UI 邏輯 |
| 端點路徑變更 | → `server/api/` 端點 → 呼叫該端點的頁面 |
| 新增 feature | → 可能需要新型別、新端點、新路由、新頁面 |
| 刪除 feature | → 標記待刪除項目（Phase 6 開始時確認後執行） |

### 步驟 7.5：additionalFeatures 變更偵測

- 比對 PM yaml 的 `additionalFeatures` 與現有 `route-map.yaml > enabled_features`
- 新啟用的功能 → 在變更報告中標註，Phase 5 需要建立對應元件
- 關閉的功能 → 在待刪除項目中標記（不自動移除）

### 步驟 8：產出變更報告

將分析結果寫入 **`docs/sync-report.md`**。

> ⚠️ 因為 `context: fork`，Phase 間無法共享對話記憶，所以必須持久化為檔案。後續 Phase 讀取此報告決定行為。

#### Phase 執行建議的強制規則

產出「Phase 執行建議」表格時，**必須依序檢查以下規則**：

| Phase | 條件 | 建議 |
|-------|------|------|
| Phase 1 | 型別變更或端點變更表格有任何「新增」或「修改」 | ✅ 執行 |
| Phase 2 | 設定檔變更偵測到 `theme.colors`、`project.*`、`meta.*`、`colorMode.*` 有變更 | ✅ 執行（否則跳過） |
| Phase 3 | 路由變更表格有任何「新增」 | ✅ 執行 |
| **Phase 4** | **路由變更表格有任何「新增」，或設定檔變更偵測到 `toast.*`、`responsive.sidebar.*` 有變更** | **✅ 執行** |
| Phase 5 | 新路由使用了尚未建立的共用元件，或設定檔變更偵測到 `table.*`、`delete.*` 有變更 | ✅ 執行（否則跳過） |
| Phase 6 | 頁面實作指令有任何 build/patch/rebuild | ✅ 執行 |

> ⚠️ **Phase 4 跟 Phase 3 的觸發條件相同**：有新路由 → 兩者都必須執行。Phase 3 建空殼頁面，Phase 4 把新路由加入 sidebar 導航。

格式見下方「變更報告格式」。

### 步驟 9：更新 route-map.yaml

- `version` 遞增（如 1 → 2）
- 新增的 feature → 加入對應路由的 features 陣列（或建立新路由條目）
- hash 變更的 feature → 更新 `content_hash`
- 刪除的 feature → **不自動移除**，僅在報告中標記待刪除
- ⚠️ **同步更新 `api_contract`**：新增/修改的型別 → 更新 `api_contract.types`（鏡像 `app/types/api/*.ts` 的欄位）；新增/修改的端點 → 更新 `api_contract.endpoints`
- ⚠️ **同步更新 `enabled_features`**：反映 PM yaml 最新的 `additionalFeatures`
- 更新 `generated_at` 為今天日期

### 步驟 10：詢問用戶確認

向用戶展示：
1. 變更報告摘要（Feature 變更總覽表格）
2. Phase 執行建議（哪些 Phase 需要跑、哪些可跳過）
3. 待刪除項目（提醒用戶手動處理）
4. 更新後的 route-map.yaml 變更

確認後才寫入檔案。

---

## 變更報告格式（docs/sync-report.md）

```markdown
# Sync 變更報告

generated_at: YYYY-MM-DD
base_version: 1
sync_version: 2

## 設定檔變更

| 設定區塊 | 變更內容 | 影響 Phase |
|---------|---------|-----------|
| （若無變更則顯示「設定檔無變更」） | | |

## Feature 變更總覽

| Feature 檔 | 狀態 | 模式 | 影響頁面 | 說明 |
|------------|------|------|---------|------|
| 03-查詢球隊列表.dsl.feature | 無變化 | skip | — | hash 相同 |
| 04-建立球隊.dsl.feature | 修改 | patch | /teams | 新增 1 個欄位 |
| 12-新增教練.dsl.feature | 新增 | build | /coaches | 全新功能 |
| 05-刪除球隊.dsl.feature | 刪除 | — | /teams | feature 檔已不存在 |

## 型別變更

| 檔案 | 動作 | 詳細變更 |
|------|------|---------|
| app/types/api/teams.ts | 修改 | CreateTeamBody 新增 `description` 欄位 |
| app/types/api/coaches.ts | 新增 | CoachItem, CreateCoachBody |

## 端點變更

| 端點 | 動作 | 影響型別 | 影響頁面 |
|------|------|---------|---------|
| POST /api/teams | 修改 | CreateTeamBody | /teams |
| GET /api/coaches | 新增 | CoachItem[] | /coaches |
| POST /api/coaches | 新增 | CreateCoachBody | /coaches |

## 路由變更

| 路由 | 動作 | 頁面 | Features |
|------|------|------|---------|
| /coaches | 新增 | app/pages/coaches/index.vue | 12-新增教練 |

## 頁面實作指令

| 頁面 | 模式 | 變更的 Features | 說明 |
|------|------|----------------|------|
| /teams | patch | 04-建立球隊 | 新增欄位，Edit 受影響區塊 |
| /coaches | build | 12-新增教練 | 全新頁面 |
| /login | skip | — | 無變化 |

## Phase 執行建議

| Phase | 建議 | 原因 |
|-------|------|------|
| Phase 0 | ✅ 已完成 | 本次執行 |
| Phase 1 | ✅ 執行 | 有型別/端點新增或修改 |
| Phase 2 | ⏭️ 跳過 | 設定檔無變更（theme/project/meta/colorMode） |
| Phase 3 | ✅ 執行 | 有新增路由 |
| Phase 4 | ✅ 執行 | 有新增路由（需加入 sidebar 導航） |
| Phase 5 | ⏭️ 跳過 | 共用元件無變更 |
| Phase 6 | ✅ 執行 | 有 build/patch 頁面 |

<!-- Phase 4 判斷規則已移至步驟 8「Phase 執行建議的強制規則」表格 -->

## 待刪除項目（Phase 6 開始時確認後執行）

> Phase 6 增量模式會在最開始讀取此區塊，向用戶確認後再執行刪除。

| 類型 | 路徑 | 原因 |
|------|------|------|
| feature 參照 | route-map.yaml > /teams > 05-刪除球隊 | feature 檔已不存在 |
| 型別（待確認） | app/types/api/teams.ts > DeleteTeamBody | 若 05 是唯一使用者 |
| 端點（待確認） | DELETE /api/teams/[id] | 若 05 是唯一使用者 |
```

### 邊界情況處理

| 情況 | 處理方式 |
|------|---------|
| Scenario 邏輯變動但端點/欄位沒變 | content_hash 偵測到 feature 有改，標記為「修改」，Phase 6 patch |
| 多 feature 對應同一頁面，只有部分改 | patch 只改受影響的區塊，「頁面實作指令」列出變更的 Features |
| feature 改名（舊刪新增） | 報告同時列出刪除+新增，使用者確認時自行判斷 |
| route-map 手動加的路由（無 feature） | sync 不動此路由，不標記刪除 |
| Phase 1 改型別影響未標記的端點 | 修改型別後掃描所有 import 該型別的端點，補入報告 |
| 讀到舊格式 route-map（features 為字串陣列） | 視為無 hash，全部 feature 進入完整比對 |
