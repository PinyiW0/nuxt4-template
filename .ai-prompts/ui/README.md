# UI 生成系統說明

此系統根據 `.feature` 規格檔自動產生 NuxtUI 前端介面。

---

## 文件結構

```
.ai-prompts/ui/
├── README.md                    # 本文件（系統說明）
├── ui-config-pm.yaml            # PM 填寫的設定檔（非技術人員）
├── ui-config.yaml               # 工程師設定檔（技術細節）
└── style-presets.yaml           # 風格預設（light/dark 預設色碼）

.claude/skills/feature-to-ui/
├── SKILL.md                     # Skill 入口定義
├── rules.md                     # 共用規則權威來源
├── phases/                      # 各 Phase 執行步驟
├── page-builder.md              # DSL 解析 + 表單範本
├── components.md                # 元件使用規範
└── responsive.md                # 響應式規範
```

---

## 設定檔分工

| 文件 | 填寫者 | 用途 |
|------|--------|------|
| `ui-config-pm.yaml` | PM | 專案名稱、品牌色彩、UX 偏好、測試帳號 |
| `ui-config.yaml` | 工程師 / AI 自動同步 | 技術細節、CSS class、組件配置 |
| `style-presets.yaml` | 工程師 | light/dark 預設色碼（PM 未填時的 fallback） |

### PM → 工程師 同步對照表

```
ui-config-pm.yaml                    ui-config.yaml
─────────────────                    ──────────────
project.name                    →    project.name
project.description             →    project.description
project.locale                  →    project.locale
customColors.light.*            →    theme.colors.light.*（非空值覆蓋）
customColors.dark.*             →    theme.colors.dark.*（非空值覆蓋）
colorMode.default               →    colorMode.default
colorMode.enableToggle          →    colorMode.enabled
toast.displaySeconds            →    toast.duration（×1000）
toast.position（中文）           →    toast.position（英文）
table.itemsPerPage              →    table.pagination.defaultPageSize
deleteConfirmation.*            →    delete.confirmation.*
testAccounts                    →    testAccounts（Mock API 用）
additionalFeatures.*            →    additionalPackages.*.required
```

---

## 執行流程

```
/feature-to-ui
│
├── Phase 0: 準備工作
│   ├── 讀取 ui-config-pm.yaml → 同步到 ui-config.yaml
│   ├── 掃描 *.dsl.feature 檔案
│   ├── 產出功能清單 + 路由規劃 + API 合約規格
│   ├── 產生 route-map.yaml（後續 Phase 的唯一參照來源）
│   └── 詢問用戶確認
│
├── Phase 1: Mock API
│   ├── 從 .feature Background 提取測試資料
│   ├── 建立 types/api/ 型別定義
│   ├── 建立 server/api/ 端點
│   └── 詢問用戶確認
│
├── Phase 2: 基礎設定（色彩主題）
│   ├── 讀取 theme.colors.light + theme.colors.dark
│   ├── 建立 app.config.ts（色彩映射）
│   ├── 建立 main.css（:root / .dark + @theme inline 雙模式色階）
│   └── 詢問用戶確認
│
├── Phase 3: 路由骨架
│   ├── 根據 route-map.yaml 建立空白頁面檔案
│   └── 詢問用戶確認
│
├── Phase 4: Layout 建置
│   ├── 建立 layouts/（default, auth 等）
│   ├── 更新 app.vue（加入 UApp + NuxtLayout）
│   └── 詢問用戶確認
│
├── Phase 5: 共用元件
│   ├── 建立 components/common/（PageHeader, ConfirmModal 等）
│   └── 詢問用戶確認
│
└── Phase 6: 頁面實作
    ├── 逐一實作功能頁面
    ├── 每個頁面完成後詢問用戶確認
    └── 確認後才進入下一個頁面
```

---

## 色彩系統

### 雙模式架構

支援 light/dark 使用**完全不同的色相**，透過三層 CSS 結構實現：

```
ui-config.yaml (theme.colors.light / dark)
  → main.css (:root + .dark + @theme inline)
    → app.config.ts (語義色名映射)
```

### 技術細節

- `:root` 定義 light 色值（`--raw-{色名}-50~950`）
- `.dark` 覆蓋 dark 色值
- `@theme inline` 用 `var()` 引用，讓 Tailwind utility class 隨模式切換
- **必須用 `@theme inline`**（不是 `static`），否則 `.dark` 覆蓋無效
- NuxtUI 透過 `.dark` class 切換深淺模式

### 支援的語義色名（7 個）

`primary` | `secondary` | `success` | `info` | `warning` | `error` | `neutral`

---

## 快速開始

### 1. PM 填寫設定

編輯 `ui-config-pm.yaml`：

```yaml
project:
  name: "我的專案"
  description: "專案描述"
  locale: "zh-TW"

customColors:
  light:
    primary: "#00ba7b"
  dark:
    primary: "#e50006"

testAccounts:
  - username: "admin"
    password: "admin123"
    role: "管理員"
```

### 2. 執行 UI 生成

```bash
/feature-to-ui
```

### 3. 逐步確認

每個 Phase 完成後，AI 會詢問確認，確認後才繼續下一步。

---

## 輸出結構

```
app/
├── app.vue                      # 根組件（UApp + NuxtLayout）
├── app.config.ts                # 色彩主題映射
├── assets/css/main.css          # 雙模式色階（:root / .dark + @theme inline）
├── layouts/
│   ├── default.vue              # 主要 Layout（含 Sidebar）
│   └── auth.vue                 # 登入頁 Layout
├── components/common/
│   ├── PageHeader.vue           # 頁面標題 + 操作按鈕
│   ├── ConfirmModal.vue         # 確認對話框
│   └── ...
├── pages/
│   ├── index.vue                # 首頁
│   ├── login.vue                # 登入頁
│   └── ...                      # 其他功能頁面
├── composables/
│   └── useAuth.ts               # 認證 composable
└── stores/
    └── auth.ts                  # 認證 store

server/api/                      # Mock API 端點
docs/route-map.yaml              # 路由對照表（Phase 0 產生）
```

---

## 注意事項

1. **每階段都會詢問確認**：不會跳過任何確認步驟
2. **Phase 6 逐一實作**：每個頁面確認後才下一個
3. **設定優先**：所有樣式從 `ui-config.yaml` 讀取，禁止寫死色彩值
4. **Mock 優先**：先建 Mock API，UI 可完整測試
5. **route-map.yaml 是唯一參照**：Phase 3-6 及後續迭代都以此為準
