# 單元測試紅燈階段規則（Phase: unit red）🔴

## 目標

根據掃描結果（`.scan.md`）生成測試檔案樣板，所有測試必須**失敗**。

---

## 核心原則

### ✅ 要做的事

1. **檢查現有測試檔案**：避免覆蓋已存在的測試
2. **根據 scan.md 生成 describe/it 結構**：對照案例表
3. **使用 `throw new Error('紅燈：尚未實作')` 作為佔位符**
4. **設定正確的 Mock 框架**：根據分類選擇 mock 策略
5. **設定 beforeEach 重置邏輯**：確保測試隔離

### ❌ 不要做的事

1. **不要實作測試邏輯**：it 內部只有 throw Error
2. **不要讓測試通過**：紅燈階段測試必須失敗
3. **不要覆蓋已存在的測試**：只生成缺少的

---

## ⚠️ 執行前檢查（防止覆蓋）

```bash
# 檢查測試檔案是否已存在
ls test/unit/server/api/auth/login.post.test.ts 2>/dev/null
ls test/nuxt/stores/auth.test.ts 2>/dev/null
```

若檔案已存在：
1. 掃描已有的 `it(...)` 描述
2. 對比 scan.md 中的案例
3. **只追加缺少的 it block**，不覆蓋已有的

---

## 測試檔案路徑鏡像規則

| 原始檔案 | 測試檔案 |
|---------|---------|
| `server/api/auth/login.post.ts` | `test/unit/server/api/auth/login.post.test.ts` |
| `server/api/trainings/index.get.ts` | `test/unit/server/api/trainings/index.get.test.ts` |
| `server/api/trainings/[id]/analysis.get.ts` | `test/unit/server/api/trainings/[id]/analysis.get.test.ts` |
| `app/stores/auth.ts` | `test/nuxt/stores/auth.test.ts` |
| `app/middleware/auth.global.ts` | `test/nuxt/middleware/auth.global.test.ts` |
| `app/pages/teams/index.vue` | `test/nuxt/pages/teams/index.test.ts` |
| `app/pages/trainings/[id]/index.vue` | `test/nuxt/pages/trainings/[id]/index.test.ts` |
| `app/components/common/ConfirmModal.vue` | `test/nuxt/components/common/ConfirmModal.test.ts` |

---

## ESLint 合規（必須遵守）

1. **import 字母序**：`import { beforeEach, describe, expect, it, vi } from 'vitest'`
2. **describe 描述**：HTTP method 用大寫 `POST`、`GET` 開頭是可以的
   - ✅ `describe('POST /api/auth/login', ...)`
   - ❌ `describe('Login handler', ...)` ← 大寫字母開頭會被 ESLint 警告
3. **handler import 必須用 top-level await**：
   - ✅ `const handler = (await import('~/server/api/...')).default`
   - ❌ `import handler from '~/server/api/...'`（會在 vi.mock 之前執行）
4. **mock 資料 import 用具體子模組**：
   - ✅ `import { mockUsers } from '~/server/mock/data/users'`
   - ❌ `import { mockUsers } from '~/server/mock/data'`（除非 barrel export 存在）

---

## Mock 樣板（按分類）

### 分類 A：API Handler（unit 專案）

> **重要**：Server API 檔案使用 Nitro auto-import（全域變數），不是 `import { readBody } from 'h3'`。
> `setup.ts` 已透過 `globalThis` 注入 `defineEventHandler` / `readBody` / `getQuery` 等函式。
> **禁止使用 `vi.mock('h3')`**——它只 mock h3 模組匯出，不影響 globalThis 上的函式。

#### POST Handler

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockUsers } from '~/server/mock/data/users'

// handler 使用 top-level await 動態 import
// setup.ts 已透過 globalThis 注入 defineEventHandler / readBody / getQuery 等 h3 函式
const handler = (await import('~/server/api/auth/login.post')).default

describe('POST /api/auth/login', () => {
  const mockEvent = {} as any

  beforeEach(() => {
    vi.mocked(readBody).mockReset()
    // 重置 mock 資料（如果需要）
  })

  it('缺少 account 應回傳 400', async () => {
    throw new Error('紅燈：尚未實作')
  })

  it('登入成功應回傳 token', async () => {
    throw new Error('紅燈：尚未實作')
  })
})
```

#### API Handler Mock 說明

| 全域函式 | 來源 | 用法 |
|----------|------|------|
| `defineEventHandler` | `setup.ts` globalThis | 直接回傳 handler function（passthrough） |
| `readBody` | `setup.ts` globalThis | `vi.mocked(readBody).mockResolvedValue(...)` |
| `getQuery` | `setup.ts` globalThis | `vi.mocked(getQuery).mockReturnValue(...)` |
| `getRouterParam` | `setup.ts` globalThis | `vi.mocked(getRouterParam).mockReturnValue(...)` |
| `createError` | `setup.ts` globalThis | 保留原始實作，建立帶 statusCode 的 Error |

#### GET Handler

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest'

// setup.ts 已透過 globalThis 注入 h3 函式
const handler = (await import('~/server/api/trainings/index.get')).default

describe('GET /api/trainings', () => {
  const mockEvent = {} as any

  beforeEach(() => {
    vi.mocked(getQuery).mockReset()
  })

  it('應只回傳 active 且今天及未來的訓練', async () => {
    throw new Error('紅燈：尚未實作')
  })
})
```

#### 需要重置 Mock 資料的 Handler

當 handler 直接操作 `mockUsers`、`mockTeams` 等資料時：

```typescript
import { mockUsers } from '~/server/mock/data/users'

describe('POST /api/auth/login', () => {
  const mockEvent = {} as any

  beforeEach(() => {
    vi.mocked(readBody).mockReset()
    // 重置被測試修改的資料
    const coach1 = mockUsers.find(u => u.account === 'coach1')
    if (coach1) {
      coach1.failed_attempts = 0
      coach1.locked_until = null
    }
  })
})
```

---

### 分類 B：Store（nuxt 專案）

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Mock $fetch
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

import { useAuthStore } from '~/stores/auth'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('computed', () => {
    it('有 token 和 user 時 isAuthenticated 應為 true', () => {
      throw new Error('紅燈：尚未實作')
    })

    it('role 為管理者時 isAdmin 應為 true', () => {
      throw new Error('紅燈：尚未實作')
    })
  })

  describe('login', () => {
    it('成功應設定 token 和 user', async () => {
      throw new Error('紅燈：尚未實作')
    })
  })

  describe('logout', () => {
    it('API 失敗仍應清除 state', async () => {
      throw new Error('紅燈：尚未實作')
    })
  })
})
```

#### Store Mock 說明

| Mock 目標 | 為什麼需要 | 注意事項 |
|----------|----------|---------|
| `$fetch` | Store 內部使用 `$fetch` 呼叫 API | `vi.stubGlobal` |
| `createPinia` | 每個測試需要乾淨的 Pinia 實例 | `beforeEach` 中重建 |

---

### 分類 C：Middleware（nuxt 專案）

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock store
vi.mock('~/stores/auth', () => ({
  useAuthStore: vi.fn(),
}))

// Mock Nuxt 路由 API
const mockNavigateTo = vi.fn()
vi.mock('#imports', () => ({
  defineNuxtRouteMiddleware: (fn: Function) => fn,
  navigateTo: (...args: any[]) => mockNavigateTo(...args),
  useAuthStore: vi.fn(),
}))

import { useAuthStore } from '~/stores/auth'

// 直接 import middleware（defineNuxtRouteMiddleware 已 mock 為 passthrough）
import middleware from '~/middleware/auth.global'

describe('auth.global middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('未登入訪問非 login 頁應導向 /login', () => {
    throw new Error('紅燈：尚未實作')
  })

  it('已登入訪問 /login 應導向 /', () => {
    throw new Error('紅燈：尚未實作')
  })

  it('已登入訪問其他頁應放行', () => {
    throw new Error('紅燈：尚未實作')
  })

  it('未登入訪問 /login 應放行', () => {
    throw new Error('紅燈：尚未實作')
  })
})
```

#### Middleware Mock 說明

| Mock 目標 | 為什麼需要 | 注意事項 |
|----------|----------|---------|
| `useAuthStore` | 控制 `isAuthenticated` 回傳值 | 每個 it 設定不同值 |
| `navigateTo` | 驗證導向目標 | 用 `toHaveBeenCalledWith` 檢查 |
| `defineNuxtRouteMiddleware` | 取得原始 middleware function | passthrough |

---

### 分類 D：Page（nuxt 專案）

```typescript
import { describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

// Mock store
vi.mock('~/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: true,
    isAdmin: false,
    user: { account: 'coach1', role: '教練' },
  })),
}))

import TeamsPage from '~/pages/teams/index.vue'

describe('TeamsPage', () => {
  describe('搜尋過濾', () => {
    it('應根據球隊名稱過濾', async () => {
      throw new Error('紅燈：尚未實作')
    })

    it('搜尋時應重置頁數為 1', async () => {
      throw new Error('紅燈：尚未實作')
    })
  })

  describe('CRUD 操作', () => {
    it('新增成功應顯示 success toast', async () => {
      throw new Error('紅燈：尚未實作')
    })

    it('API 錯誤應顯示 error toast', async () => {
      throw new Error('紅燈：尚未實作')
    })
  })

  describe('條件渲染', () => {
    it('無資料時應顯示 EmptyState', async () => {
      throw new Error('紅燈：尚未實作')
    })
  })
})
```

#### Page Mock 說明

| Mock 目標 | 為什麼需要 | 注意事項 |
|----------|----------|---------|
| `useAuthStore` | 控制權限/角色 | 回傳 reactive 物件 |
| `useFetch` | 控制列表資料 | mock 回傳 `{ data, refresh }` |
| `$fetch` | 控制 CRUD 回應 | `vi.stubGlobal` |
| `useToast` | 驗證 toast 呼叫 | mock `add` 方法 |
| `useRouter` | 驗證導向 | mock `push` 方法 |

---

### 分類 E：Component（nuxt 專案）

```typescript
import { describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import ConfirmModal from '~/components/common/ConfirmModal.vue'

describe('ConfirmModal', () => {
  const defaultProps = {
    title: '確認刪除',
    description: '確定要刪除這個項目嗎？',
  }

  it('點擊確認應 emit confirm 事件', async () => {
    throw new Error('紅燈：尚未實作')
  })

  it('點擊取消應 emit cancel 事件並關閉 modal', async () => {
    throw new Error('紅燈：尚未實作')
  })

  it('loading 時取消按鈕應被禁用', async () => {
    throw new Error('紅燈：尚未實作')
  })
})
```

---

## 樣板格式規範

1. **describe** 使用中文描述功能，可巢狀分組
2. **it** 使用中文描述預期行為（「應...」開頭）
3. **每個 it 都 throw Error**：`throw new Error('紅燈：尚未實作')`
4. **Mock 框架已就位**：import、vi.mock、vi.stubGlobal
5. **beforeEach 重置**：`vi.clearAllMocks()` + 分類特定重置
6. **不加 TODO 註解**：與 BDD 不同，單元測試不需要事件風暴標記

---

## Lint Gate（必須通過）

生成測試檔案後，**必須執行 lint 修復並確認零錯誤**：

```bash
npm run lint --fix
npm run lint    # 確認 0 errors
```

常見需手動修的問題：
- `vars-on-top`：`env.d.ts` 中 `var` 宣告需加 `// eslint-disable-next-line vars-on-top`
- `unused-imports/no-unused-vars`：未使用參數加 `_` 前綴
- `unused-imports/no-unused-imports`：移除未使用的 import

> **重要**：不通過 lint 的程式碼會導致 pre-commit hook 失敗，無法 commit。

---

## 驗證紅燈

```bash
# API Handler
npm run test:run -- --project unit "test/unit/server/api/auth/login.post.test.ts"

# Store / Middleware / Page / Component
npm run test:run -- --project nuxt "test/nuxt/stores/auth.test.ts"

# 預期：所有測試失敗，錯誤訊息為「紅燈：尚未實作」
```

**這就是紅燈**：
- ✅ 測試結構完整（describe/it 對應 scan.md 案例）
- ✅ Mock 框架已設定
- ✅ 測試隔離（beforeEach 重置）
- ✅ 所有測試失敗（throw Error）

---

## 檢查清單

- [ ] 已檢查測試檔案是否已存在（防覆蓋）
- [ ] 測試檔案路徑正確（鏡像規則）
- [ ] Mock 框架正確設定（根據分類）
- [ ] 所有 scan.md 中的案例都有 `it` block
- [ ] 每個 `it` 都 `throw new Error('紅燈：尚未實作')`
- [ ] `beforeEach` 中重置 mock 和資料
- [ ] `npm run lint` 零錯誤
- [ ] 執行測試確認**失敗**（紅燈）🔴
