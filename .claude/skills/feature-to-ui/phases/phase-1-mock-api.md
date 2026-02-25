# Phase 1: Mock API

## 必讀規範

```
僅需讀取：
- Phase 0 的功能清單和資料模型
- ui-config.yaml > testAccounts（測試帳號）
- rules.md > Server API 類型規範（H3Event、noUncheckedIndexedAccess）
```

## 執行步驟

1. **建立 API 合約型別**（`app/types/api/*.ts`）
   - 從 Phase 0 的 API 合約規格產生 TypeScript 型別檔
   - 每個資源一個檔案（如 `app/types/api/teams.ts`、`app/types/api/auth.ts`）
   - 包含 Request body、Response data 的完整型別
   - 建立 `app/types/api/index.ts` 統一 re-export
   - ⚠️ **必須建在 `app/types/api/`**，因為 Nuxt 4 的 `~` 別名解析到 `app/`，若建在根目錄的 `types/api/` 會導致 `~/types/api/` import 解析失敗
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
