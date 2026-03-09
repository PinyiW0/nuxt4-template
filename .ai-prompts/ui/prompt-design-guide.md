# UI Prompt 設計指南

> 說明如何使用 Claude Code 的 Skill 機制，設計出 `/feature-to-ui` 這套多階段 prompt 系統。
> 適合作為「用 AI 設計 AI prompt」的參考案例。

---

## 目錄

- [1. 設計目標與挑戰](#1-設計目標與挑戰)
- [2. 架構決策：Fork 隔離 + 檔案傳遞](#2-架構決策fork-隔離--檔案傳遞)
- [3. Phase 拆分策略](#3-phase-拆分策略)
- [4. 規範系統設計](#4-規範系統設計)
- [5. 設定檔系統設計](#5-設定檔系統設計)
- [6. Sync 模式設計](#6-sync-模式設計)
- [7. 模板與約束設計](#7-模板與約束設計)
- [8. 踩坑紀錄與防禦措施](#8-踩坑紀錄與防禦措施)
- [9. 檔案清單與統計](#9-檔案清單與統計)

---

## 1. 設計目標與挑戰

### 設計目標

從 `.dsl.feature` 業務規格檔，自動產出完整的 Nuxt 4 + NuxtUI v3 前端應用（含 Mock API、Layout、共用元件、頁面實作）。

### 面臨的挑戰

| 挑戰 | 說明 |
|------|------|
| **Context 有限** | 一個中型專案有 20+ 個 feature 檔、10+ 頁面、數十個 API 端點，無法在單一對話中處理完 |
| **品質不一致** | AI 每次執行可能產出不同風格的程式碼，元件用法、命名規則、testid 不統一 |
| **無記憶** | AI 不記得前面做了什麼，後面的 Phase 可能和前面衝突 |
| **迭代需求** | 專案會持續演進，不能每次都從零重建 |
| **跨角色協作** | PM 決定品牌色彩，工程師處理技術細節，兩者不應混在一起 |

---

## 2. 架構決策：Fork 隔離 + 檔案傳遞

### 為什麼不用單一對話

不使用 fork 的問題：

1. **Context 耗盡**：Phase 0 讀了 20 個 feature 檔、Phase 1 又讀了 types 和 mock data，到 Phase 6 時 context window 已滿，AI 品質下降
2. **資訊干擾**：Phase 6 寫表單時，context 裡還殘留 Phase 2 的色彩計算過程，AI 被無關資訊分散注意力

### Fork 隔離方案

使用 Claude Code 的 `context: fork`，每個 Phase 在獨立 context 中執行：

```yaml
# SKILL.md
context: fork    # 每次呼叫都開新的 context
```

```
Phase 0（子代理 A）              Phase 1（子代理 B）
┌─────────────────┐             ┌─────────────────┐
│ 分析 feature    │             │ 讀取 Phase 0    │
│ 產出 route-map  │──寫入檔案──→│ 留下的檔案      │
│ context 釋放    │             │ 建立 mock API   │
└─────────────────┘             └─────────────────┘
      ↕ 不共享記憶 ↕
```

### 三個設計原則

1. **每個 Phase 的產出必須是檔案** — Phase 間唯一的溝通管道是磁碟
2. **每個 Phase 必須有「必讀清單」** — 啟動時什麼都不知道，靠清單重建上下文
3. **Phase 間的合約要穩定** — `route-map.yaml` 的結構就是 Phase 0 和 Phase 1-6 之間的 API，不能隨意變動

### 實作方式

每個 Phase 的 `.md` 檔開頭都有明確的「必讀規範」：

```markdown
## 必讀規範

必須讀取：
- docs/route-map.yaml              ← Phase 0 寫的分析結果
- app/types/api/*.ts               ← Phase 0 寫的合約型別
- server/api/**/*.ts               ← Phase 1 寫的 API 端點（先 glob 確認）
- app/components/common/*.vue      ← Phase 5 寫的共用元件
- rules.md [P6]                    ← 規則手冊（只讀自己的段落）
```

> 詳見 [skill-phase-design.md](skill-phase-design.md)

---

## 3. Phase 拆分策略

### 拆分原則：一個 Phase 做一件事

| Phase | 責任 | 產出 | 為何獨立 |
|-------|------|------|---------|
| 0 | 分析規格 | route-map.yaml + types | 需讀全部 feature（context 消耗大） |
| 1 | 建 Mock API | server/api/ + mock/ | 需讀 types + 產大量 mock data |
| 2 | 色彩主題 | main.css + app.config | 獨立設定，不依賴其他 Phase |
| 3 | 路由骨架 | pages/*.vue 空殼 | 快速建立結構，不需功能邏輯 |
| 4 | Layout | layouts/*.vue + app.vue | 需使用者選擇樣式偏好 |
| 5 | 共用元件 | components/common/ | 被 Phase 6 所有頁面依賴 |
| 6 | 頁面實作 | pages/*.vue 完整 | 最複雜，需讀最多資源，**逐一功能執行** |

### 骨架優先的理由

Phase 0-5 建立「空架構」，Phase 6 才填充功能。好處：

1. **架構錯誤及早發現** — Phase 3 建完空殼就能檢查路由結構
2. **元件先存在** — Phase 6 實作時，共用元件已在 Phase 5 建好，直接引用
3. **型別先定義** — Phase 0 建 types，Phase 1 建 API，Phase 6 import 使用，三層自然對齊
4. **平行開發** — Phase 2-5 之間可平行（實務上按順序，但理論上獨立）

### Phase 6 的特殊設計

Phase 6 是最複雜的 Phase，因為要逐一實作每個頁面。設計了多重保護：

1. **逐一功能執行** — 每個功能完成後詢問確認，不一次全做
2. **強制前置讀取** — 每個功能開始前，必須 glob API、讀 types、讀元件、讀 flow
3. **Feature → UI 對照表** — 實作前先列表，實作後逐列驗證
4. **規範合規檢查** — testid、型別 import、深淺模式
5. **TypeCheck** — 實作完執行 `npx nuxi typecheck`

---

## 4. 規範系統設計

### 問題：共用規則散落各處

多個 Phase 會碰到相同的問題（配色、元件用法、API 格式），如果規則寫在各自的 phase 檔裡，修改時要改好幾個地方。

### 解法：rules.md + Tag 系統

所有共用規則**集中在一個 `rules.md`**，以 `[Px]` tag 標記適用哪些 Phase：

```markdown
## 配色策略 [P2, P4, P5, P6]

primary + neutral 佔 90%，語意色（success/error/warning/info）佔 10%。
禁止使用 secondary、accent 或具體色名（blue, purple）。

## Zod v4 規範 [P6]

使用 z.number({ error: '...' }) 或 .min(1, '...')。
禁止 v3 的 required_error 寫法。

## Server API 類型規範 [P1]

event 必須標 H3Event。
陣列索引存取用 ! 斷言。
```

每個 Phase 的規範檔指示「讀取 rules.md 中標有 `[Px]` 的段落」，實現：

- **集中管理** — 修一處，所有 Phase 生效
- **按需載入** — 每個 Phase 只讀自己的段落，節省 context
- **版本一致** — 不會出現 Phase 1 和 Phase 6 的命名規則不同的問題

### 規範檔的層次

```
rules.md                      ← 跨 Phase 共用規則（權威來源）
  ↑ 被引用
phase-*.md                     ← 各 Phase 的執行步驟（只引用 rules.md 的特定段落）
components.md                  ← 元件模板庫（Phase 5/6 使用）
page-builder.md                ← DSL → UI 對照（Phase 6 使用）
features.md                    ← 額外功能手冊（Phase 5/6 按需使用）
```

### 規範的來源：踩坑驅動

rules.md 中的每條規則，幾乎都來自實際踩坑：

| 規則 | 踩坑場景 |
|------|---------|
| TableColumn 用 `accessorKey` 不是 `id` | Nuxt UI v3 更換了 API，AI 用舊語法 |
| USelect 禁止 `value: ''` | 空字串讓「全部」選項無法選中 |
| Pinia store 必須明確 import | Nuxt 4 移除了 auto-import，AI 沒 import 導致 runtime error |
| 必先 `glob server/api/**/*.ts` | AI 假設 API 路徑存在，實際上沒建 |
| 禁止 `globalThis.$fetch` | AI 為繞過型別檢查自作聰明 |
| 禁止 `.map()` 轉換 mock data | AI 手動挑欄位導致型別和 mock 不一致 |
| event 標 H3Event | tsconfig.server.json strict 模式要求 |
| 深淺模式必須雙向檢查 | 亮色在白底/深色在黑底都可能對比不足 |

---

## 5. 設定檔系統設計

### 問題：PM 和工程師關注不同事情

PM 決定品牌色彩、網站名稱、UX 偏好，但不懂 CSS 變數和 Tailwind class。
工程師需要具體的技術設定（色階、breakpoint、元件 prop）。

### 解法：雙層設定檔

```
PM 填寫（簡單中文）              Phase 0 自動同步              AI/工程師使用（技術細節）
┌───────────────────┐          ┌──────────────┐            ┌──────────────────────┐
│ ui-config-pm.yaml │───同步──→│ Phase 0      │───產出───→│ ui-config.yaml       │
│                   │          │ 讀取 PM yaml │            │                      │
│ ・專案名稱        │          │ 翻譯/轉換    │            │ ・Tailwind 色階設定  │
│ ・品牌色（hex）   │          │ 合併到工程版 │            │ ・CSS class 規則     │
│ ・顯示幾秒（數字）│          └──────────────┘            │ ・元件 prop 配置     │
│ ・位置（右上角）  │                                      │ ・響應式斷點         │
└───────────────────┘                                      └──────────────────────┘
```

### 同步時的轉換

有些欄位不是直接複製，需要轉換：

| PM yaml | 轉換邏輯 | ui-config.yaml |
|---------|---------|----------------|
| `toast.displaySeconds: 3` | ×1000 | `toast.duration: 3000` |
| `toast.position: "右上角"` | 中文→英文 | `toast.position: "top-right"` |
| `theme.colors.primary: "#D7263D"` | 有值就覆蓋 | `theme.colors.primary: "#D7263D"` |
| `theme.colors.error: ""` | 空值保留，Phase 2 fallback | `theme.colors.error: ""` → 預設 red |

### 為什麼不合併成一個檔案

1. **權限分離** — PM 不該看到也不需要碰技術設定
2. **防止誤改** — PM 改色碼不會影響元件配置
3. **AI 只讀一個** — Phase 1-6 只讀 `ui-config.yaml`，不需處理 PM 格式

---

## 6. Sync 模式設計

### 問題：每次都從零建太慢

專案迭代時，可能只改了一個欄位或新增一個功能，不需要重建整個 UI。

### 解法：content_hash + 機械式判定

**Phase 0 全量模式**會在 `route-map.yaml` 中為每個 feature 記錄 `content_hash`：

```yaml
routes:
  - path: "/teams"
    features:
      - file: "03-查詢球隊列表.dsl.feature"
        content_hash: "a1b2c3d4"    # 檔案內容的 hash
```

**Phase 0 Sync 模式**比對新舊 hash：

| 比對結果 | 判定 |
|---------|------|
| 不存在於 route-map | 新增（build） |
| hash 不同 | 進入 checklist 判定 patch 或 rebuild |
| hash 相同 | 無變化（skip） |
| route-map 有但檔案不存在 | 刪除（delete） |

### 為什麼用機械式 Checklist 而非 AI 判斷

讓 AI「自行判斷」變更程度，結果不可預測——有時小改判成 rebuild，有時大改判成 patch。

改用**明確的 checklist**，遇到即停止：

```
1. 端點路徑有變更？           → rebuild
2. 全新 Command 類型？        → rebuild
3. 欄位增減 > 2？             → rebuild
4. 新增 Scenario：
   a) 欄位驗證型             → patch
   b) 新功能型               → rebuild
5. 僅措辭/數值微調           → patch
```

每次判定都要**記錄依據**（走到 checklist 哪一條），方便 review：

```
| 04-建立球隊 | 修改 | patch | 新增 1 欄位 + 2 Scenario 皆為驗證 → #4a → patch |
| 07-查詢球員 | 修改 | rebuild | 新增搜尋功能(新功能型) → #4b → rebuild |
```

### Sync Report 的設計

`sync-report.md` 不只是變更清單，還包含**下游影響推導**和 **Phase 執行建議**：

```markdown
## Phase 執行建議

| Phase | 建議 | 原因 |
|-------|------|------|
| Phase 1 | 執行 | 型別變更：新增 description 欄位 |
| Phase 2 | 跳過 | 設定檔無變更 |
| Phase 3 | 跳過 | 無新增路由 |
| Phase 4 | 跳過 | 無新增路由 |
| Phase 5 | 跳過 | 無新增共用元件需求 |
| Phase 6 | 執行 | patch: /teams, rebuild: /players |
```

---

## 7. 模板與約束設計

### page-builder.md — DSL → UI 對照

為了讓 AI 對同一種 DSL 關鍵字（如「查詢列表」「建立」）**每次產出一致的 UI**，定義了明確的對照表：

```
「查詢 XXX 列表」 → UTable + 搜尋框（必須）
「建立 XXX」      → 表單 + Modal
「刪除 XXX」      → 確認 Modal（CommonConfirmModal）
「批次刪除」      → UTable checkbox + 批次按鈕
「匯出 XXX」      → UButton（blob 下載）
```

每種對應都附帶完整的程式碼範本（Zod schema + submit handler + template），AI 直接參考範本產出，減少變異。

### components.md — 元件樣板庫

定義各種 UI 元件的「標準寫法」，包含：

- **列表頁面完整範本** — script setup + template（含 UTable 樣式、分頁、hover）
- **表格固定樣式** — `:ui` prop 和 `class` 的寫法
- **滾動區域模式** — flex column + `min-h-0`（踩過坑才加的）
- **搜尋框/篩選下拉** — 固定寫法和 testid

### 約束 > 範例

設計 prompt 規範時，**明確禁止比正面範例更有效**：

```markdown
## 禁止事項

- 禁止定義 local interface → 必須 import ~/types/api/
- 禁止 globalThis.$fetch → 修正路徑或建 API
- 禁止 .map() 轉換 mock data → 直接回傳
- 禁止 secondary/accent 色 → 只用 primary + neutral + 語意色
```

AI 容易「自作聰明」繞過型別檢查或自訂格式，明確禁止能堵住這些漏洞。

### 自檢機制

Phase 6 在實作完成後，強制執行三重驗證：

1. **Feature → UI 對照表** — 逐列打勾，確保每個 feature 都有 UI
2. **規範合規檢查** — testid、型別 import、深淺模式、API 路徑
3. **TypeCheck** — `npx nuxi typecheck` 確認型別正確

---

## 8. 踩坑紀錄與防禦措施

### AI 常見問題與對策

| 問題 | 現象 | 防禦措施 | 寫在哪 |
|------|------|---------|--------|
| **API 路徑假設** | AI 寫了 `$fetch('/api/teams/sort')`，但這個 API 不存在 | Phase 6 強制 `glob server/api/**/*.ts`，確認後才寫 | rules.md [P6] |
| **繞過型別** | AI 用 `globalThis.$fetch` 跳過型別檢查 | 明確禁止 | rules.md [P6] |
| **Mock 不一致** | AI 用 `.map()` 挑選欄位，型別和 mock 不對齊 | 禁止 `.map()` 轉換，直接回傳 mock data | rules.md [P1] |
| **用舊 API** | TableColumn 用 `id` + `label`（Nuxt UI v2 語法） | 明確標注新語法 `accessorKey` + `header` | rules.md [P5, P6] |
| **Auto-import 依賴** | Pinia store 沒 import，Nuxt 4 不自動 import | 強制明確 import | rules.md [P6] |
| **忘記深色模式** | 只寫了 light mode 的樣式 | 要求雙向對比色 class（`text-primary-600 dark:text-primary-400`） | rules.md [P2-P6] |
| **USelect 空值** | `value: ''` 讓「全部」選項無法選中 | 禁止空字串，用 `undefined` + `placeholder` | rules.md [P5, P6] |
| **固定寬度** | AI 寫死 `w-[500px]` 破壞響應式 | 禁止固定寬度，Modal 用 `w-full sm:max-w-md` | rules.md [P6] |
| **Zod v3 語法** | AI 用 `required_error` 而非 v4 的 `error` | 明確標注 v4 寫法 | rules.md [P6] |
| **色彩映射錯誤** | `error: 'error'` → Tailwind 沒有叫 error 的色 | 定義空值 fallback 表（error→red） | phase-2-theme.md |

### Context 管理技巧

| 技巧 | 說明 |
|------|------|
| **Tag 系統** | rules.md 的 `[Px]` 讓每個 Phase 只載入需要的規則 |
| **必讀清單** | 每個 Phase 明確列出要讀什麼，不多讀 |
| **逐一功能** | Phase 6 一次只做一個功能，完成後釋放 context 再做下一個 |
| **按需載入 features.md** | 只在 `enabled_features` 啟用時才讀，平常不佔 context |
| **DSL 對照表** | 用表格快速對照，不需要長篇解釋 |

---

## 9. 檔案清單與統計

### Skill 定義檔（13 個）

| 檔案 | 行數 | 用途 |
|------|------|------|
| `SKILL.md` | ~155 | Skill 入口定義、使用說明、自動執行規則 |
| `rules.md` | ~293 | 跨 Phase 共用規則（14 個章節，以 [Px] tag 分類） |
| `components.md` | ~364 | 元件模板庫（列表、表單、Modal 的標準寫法） |
| `features.md` | ~325 | 6 種額外功能的套件選型與 Wrapper 元件模板 |
| `page-builder.md` | ~304 | DSL → UI 對照表 + 登入/CRUD 表單完整範本 |
| `phase-0-prep.md` | ~330 | 全量模式：分析 feature → route-map + types |
| `phase-0-sync.md` | ~243 | Sync 模式：hash 比對 → 變更判定 → sync-report |
| `phase-1-mock-api.md` | ~257 | Mock 資料 + API 端點建置 |
| `phase-2-theme.md` | ~260 | 色彩主題：main.css + app.config + SEO |
| `phase-3-skeleton.md` | ~138 | 路由骨架：所有頁面空殼 |
| `phase-4-layout.md` | ~299 | Layout 建置 + app.vue 更新 |
| `phase-5-components.md` | ~209 | 共用元件：ListContainer/ConfirmModal/PageHeader/EmptyState |
| `phase-6-pages.md` | ~266 | 頁面實作（含 build/patch/rebuild/delete 模式） |

### 設定與文檔（6 個）

| 檔案 | 行數 | 用途 |
|------|------|------|
| `ui-config-pm.yaml` | ~127 | PM 設定檔（品牌色彩、UX 偏好、測試帳號） |
| `ui-config.yaml` | ~294 | 完整技術規範（CSS、元件、響應式、icon） |
| `prompt-architecture.md` | — | 架構總覽：I/O 對照、Phase 流程、使用情境 |
| `prompt-design-guide.md` | — | 本文件：設計理念、方法論、踩坑紀錄 |
| `skill-phase-design.md` | ~97 | Fork 隔離設計模式說明 |
| `README.md` | ~199 | 快速開始指南 |

### NuxtUI 載入（1 個）

| 檔案 | 行數 | 用途 |
|------|------|------|
| `nuxt-ui/SKILL.md` | ~118 | NuxtUI 官方文檔載入工具 |

### 總計

| 項目 | 數量 |
|------|------|
| Prompt 檔案總數 | 20 個 |
| Prompt 總行數 | ~4,000 行 |
| Phase 數量 | 7 個（Phase 0-6，Phase 0 含全量 + Sync 兩個子模式） |
| rules.md 規則章節 | 14 個 |
| DSL → UI 對照 | 10+ 種 |
| 額外功能支援 | 6 種（charts / dragAndDrop / richTextEditor / advancedDatePicker / fileUpload / infiniteScroll） |
| ui-config.yaml 設定欄位 | ~50 個 |
| 色彩翻譯規則 | 3 種（hex → 自訂色階 / 色名 → Tailwind 內建 / 空值 → 預設 fallback） |
| Sync 變更判定規則 | 5 條 checklist |

---

## 設計原則總結

1. **Fork 隔離** — 每個 Phase 獨立 context，透過檔案傳遞，避免 context 耗盡
2. **SSoT** — 每種資訊只有一個權威來源，避免不一致
3. **骨架優先** — 先建架構再填功能，架構穩定後才實作
4. **機械式判斷** — 變更程度用 checklist 判定，不依賴 AI 猜測
5. **Tag 按需載入** — 規則集中管理，各 Phase 只載入相關段落
6. **禁止 > 範例** — 明確禁止比正面範例更能防止 AI 亂來
7. **雙層設定** — PM 和工程師各有專屬設定檔，自動同步
8. **踩坑驅動** — 每條規則都來自實際問題，不是空想
