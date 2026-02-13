# 藍燈階段規則（Phase: blue）🔵

## 目標

在測試保護下重構 Step Definitions 和業務邏輯，改善品質但**不改變外部行為**。

---

## 核心原則

### 1. 測試保護原則

每次重構後立即執行測試，確保全部通過。若失敗則立即回滾。

### 2. 小步前進原則

一次只做一個小重構，避免一次改動過多。

### 3. 不強行重構原則

只在真正有改善空間時才重構。程式碼已清晰簡潔時保持原樣，遵循 YAGNI 原則。

### 4. 設計原則遵守

重構時必須遵守 SOLID 設計原則，達到好讀、好維護、好擴充。

---

## 重構流程

```
改動 → 執行測試 → 綠燈? → 繼續下一個改動
                    ↓
                   紅燈? → 還原改動，重新思考
```

---

## Step Definition 重構

### 1. TODO 註記清理

**刪除的內容**：
- `/* TODO: [事件風暴部位: ...] */`
- `// TODO: ...`

**保留的內容**：
- 必要的技術註解
- 複雜邏輯的說明

**重構前**：

```typescript
Given('系統中有以下使用者：', async (world: TestWorld, dataTable: DataTable) => {
  /*
   * TODO: [事件風暴部位: Aggregate - User]
   * TODO: 建立 repository、eventBus、service
   * TODO: 將 dataTable 資料存入 repository
   */
  const users = dataTable.hashes()
  world.userRepository = createUserRepository()
  world.eventBus = createEventBus()
  // ...
})
```

**重構後**：

```typescript
Given('系統中有以下使用者：', async (world: TestWorld, dataTable: DataTable) => {
  const users = dataTable.hashes()

  world.userRepository = createUserRepository()
  world.eventBus = createEventBus()
  world.authService = createAuthService({
    userRepository: world.userRepository,
    eventBus: world.eventBus,
    timeProvider: world.timeProvider,
  })

  users.forEach((row) => {
    world.userRepository.save({
      account: row.account,
      password: row.password,
      role: row.role,
      status: row.status,
      failedAttempts: Number.parseInt(row.failed_attempts) || 0,
      lockedUntil: row.locked_until ? new Date(row.locked_until) : null,
    })
  })
})
```

### 2. 提取共用 Setup 到 Fixture

**重構前**：

```typescript
describe('Feature: 建立球隊', () => {
  it('Example: 成功建立球隊', () => {
    const teamRepository = createTeamRepository()
    const teamService = createTeamService({ teamRepository })
    authStore.setAuth({ account: 'coach1' })
    // ...
  })

  it('Example: 球隊名稱不可為空', () => {
    const teamRepository = createTeamRepository()
    const teamService = createTeamService({ teamRepository })
    authStore.setAuth({ account: 'coach1' })
    // ...
  })
})
```

**重構後**：

```typescript
describe('Feature: 建立球隊', () => {
  let teamRepository: ReturnType<typeof createTeamRepository>
  let teamService: ReturnType<typeof createTeamService>

  beforeAll(() => {
    teamRepository = createTeamRepository()
    teamService = createTeamService({ teamRepository })
    authStore.setAuth({ account: 'coach1' })
  })

  beforeEach(() => {
    teamRepository.clear()
  })

  it('Example: 成功建立球隊', () => {
    // 測試邏輯...
  })

  it('Example: 球隊名稱不可為空', () => {
    // 測試邏輯...
  })
})
```

### 3. 測試 Warnings 清理

執行測試時清除所有 warnings，保持輸出乾淨。

```bash
# 檢查 warnings
npm run test:unit -- --run

# 常見 warnings 處理
# - DeprecationWarning: 更新到新 API
# - 未關閉的資源: 使用 afterEach/afterAll 清理
```

---

## 實作程式碼重構

### 1. SOLID 設計原則

#### S - 單一職責原則 (SRP)

每個類別/函式只負責一件事。

```typescript
// ❌ Service 做太多事
function createTeam(data: CreateTeamInput) {
  // 驗證
  if (!data.name) throw new Error('名稱不可為空')
  if (data.name.length > 50) throw new Error('名稱過長')
  // 檢查重複
  const existing = teamRepository.findByName(data.name)
  if (existing) throw new Error('名稱已存在')
  // 儲存
  return teamRepository.save(data)
  // 發送通知
  sendNotification(data)
}

// ✅ 職責分離
function createTeam(data: CreateTeamInput) {
  validateTeamName(data.name)
  checkDuplicateName(data.name)
  return teamRepository.save(data)
}

function validateTeamName(name: string) {
  if (!name) throw new ValidationError('名稱不可為空')
  if (name.length > 50) throw new ValidationError('名稱過長')
}

function checkDuplicateName(name: string) {
  const existing = teamRepository.findByName(name)
  if (existing) throw new DuplicateError('名稱已存在')
}
```

#### D - 依賴反轉原則 (DIP)

高層模組不應依賴低層模組，兩者都應依賴抽象。

```typescript
// ✅ Service 透過建構子注入 Repository
export function createTeamService({ teamRepository }: TeamServiceDeps) {
  return {
    createTeam(data) {
      return teamRepository.save(data)
    }
  }
}
```

### 2. 消除重複邏輯

```typescript
// ❌ 重複的驗證邏輯
function createTeam(data) {
  const auth = authStore.getAuth()
  if (!auth) throw new PermissionDeniedError()
  // ...
}

function updateTeam(data) {
  const auth = authStore.getAuth()
  if (!auth) throw new PermissionDeniedError()
  // ...
}

// ✅ 提取共用方法
function requireAuth() {
  const auth = authStore.getAuth()
  if (!auth) throw new PermissionDeniedError()
  return auth
}

function createTeam(data) {
  const auth = requireAuth()
  // ...
}

function updateTeam(data) {
  const auth = requireAuth()
  // ...
}
```

### 3. 改善命名

```typescript
// ❌ 不清晰的命名
const d = getData()
const r = process(d)
const t = teams.find(x => x.n === n)

// ✅ 清晰的命名
const teamData = getTeamData()
const result = processTeamCreation(teamData)
const team = teams.find(team => team.name === name)
```

### 4. 加入型別定義

```typescript
// ❌ 缺少型別
function createTeam(data) {
  return { success: true, data: { ...data, id: nextId++ } }
}

// ✅ 完整型別定義
interface CreateTeamInput {
  name: string
  createdBy: string
}

interface CreateTeamResult {
  success: boolean
  data?: Team
  error?: string
}

function createTeam(input: CreateTeamInput): CreateTeamResult {
  return { success: true, data: { ...input, id: nextId++ } }
}
```

### 5. 提取常數

```typescript
// ❌ Magic numbers
if (name.length > 50) throw new Error('名稱過長')
if (height < 100 || height > 250) throw new Error('身高無效')

// ✅ 提取常數
const TEAM_NAME_MAX_LENGTH = 50
const PLAYER_HEIGHT_MIN = 100
const PLAYER_HEIGHT_MAX = 250

if (name.length > TEAM_NAME_MAX_LENGTH) throw new Error('名稱過長')
if (height < PLAYER_HEIGHT_MIN || height > PLAYER_HEIGHT_MAX) throw new Error('身高無效')
```

### 6. 適當的錯誤處理

```typescript
// ❌ 通用錯誤
function createTeam(data) {
  if (!data.name) throw new Error('錯誤')
}

// ✅ 具體的錯誤類型
class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

function createTeam(data) {
  if (!data.name) throw new ValidationError('球隊名稱不可為空')
}
```

---

## 不要做的事

### ❌ 過度抽象

```typescript
// 不需要為了「彈性」而建立複雜的工廠模式
const strategy = TeamCreationStrategyFactory.create(context)
const result = strategy.execute(new TeamCreationCommand(data))

// 簡單直接就好
const result = teamService.createTeam(data)
```

### ❌ 提前優化

```typescript
// 不需要在沒有效能問題時就做快取
const cache = new Map()
function getTeam(id) {
  if (cache.has(id)) return cache.get(id)
  const team = repository.findById(id)
  cache.set(id, team)
  return team
}
```

### ❌ 加入未測試的功能

```typescript
// 測試沒要求分頁，就不要加
function getTeams(page = 1, limit = 10) { ... }
```

---

## 驗證

```bash
# 持續執行測試，確保不變紅
npm run test -- --project bdd

# 每次改動後都應該是
# ✓ PASS docs/gherkin-spec/features/{feature}.feature
```

---

## 檢查清單

### Step Definitions

- [ ] 所有 TODO 註記已刪除
- [ ] 共用邏輯已提取到 helpers/
- [ ] 所有測試 warnings 已清除

### 實作程式碼

- [ ] 符合 SOLID 設計原則
- [ ] Service 透過建構子注入 Repository
- [ ] Repository 不包含業務邏輯
- [ ] 消除重複邏輯（提取共用方法）
- [ ] 命名清晰易懂
- [ ] 型別定義完整
- [ ] 常數已提取

### 測試驗證

- [ ] 所有測試通過 🟢
- [ ] 沒有過度抽象
- [ ] 沒有提前優化

---

## 完成標準

重構完成後，程式碼應該具備：

| 品質指標 | 說明 |
|---------|------|
| 可讀性 | 其他人能快速理解 |
| 可維護性 | 修改時不容易出錯 |
| 可測試性 | 容易加入新測試 |
| 一致性 | 風格統一 |

---

## 重構原則總結

✅ **應該做**：
- 清理 Meta 註記
- 保留業務邏輯註解
- 提取共用 Setup 到 fixture
- 遵守 SOLID 設計原則
- 嚴格遵守依賴注入
- 清除所有測試 warnings

❌ **不應該做**：
- 改變測試結構
- 強行簡化可讀性
- Service 內部直接建立 Repository
- 過度抽象
- 忽略測試 warnings
