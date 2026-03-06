# Phase 1: Mock API

## 必讀規範

```
僅需讀取：
- app/types/api/*.ts（Phase 0 已建立的型別定義）
- docs/route-map.yaml > api_contract.endpoints（端點規格）
- docs/route-map.yaml > enabled_features（若含 dragAndDrop → 需建 sort API；若含 fileUpload → 需建 upload API）
- ui-config.yaml > testAccounts（測試帳號）
- rules.md [P1] 段落（Server API 類型規範、Mock API 回傳慣例）

Sync 模式額外讀取：
- docs/sync-report.md（變更報告的「型別變更」+「端點變更」段落）
```

> ⚠️ **型別定義（`app/types/api/*.ts`）由 Phase 0 建立**。Phase 1 讀取這些型別檔作為 mock data 和 API 端點的合約依據，不再從 YAML 翻譯型別。

---

## 增量模式判斷

Phase 1 開始前，先檢查 `docs/sync-report.md` 是否存在：

| 條件 | 模式 | 行為 |
|------|------|------|
| `sync-report.md` **不存在** | **全量模式** | 執行下方「全量模式執行步驟」（現有流程不動） |
| `sync-report.md` **存在** | **增量模式** | 讀取報告，只處理有變更的型別和端點 |

### 增量模式步驟

1. **讀取 sync-report.md** 的「型別變更」和「端點變更」表格
2. **新增的型別** → 建立新的 `app/types/api/{resource}.ts`，更新 `index.ts` 的 re-export
3. **修改的型別** → 讀取現有檔案 → Edit 受影響的欄位（新增/修改/刪除 interface 屬性）
4. **新增的端點** → 建立新的 `server/api/**/*.ts` + 對應 mock data
5. **修改的端點** → 讀取現有端點原始碼 → 根據型別變更調整回傳結構和 mock 資料
6. **刪除項目** → **不執行刪除**，列在確認清單提醒用戶
7. **掃描影響擴散** → 修改型別後，掃描所有 import 該型別的端點檔案，若回傳結構受影響則補入修改清單
8. **詢問用戶確認**（含增量變更清單）

增量確認格式：
```
Phase 1 增量更新完成

型別變更：
- ✅ app/types/api/teams.ts：CreateTeamBody 新增 description 欄位
- ✅ app/types/api/coaches.ts：新建（CoachItem, CreateCoachBody）

端點變更：
- ✅ server/api/teams/index.post.ts：調整 body 結構
- ✅ server/api/coaches/index.get.ts：新建
- ✅ server/api/coaches/index.post.ts：新建

待刪除（不自動執行）：
- ⚠️ server/api/teams/[id].delete.ts（05-刪除球隊 已移除）

確認後繼續？
```

---

## 全量模式執行步驟

1. **確認 API 合約型別**（Phase 0 已建立 `app/types/api/*.ts`）
   - 讀取 Phase 0 建立的 TypeScript 型別檔，確認型別定義正確且完整
   - 若發現遺漏或錯誤，直接修正 `app/types/api/*.ts`
   - ⚠️ **型別檔必須在 `app/types/api/`**，Nuxt 4 的 `~` 別名解析到 `app/`
2. **從 .feature Background 提取 mock 資料**
3. **建立 mock data 檔案**（mock 資料結構必須符合 `types/api/` 定義）
4. **確保 Mock 資料最低數量**

   | 資料類型 | 最低數量 | 原因 |
   |----------|----------|------|
   | 列表頁面主要資料 | ≥ 11 筆 | 分頁每頁 10 筆，需 > 1 頁才能測試分頁 |
   | 關聯資料（子項目） | ≥ 3 筆/父項 | 確保列表不會因資料太少而隱藏 UI |
   | 下拉選單選項 | ≥ 3 項 | 確保選單可滾動、可篩選 |

   > ⚠️ 不足時在步驟 3 補建，不要等到 Phase 6 才發現分頁無法測試

5. **建立 API 端點**（回傳格式必須嚴格符合 `types/api/` 合約）
6. **詢問用戶確認**

## 輸出結構

```
app/
└── types/
    └── api/
        ├── index.ts           # 統一 re-export + 共用型別
        ├── auth.ts            # LoginData, LoginRequest
        ├── teams.ts           # TeamItem, CreateTeamBody
        └── players.ts         # PlayerItem, CreatePlayerBody

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

## API 合約型別範例

```typescript
// app/types/api/teams.ts
export interface TeamItem {
  id: number
  name: string
  player_count: number
  created_by: string
  created_at: string
  status: 'active' | 'deleted'
}

export interface CreateTeamBody {
  name: string
  created_by: string
}
```

```typescript
// app/types/api/index.ts — 統一 re-export + 共用回傳型別
export type { TeamItem, CreateTeamBody } from './teams'
export type { LoginData, LoginRequest } from './auth'

export interface ApiResponse<T> {
  status: 'success'
  data: T
}
```

> ⚠️ **命名慣例**：欄位 `snake_case`、型別 `PascalCase`、日期用 `string`

## Mock 資料範例

```typescript
// server/mock/data/users.ts
export const mockUsers = [
  { account: 'admin', password: 'pass123', role: '管理者', status: 'active' },
  { account: 'coach1', password: 'pass123', role: '教練', status: 'active' },
]
```

## API 端點範例

```typescript
// server/api/auth/login.post.ts
import type { H3Event } from 'h3'

import { mockUsers } from '../../mock/data/users'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const user = mockUsers.find(u => u.account === body.account)

  if (!user || user.password !== body.password) {
    throw createError({ statusCode: 401, message: '帳號或密碼錯誤' })
  }

  return {
    status: 'success',
    data: {
      accessToken: `mock-token-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
      user: { id: user.id, account: user.account, role: user.role }
    }
  }
})
```

> ⚠️ **Server 端 import 必須用相對路徑**，不能用 `~/`
>
> ⚠️ **event 必須標註 H3Event**、**陣列索引存取須處理 undefined** → 詳見 [rules.md](../rules.md) > Server API 類型規範

### 列表端點範例（CRUD 標準模式）

> ⚠️ **直接回傳 mock data，禁止 `.map()` 挑選欄位** → 詳見 [rules.md](../rules.md) > Mock API 回傳慣例

```typescript
// server/api/teams/index.get.ts
import type { H3Event } from 'h3'

import { mockTeams } from '../../mock/data/teams'

export default defineEventHandler((event: H3Event) => {
  const query = getQuery(event) as { page?: string, page_size?: string }
  const page = Number(query.page) || 1
  const pageSize = Number(query.page_size) || 10

  const items = mockTeams.filter(t => t.status === 'active')
  items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const start = (page - 1) * pageSize
  const paged = items.slice(start, start + pageSize)

  // ✅ 直接回傳 paged，不做 .map() 轉換
  return {
    status: 'success' as const,
    data: paged,
    meta: { total: items.length, page, page_size: pageSize },
  }
})
```

> 登入等特殊端點（需組裝 token）例外，但 CRUD 列表/詳情/建立/更新端點一律直接回傳 mock data。

## Auth Store 範例

```typescript
// app/stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ id: number; account: string; role: string } | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  function setAuth(data: {
    accessToken: string
    refreshToken: string
    user: { id: number; account: string; role: string }
  }) {
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken
    user.value = data.user
  }

  async function login(account: string, password: string) {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { account, password },
    })
    setAuth(response.data)
  }

  function clearAuth() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
  }

  return { user, accessToken, isAuthenticated, setAuth, login, clearAuth }
}, {
  persist: {
    pick: ['user', 'accessToken', 'refreshToken'],
  },
})
```
