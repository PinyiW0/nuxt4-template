# UI 生成系統說明

此系統根據 `.feature` 規格檔自動產生 NuxtUI 前端介面。

---

## 文件結構

```
.ai-prompts/ui/
├── README.md                    # 本文件（系統說明）
├── ui-config-pm.yaml             # PM 填寫的設定檔（非技術人員）
├── ui-config.yaml                # 工程師設定檔（技術細節）
├── feature-to-ui-workflow.md     # 完整工作流程（AI 執行依據）
└── nuxt-ui-page-builder.md      # 頁面建構規範

.claude/skills/feature-to-ui/
└── SKILL.md                     # Skill 入口定義
```

---

## 設定檔分工

| 文件 | 填寫者 | 用途 |
|------|--------|------|
| `ui-config-pm.yaml` | PM | 專案名稱、風格選擇、UX 偏好、測試帳號 |
| `ui-config.yaml` | 工程師 / AI 自動同步 | 技術細節、CSS class、組件配置 |

### PM → 工程師 同步對照表

```
ui-config-pm.yaml                    ui-config.yaml
─────────────────                    ──────────────
project.name                    →    project.name
project.description             →    project.description
selectedPreset                  →    selectedPreset + theme.colors
toast.displaySeconds            →    toast.duration（×1000）
toast.position（中文）           →    toast.position（英文）
table.itemsPerPage              →    table.pagination.defaultPageSize
deleteConfirmation.*             →    delete.confirmation.*
testAccounts                    →    testAccounts（Mock API 用）
additionalFeatures.*            →    additionalPackages.*.required
```

---

## 執行流程

```
┌─────────────────────────────────────────────────────────────────┐
│  /feature-to-ui                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Phase 0: 準備工作                                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 1. 載入 /nuxt-ui skill                                   │    │
│  │ 2. 讀取 ui-config-pm.yaml                                 │    │
│  │ 3. 同步設定到 ui-config.yaml                               │    │
│  │ 4. 讀取 nuxt-ui-page-builder.md                          │    │
│  │ 5. 掃描 *.dsl.feature 檔案                                │    │
│  │ 6. 產出功能清單 → 詢問用戶確認                              │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Phase 1: 建立 Mock API                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 1. 從 .feature Background 提取測試資料                    │    │
│  │ 2. 從 testAccounts 建立登入用假帳號                        │    │
│  │ 3. 建立 API 端點（server/api/）                           │    │
│  │ 4. 完成 → 詢問用戶確認                                     │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Phase 2: 基礎架構設定                                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 1. 詢問風格選擇（8 種預設風格）                             │    │
│  │ 2. 設定色彩主題（app.config.ts + main.css）                │    │
│  │ 3. 建立 Layout（default, auth）                          │    │
│  │ 4. 建立共用組件                                           │    │
│  │ 5. 套用 ui-config.yaml 設定到程式碼                         │    │
│  │ 6. 詢問明暗模式 / Layout 風格偏好                           │    │
│  │ 7. 完成 → 詢問用戶確認                                     │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Phase 3: 逐一實作功能                                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ for each feature:                                       │    │
│  │   1. 分析 .feature 內容                                  │    │
│  │   2. 產生頁面 / composable / store                       │    │
│  │   3. 完成 → 詢問用戶確認                                  │    │
│  │   4. 確認後才進入下一個功能                                │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 風格預設一覽

| 代號 | 名稱 | 模式 | 適用場景 |
|------|------|------|----------|
| `tech-blue` | 科技藍 | 淺色 | 數據分析系統 |
| `sport-orange` | 活力橘 | 淺色 | 運動訓練系統 |
| `pro-purple` | 專業紫 | 淺色 | 企業級系統 |
| `fresh-green` | 清新綠 | 淺色 | 健康管理系統 |
| `pink` | 甜美粉 | 淺色 | 生活類應用 |
| `dark-gold` | 暗夜金 | 深色 | 專業工具 |
| `aqua` | 深海青 | 深色 | 數據儀表板 |
| `winter` | 冬日風 | 淺色 | 通用型應用 |

---

## 快速開始

### 1. PM 填寫設定

編輯 `ui-config-pm.yaml`：

```yaml
project:
  name: "我的專案"
  description: "專案描述"

selectedPreset: winter

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

每個階段完成後，AI 會詢問確認，確認後才繼續下一步。

---

## 輸出結構

執行完成後，產生以下檔案結構：

```
app/
├── app.vue                      # 根組件（含 Toast 設定）
├── app.config.ts                 # 色彩主題設定
├── assets/css/main.css          # 自定義色彩（如有）
├── layouts/
│   ├── default.vue              # 主要 Layout
│   └── auth.vue                 # 登入頁 Layout
├── components/
│   └── common/
│       ├── ListContainer.vue    # 列表容器
│       ├── ConfirmModal.vue      # 確認對話框
│       └── ...
├── pages/
│   ├── index.vue                # 首頁
│   ├── login.vue                # 登入頁
│   └── ...                      # 其他功能頁面
├── composables/
│   └── useAuth.ts               # 認證 composable
└── stores/
    └── auth.ts                  # 認證 store

server/
├── api/
│   ├── auth/
│   │   └── login.post.ts        # 登入 API
│   └── ...                      # 其他 API
└── mock/
    └── data/
        ├── users.ts             # 使用者假資料
        └── ...                  # 其他假資料
```

---

## 注意事項

1. **每階段都會詢問確認**：不會跳過任何確認步驟
2. **一次一個功能**：Phase 3 逐一實作，確認後才下一個
3. **設定優先**：所有樣式從 `ui-config.yaml` 讀取
4. **Mock 優先**：先建 Mock API，UI 可完整測試
