# 單元測試綠燈階段規則（Phase: unit green）🟢

## 目標

實作**最少量**的測試程式碼，讓所有測試從紅燈變綠燈。

---

## 核心原則

### 1. Trial-and-Error 流程

```
1. 執行測試 → 看哪個失敗
2. 實作一個 it
3. 執行測試 → 還有失敗？
4. 重複 2-3，直到全部通過
```

**不要一次實作所有測試**，讓測試結果驅動。

### 2. AAA 模式

每個 `it` 遵循 Arrange-Act-Assert：

```typescript
it('描述', async () => {
  // Arrange - 設定 mock 和測試資料
  vi.mocked(readBody).mockResolvedValue({ account: 'coach1', password: 'pass123' })

  // Act - 執行被測函式
  const result = await handler(mockEvent)

  // Assert - 驗證結果
  expect(result.access_token).toBeDefined()
})
```

### 3. 允許的做法

- ✅ 只斷言核心行為（不過度驗證）
- ✅ 使用 `toMatchObject` 做部分比對
- ✅ 使用 `expect.any(String)` 略過動態值
- ✅ 直接操作 mock 資料建立前置條件

### 4. 不允許的做法

- ❌ 加入 scan.md 中沒列出的案例
- ❌ 測試框架/第三方庫的行為
- ❌ 過度斷言（一個 it 驗證太多事）

---

## 各分類實作範例

### 分類 A：API Handler

#### 測試成功回傳

```typescript
it('登入成功應回傳 token 和使用者', async () => {
  vi.mocked(readBody).mockResolvedValue({
    account: 'coach1',
    password: 'pass123',
  })

  const result = await handler(mockEvent)

  expect(result).toMatchObject({
    access_token: expect.any(String),
    refresh_token: expect.any(String),
    user: expect.objectContaining({ account: 'coach1' }),
  })
})
```

#### 測試錯誤回傳（createError）

```typescript
it('缺少 account 應回傳 400', async () => {
  vi.mocked(readBody).mockResolvedValue({ password: 'pass123' })

  await expect(handler(mockEvent)).rejects.toMatchObject({
    statusCode: 400,
  })
})

it('帳號不存在應回傳 401', async () => {
  vi.mocked(readBody).mockResolvedValue({
    account: 'nonexistent',
    password: 'pass123',
  })

  await expect(handler(mockEvent)).rejects.toMatchObject({
    statusCode: 401,
  })
})
```

#### 測試資料副作用

```typescript
it('密碼錯誤應累加 failed_attempts', async () => {
  const testUser = mockUsers.find(u => u.account === 'coach1')!
  testUser.failed_attempts = 0

  vi.mocked(readBody).mockResolvedValue({
    account: 'coach1',
    password: 'wrong',
  })

  await expect(handler(mockEvent)).rejects.toBeDefined()
  expect(testUser.failed_attempts).toBe(1)
})

it('登入成功應重置 failed_attempts', async () => {
  const testUser = mockUsers.find(u => u.account === 'coach1')!
  testUser.failed_attempts = 3

  vi.mocked(readBody).mockResolvedValue({
    account: 'coach1',
    password: 'pass123',
  })

  await handler(mockEvent)
  expect(testUser.failed_attempts).toBe(0)
})
```

#### 測試篩選邏輯（GET Handler）

```typescript
it('應只回傳 active 狀態的訓練', async () => {
  vi.mocked(getQuery).mockReturnValue({})

  const result = await handler(mockEvent)

  result.data.forEach((t: any) => {
    expect(t.status).toBe('active')
  })
})

it('應根據 team_id 篩選', async () => {
  vi.mocked(getQuery).mockReturnValue({ team_id: '1' })

  const result = await handler(mockEvent)

  result.data.forEach((t: any) => {
    expect(t.team_id).toBe(1)
  })
})
```

#### 測試日期篩選（GET Handler）

```typescript
it('應只回傳今天及未來的訓練', async () => {
  vi.mocked(getQuery).mockReturnValue({})
  const today = new Date().toISOString().split('T')[0]

  const result = await handler(mockEvent)

  result.data.forEach((t: any) => {
    expect(t.date >= today).toBe(true)
  })
})
```

#### 測試動態路由（[id] Handler）

```typescript
it('訓練不存在應回傳 404', async () => {
  vi.mocked(getRouterParam).mockReturnValue('9999')

  await expect(handler(mockEvent)).rejects.toMatchObject({
    statusCode: 404,
  })
})

it('應回傳指定 ID 的訓練詳情', async () => {
  vi.mocked(getRouterParam).mockReturnValue('1')

  const result = await handler(mockEvent)

  expect(result.data.id).toBe(1)
})
```

#### 測試狀態機（AI Handler）

```typescript
it('已 running 時啟動應回傳 409', async () => {
  // Arrange：將訓練的 ai_status 設為 running
  const training = mockTrainings.find(t => t.id === 1)!
  training.ai_status = 'running'

  vi.mocked(readBody).mockResolvedValue({ training_id: 1 })

  // Act & Assert
  await expect(handler(mockEvent)).rejects.toMatchObject({
    statusCode: 409,
  })
})
```

#### 測試批次操作

```typescript
it('批次刪除應回傳刪除數量', async () => {
  vi.mocked(readBody).mockResolvedValue({ ids: [1, 2, 3] })

  const result = await handler(mockEvent)

  expect(result.message).toContain('3')
})

it('空陣列應回傳 400', async () => {
  vi.mocked(readBody).mockResolvedValue({ ids: [] })

  await expect(handler(mockEvent)).rejects.toMatchObject({
    statusCode: 400,
  })
})
```

---

### 分類 B：Store

```typescript
describe('computed', () => {
  it('有 token 和 user 時 isAuthenticated 應為 true', () => {
    const store = useAuthStore()
    store.setAuth({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: { account: 'coach1', role: '教練' },
    })

    expect(store.isAuthenticated).toBe(true)
  })

  it('缺少 token 時 isAuthenticated 應為 false', () => {
    const store = useAuthStore()

    expect(store.isAuthenticated).toBe(false)
  })

  it('role 為管理者時 isAdmin 應為 true', () => {
    const store = useAuthStore()
    store.setAuth({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: { account: 'admin', role: '管理者' },
    })

    expect(store.isAdmin).toBe(true)
  })
})

describe('login', () => {
  it('成功應設定 token 和 user', async () => {
    const mockResponse = {
      access_token: 'token123',
      refresh_token: 'refresh123',
      user: { account: 'coach1', role: '教練' },
    }
    vi.mocked($fetch).mockResolvedValue(mockResponse)

    const store = useAuthStore()
    await store.login('coach1', 'pass123')

    expect(store.accessToken).toBe('token123')
    expect(store.user?.account).toBe('coach1')
    expect(store.isAuthenticated).toBe(true)
  })

  it('失敗應不改變 state 並拋出錯誤', async () => {
    vi.mocked($fetch).mockRejectedValue(new Error('401'))

    const store = useAuthStore()

    await expect(store.login('wrong', 'wrong')).rejects.toThrow()
    expect(store.isAuthenticated).toBe(false)
  })
})

describe('logout', () => {
  it('API 失敗仍應清除 state', async () => {
    const store = useAuthStore()
    store.setAuth({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: { account: 'coach1', role: '教練' },
    })
    vi.mocked($fetch).mockRejectedValue(new Error('network'))

    await store.logout()

    expect(store.accessToken).toBeNull()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })
})

describe('refresh', () => {
  it('失敗應清除認證並回傳 false', async () => {
    const store = useAuthStore()
    store.setAuth({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: { account: 'coach1', role: '教練' },
    })
    vi.mocked($fetch).mockRejectedValue(new Error('expired'))

    const result = await store.refresh()

    expect(result).toBe(false)
    expect(store.isAuthenticated).toBe(false)
  })
})
```

---

### 分類 C：Middleware

```typescript
it('未登入訪問 /teams 應導向 /login', () => {
  vi.mocked(useAuthStore).mockReturnValue({
    isAuthenticated: false,
  } as any)

  const to = { path: '/teams' } as any
  const from = { path: '/' } as any

  const result = middleware(to, from)

  expect(mockNavigateTo).toHaveBeenCalledWith('/login')
})

it('已登入訪問 /login 應導向 /', () => {
  vi.mocked(useAuthStore).mockReturnValue({
    isAuthenticated: true,
  } as any)

  const to = { path: '/login' } as any
  const from = { path: '/' } as any

  const result = middleware(to, from)

  expect(mockNavigateTo).toHaveBeenCalledWith('/')
})

it('已登入訪問其他頁應放行', () => {
  vi.mocked(useAuthStore).mockReturnValue({
    isAuthenticated: true,
  } as any)

  const to = { path: '/teams' } as any
  const from = { path: '/' } as any

  const result = middleware(to, from)

  expect(mockNavigateTo).not.toHaveBeenCalled()
})

it('未登入訪問 /login 應放行', () => {
  vi.mocked(useAuthStore).mockReturnValue({
    isAuthenticated: false,
  } as any)

  const to = { path: '/login' } as any
  const from = { path: '/' } as any

  const result = middleware(to, from)

  expect(mockNavigateTo).not.toHaveBeenCalled()
})
```

---

### 分類 D：Page

Page 測試根據邏輯類別使用不同策略：

#### 搜尋過濾 + 分頁

```typescript
it('應根據球隊名稱過濾', async () => {
  const wrapper = await mountSuspended(TeamsPage)

  // 取得 vm 存取 internal state
  const vm = wrapper.vm as any

  // 模擬資料已載入（透過 useFetch mock）
  // 設定 searchQuery
  vm.searchQuery = '紅龍'
  await wrapper.vm.$nextTick()

  // 驗證 filteredItems 只包含匹配項
  expect(vm.filteredItems.every((t: any) =>
    t.name.includes('紅龍') || t.created_by.includes('紅龍')
  )).toBe(true)
})

it('搜尋時應重置頁數為 1', async () => {
  const wrapper = await mountSuspended(TeamsPage)
  const vm = wrapper.vm as any

  vm.currentPage = 3
  vm.searchQuery = '新搜尋'
  await wrapper.vm.$nextTick()

  expect(vm.currentPage).toBe(1)
})
```

#### CRUD 操作

```typescript
it('新增成功應呼叫 $fetch POST', async () => {
  const mockFetchFn = vi.fn().mockResolvedValue({ data: { id: 1, name: '新球隊' } })
  vi.stubGlobal('$fetch', mockFetchFn)

  const wrapper = await mountSuspended(TeamsPage)
  const vm = wrapper.vm as any

  // 觸發新增
  vm.formData = { name: '新球隊' }
  await vm.onFormSubmit({ data: { name: '新球隊' } })

  expect(mockFetchFn).toHaveBeenCalledWith('/api/teams', expect.objectContaining({
    method: 'POST',
  }))
})
```

#### 條件渲染

```typescript
it('無資料時應顯示 EmptyState', async () => {
  // Mock useFetch 回傳空資料
  const wrapper = await mountSuspended(TeamsPage)

  expect(wrapper.findComponent({ name: 'EmptyState' }).exists()).toBe(true)
})
```

#### 批次選取（history / analysis 頁）

```typescript
it('toggleSelectAll 應選取當前頁所有項目', async () => {
  const wrapper = await mountSuspended(HistoryPage)
  const vm = wrapper.vm as any

  vm.toggleSelectAll()
  await wrapper.vm.$nextTick()

  expect(vm.selectedIds.size).toBe(vm.paginatedItems.length)
})

it('isAllSelected 應在全選後為 true', async () => {
  const wrapper = await mountSuspended(HistoryPage)
  const vm = wrapper.vm as any

  vm.paginatedItems.forEach((item: any) => {
    vm.selectedIds.add(item.id)
  })
  await wrapper.vm.$nextTick()

  expect(vm.isAllSelected).toBe(true)
})
```

---

### 分類 E：Component

```typescript
it('點擊確認應 emit confirm 事件', async () => {
  const wrapper = await mountSuspended(ConfirmModal, {
    props: { title: '確認', description: '確定嗎？' },
  })

  // 找到確認按鈕並點擊
  const confirmBtn = wrapper.findAll('button').find(b => b.text().includes('確認'))
  await confirmBtn?.trigger('click')

  expect(wrapper.emitted('confirm')).toHaveLength(1)
})

it('loading 時取消按鈕應被禁用', async () => {
  const wrapper = await mountSuspended(ConfirmModal, {
    props: { title: '確認', description: '確定嗎？', loading: true },
  })

  const cancelBtn = wrapper.findAll('button').find(b => b.text().includes('取消'))
  expect(cancelBtn?.attributes('disabled')).toBeDefined()
})
```

---

## Mock 資料管理策略

### 策略 1：直接操作（適合 API Handler）

Handler 直接 import `mockUsers` 等陣列，測試也 import 同一份：

```typescript
import { mockUsers } from '~/server/mock/data/users'

beforeEach(() => {
  // 重置被修改的欄位
  mockUsers.forEach(u => {
    u.failed_attempts = 0
    u.locked_until = null
  })
})
```

**優點**：簡單直接，handler 和 test 共享資料
**適用**：handler 會修改 mock 資料的測試

### 策略 2：vi.mock 完全替換（適合需要自訂資料形狀）

```typescript
vi.mock('~/server/mock/data', () => ({
  mockTeams: [
    { id: 1, name: '紅龍', status: 'active', created_by: 'coach1' },
    { id: 2, name: '藍鯨', status: 'deleted', created_by: 'coach2' },
  ],
}))
```

**優點**：完全控制測試資料
**適用**：需要特定資料結構的測試（例如測試 deleted 狀態的篩選）

### 策略 3：每次新建實例（適合 Store）

```typescript
beforeEach(() => {
  setActivePinia(createPinia())
})
```

**每個 it 都拿到乾淨的 store 實例**，不需要手動清除。

---

## 常見斷言模式

### 回傳值比對

```typescript
// 完全比對
expect(result).toEqual({ id: 1, name: '紅龍' })

// 部分比對（推薦）
expect(result).toMatchObject({ name: '紅龍' })

// 包含動態值
expect(result).toMatchObject({
  access_token: expect.any(String),
  user: expect.objectContaining({ account: 'coach1' }),
})
```

### 錯誤斷言

```typescript
// async handler 拋出錯誤
await expect(handler(mockEvent)).rejects.toMatchObject({
  statusCode: 400,
})

// sync 函式拋出錯誤
expect(() => fn()).toThrow('錯誤訊息')

// Store action 拋出錯誤
await expect(store.login('wrong', 'wrong')).rejects.toThrow()
```

### 呼叫驗證

```typescript
// 函式被呼叫
expect(mockFn).toHaveBeenCalled()

// 特定參數
expect(mockNavigateTo).toHaveBeenCalledWith('/login')

// 呼叫次數
expect(mockFn).toHaveBeenCalledTimes(1)

// 未被呼叫（放行）
expect(mockNavigateTo).not.toHaveBeenCalled()
```

### 陣列驗證

```typescript
// 每個元素都符合條件
result.data.forEach((item: any) => {
  expect(item.status).toBe('active')
})

// 長度
expect(result.data).toHaveLength(3)

// 包含特定元素
expect(result.data).toContainEqual(expect.objectContaining({ name: '紅龍' }))
```

---

## 驗證綠燈

```bash
# 執行指定測試
npm run test:run -- --project unit "test/unit/server/api/auth/login.post.test.ts"
npm run test:run -- --project nuxt "test/nuxt/stores/auth.test.ts"

# 執行所有單元測試
npm run test:run -- --project unit
npm run test:run -- --project nuxt

# 預期：所有測試通過
```

---

## Lint Gate（必須通過）

所有測試通過後，**必須執行 lint 修復並確認零錯誤**：

```bash
npm run lint --fix
npm run lint    # 確認 0 errors
```

> **重要**：不通過 lint 的程式碼會導致 pre-commit hook 失敗，無法 commit。

---

## 檢查清單

- [ ] `npm run lint` 零錯誤
- [ ] 所有測試通過（綠燈）🟢
- [ ] 每個 `it` 都有 Arrange/Act/Assert
- [ ] Mock 在 beforeEach 中正確重置
- [ ] 無多餘的測試案例（只實作 scan.md 中列出的）
- [ ] 斷言聚焦核心行為（不過度驗證）
- [ ] 無測試間的狀態洩漏

---

## 記住

1. **Trial-and-Error** - 執行測試 → 實作 → 再執行，不斷循環
2. **AAA 模式** - Arrange / Act / Assert 結構清晰
3. **最小斷言** - 只驗證該 it 描述的行為
4. **Mock 重置** - beforeEach 確保隔離

完成綠燈後，根據以下 Decision Tree 判斷是否進入藍燈階段。

---

## 藍燈觸發判斷（Decision Tree）

綠燈通過後，依序檢查以下條件，**任一命中即觸發藍燈**：

```
GREEN 通過 ✅
↓
檢查 1: 有 TODO / FIXME 殘留？
  → 是 → 觸發 BLUE 🔵
  → 否 ↓

檢查 2: 有 3 個以上 it block 共用相同的 mock setup？
  → 是 → 觸發 BLUE 🔵（提取到 beforeEach / helper）
  → 否 ↓

檢查 3: 測試檔超過 150 行？
  → 是 → 觸發 BLUE 🔵（拆分 describe 或提取 helpers）
  → 否 ↓

檢查 4: 有重複的 magic value（同一字串/數字出現 3 次以上）？
  → 是 → 觸發 BLUE 🔵（提取為常數或 fixture）
  → 否 ↓

以上皆無 → 跳過 BLUE ⏭️
```

### 藍燈觸發條件摘要

| # | 條件 | 重構動作 |
|---|------|---------|
| 1 | TODO / FIXME 殘留 | 清除或實作 |
| 2 | ≥3 個 it 共用相同 mock setup | 提取到 `beforeEach` 或 helper |
| 3 | 測試檔超過 150 行 | 拆分 describe 或提取 helpers |
| 4 | 相同 magic value 出現 ≥3 次 | 提取為常數或 fixture |

### 藍燈規則

觸發後，遵循共用的 [blue.md](../bdd/blue.md) 規則，重點關注：

- 提取共用 mock setup 到 `beforeEach` 或 helper function
- 提取重複的測試資料到 fixture 常數
- 改善 describe/it 的分組結構
- **每次小改動後執行測試，確保持續通過**
