---
name: feature-to-ui
description: 根據 .feature 檔搭配 NuxtUI 產生完整 UI 畫面，包含 Mock API、基礎架構、逐一功能實作
disable-model-invocation: true
argument-hint: "[phase]"
context: fork
agent: general-purpose
---

# Feature to UI 工作流程

根據 .feature 規格檔，使用 NuxtUI 產生完整的前端介面。

## 使用方式

```bash
/feature-to-ui              # 從 Phase 0 開始
/feature-to-ui 0            # 執行 Phase 0: 準備工作
/feature-to-ui 1            # 執行 Phase 1: Mock API
/feature-to-ui 2            # 執行 Phase 2: 基礎架構
/feature-to-ui 3            # 執行 Phase 3: 功能實作
```

## 現有 Feature 檔案

!`ls -1 docs/gherkin-spec/features/*.feature 2>/dev/null | head -10 || echo "(無)"`

---

## 執行流程概覽

| Phase | 名稱 | Input | Output |
|-------|------|-------|--------|
| 0 | 準備工作 | .feature 檔案 | 功能清單分析報告 |
| 1 | Mock API | 功能清單 | `server/mock/`, `server/api/` |
| 2 | 基礎架構 | 用戶偏好 | Layout, 共用組件, 色彩主題 |
| 3 | 功能實作 | 功能清單 | `app/pages/`, `app/components/` |

**每個 Phase 完成後都會詢問用戶確認**

---

## 必讀文件

執行前必須讀取以下文件：

### 核心規範

- [workflow.md](workflow.md) - 完整工作流程
- [page-builder.md](page-builder.md) - 頁面建立規範
- [components.md](components.md) - 元件規範

### 專案設定

@.ai-prompts/ui/ui-config-pm.yaml（PM 設定，需同步到 ui-config.yaml）
@.ai-prompts/ui/ui-config.yaml

### NuxtUI 文檔

執行 `/nuxt-ui` 載入官方文檔

---

## Phase 0: 準備工作

### Input
- `.feature` 檔案路徑

### 執行步驟

1. 載入 `/nuxt-ui` 取得組件文檔
2. 讀取 PM 設定並同步到 `ui-config.yaml`
3. 掃描 `docs/gherkin-spec/features/*.feature`
4. 產出功能清單分析報告
5. **詢問用戶確認**

### Output
- 功能清單分析報告（含 API 端點規劃）

---

## Phase 1: Mock API

### Input
- Phase 0 的功能清單

### 執行步驟

1. 從 .feature Background 建立 mock data
2. 建立 API 端點（成功/失敗情境）
3. **詢問用戶確認**

### Output
```
server/
├── mock/data/
│   ├── users.ts
│   └── teams.ts
└── api/
    └── auth/login.post.ts
```

---

## Phase 2: 基礎架構

### Input
- 用戶風格偏好

### 執行步驟

1. **詢問用戶選擇風格預設**（每次都要問）
2. 設定色彩主題（`app.config.ts` + `main.css`）
3. 建立 Layout（default, auth）
4. 建立共用組件
5. **詢問用戶確認其他偏好**

### Output
```
app/
├── app.config.ts
├── assets/css/main.css
├── layouts/
│   ├── default.vue
│   └── auth.vue
└── components/common/
    ├── ListContainer.vue
    └── ConfirmModal.vue
```

---

## Phase 3: 功能實作

### Input
- Phase 0 的功能清單

### 執行步驟

1. 按優先順序逐一實作功能
2. **每完成一個功能就詢問用戶確認**
3. 確認後才進入下一個功能

### Output
- 各功能的頁面和組件

---

## 注意事項

- **每個 Phase 完成後都要詢問確認**
- **Phase 3 每個功能完成後都要詢問確認**
- 所有設定從 `ui-config.yaml` 讀取
- 禁止自行決定網站名稱、色彩等設定
- Context Recovery 後仍需遵守確認流程
