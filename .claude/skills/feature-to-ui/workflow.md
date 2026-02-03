# Feature to UI 完整工作流程

## Phase 0: 準備工作

### 0.1 載入必要資源

1. **載入 NuxtUI 文檔**：執行 `/nuxt-ui`

2. **讀取 PM 設定並同步**
   - 讀取 `@.ai-prompts/ui/ui-config-pm.yaml`
   - 同步到 `@.ai-prompts/ui/ui-config.yaml`

3. **掃描並讀取所有 .feature 檔**
   - 路徑：`docs/gherkin-spec/features/*.dsl.feature`
   - ⚠️ **必須讀取全部檔案**，不可跳過或只處理部分

### 0.2 PM 設定同步邏輯

| PM 設定檔欄位 | ui-config.yaml 欄位 | 轉換規則 |
|--------------|---------------------|----------|
| `project.name` | `project.name` | 直接複製 |
| `selectedPreset` | `selectedPreset` | 同時更新 `theme.colors` |
| `toast.displaySeconds` | `toast.duration` | 秒 → 毫秒 (×1000) |
| `toast.position` | `toast.position` | 中文轉英文 |
| `table.itemsPerPage` | `table.pagination.defaultPageSize` | 直接複製 |

**Toast 位置轉換：**

| 中文 | 英文 |
|------|------|
| 右上角 | top-right |
| 左上角 | top-left |
| 上方置中 | top-center |
| 右下角 | bottom-right |
| 左下角 | bottom-left |
| 下方置中 | bottom-center |

### 0.3 功能清單分析報告

```markdown
## 功能清單分析

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

## Phase 1: Mock API

### 1.1 目錄結構

```
server/
├── mock/
│   └── data/
│       ├── index.ts
│       ├── users.ts
│       ├── teams.ts
│       └── players.ts
└── api/
    ├── auth/
    │   ├── login.post.ts
    │   └── logout.post.ts
    └── teams/
        ├── index.get.ts
        └── [id].get.ts
```

### 1.2 Server 端 Import 規則

> ⚠️ **Server 端無法使用 `~/` alias，必須使用相對路徑**

```typescript
// ❌ 錯誤
import { mockUsers } from '~/server/mock/data/users'

// ✅ 正確
import { mockUsers } from '../../mock/data/users'
```

### 1.3 Mock 資料格式

從 .feature Background 提取：

```typescript
// server/mock/data/users.ts
export const mockUsers = [
  { account: 'admin', password: 'pass123', role: '管理者', status: 'active' },
  { account: 'coach1', password: 'pass123', role: '教練', status: 'active' },
]
```

### 1.4 API 端點範例

```typescript
// server/api/auth/login.post.ts
import { mockUsers } from '../../mock/data/users'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const user = mockUsers.find(u => u.account === body.account)

  if (!user || user.password !== body.password) {
    throw createError({
      statusCode: 401,
      message: '帳號或密碼錯誤'
    })
  }

  return {
    status: 'success',
    data: {
      accessToken: 'mock-token',
      user: { account: user.account, role: user.role }
    }
  }
})
```

---

## Phase 2: 基礎架構

### 2.1 風格選擇（必要步驟）

> ⚠️ **每次執行都必須詢問用戶選擇風格**

詢問格式：

> 請選擇專案的視覺風格：
>
> | # | 風格 | 說明 | 模式 |
> |---|------|------|------|
> | 1 | dark-default | Dracula 霓虹風 | 深色 |
> | 2 | light-default | 清新自然風 | 淺色 |
> | 3 | dark-aqua | 深海青綠風 | 深色 |
> | 4 | light-winter | 冬日清爽風 | 淺色 |
> | ... | ... | ... | ... |

### 2.2 色彩主題設定

**A. Tailwind 預設色**（大多數情況）：

```typescript
// app/app.config.ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'teal',
      secondary: 'cyan',
    },
  },
})
```

**B. Hex 色碼**：

1. 到 https://uicolors.app 產生 50-950 色階
2. 寫入 `main.css`：

```css
/* app/assets/css/main.css */
@import "tailwindcss";
@import "@nuxt/ui";

@theme static {
  --color-primary-50: #fff0f7;
  --color-primary-500: #ff359a;
  --color-primary-950: #580024;
}
```

> ⚠️ 必須使用 `@theme static`（注意 `static` 關鍵字）

### 2.3 Layout 設定

**default.vue**（含 Sidebar）：

```vue
<template>
  <div class="flex h-screen overflow-hidden">
    <aside class="hidden lg:flex w-64 border-r">
      <!-- Sidebar -->
    </aside>
    <div class="flex flex-1 flex-col">
      <header class="h-16 border-b">
        <!-- Header -->
      </header>
      <main class="flex min-h-0 flex-1 flex-col p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
```

**auth.vue**（無 Sidebar）：

```vue
<template>
  <div class="flex min-h-screen items-center justify-center">
    <slot />
  </div>
</template>
```

### 2.4 共用組件

```
app/components/common/
├── ListContainer.vue    # 列表頁面容器（含 pagination）
├── ConfirmModal.vue     # 確認對話框
├── PageHeader.vue       # 頁面標題區
└── EmptyState.vue       # 空狀態顯示
```

### 2.5 確認其他偏好

> 請確認以下偏好：
>
> 1. **明暗模式**：
>    - A) 支援切換
>    - B) 只用淺色
>    - C) 只用深色
>
> 2. **Layout 風格**：
>    - A) 左側 Sidebar
>    - B) 頂部導航
>    - C) Sidebar + 可收合

---

## Phase 3: 功能實作

### 3.1 執行原則

1. **一次只做一個功能**
2. **完成後詢問確認**
3. **參考 page-builder.md 規範**

### 3.2 實作順序建議

1. 認證（登入/登出）
2. 主要 CRUD（球隊 CRUD）
3. 關聯資料（球員管理）
4. 進階功能

### 3.3 單一功能實作流程

1. **分析 Feature**
   - 表單欄位
   - API 端點
   - 成功/錯誤行為

2. **產生程式碼**
   - 頁面檔案
   - Composable（如需要）
   - Store（如需要）

3. **詢問確認**
   > 「使用者登入」功能已完成
   >
   > 已建立：
   > - `app/pages/login.vue`
   > - `app/composables/useAuth.ts`
   >
   > 測試帳號：coach1 / pass123
   >
   > 確認後繼續實作下一個功能

---

## 禁止事項

- ❌ 跳過步驟直接實作多個功能
- ❌ 不等用戶確認就繼續
- ❌ 自行決定風格偏好
- ❌ 忽略 ui-config.yaml 設定

## 必須遵守

- ✅ 每個 Phase 完成後詢問確認
- ✅ 每個功能完成後詢問確認
- ✅ 使用 /nuxt-ui 查詢組件用法
- ✅ 從 .feature 提取所有錯誤訊息
