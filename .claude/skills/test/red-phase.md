# 紅燈階段規則（Phase: red）🔴

## 目標

根據 `.feature` 檔案生成 Step Definition 樣板，測試必須**失敗**。

---

## 核心原則

### ✅ 要做的事

1. **檢查現有 Step Definitions**：避免覆蓋已存在的步驟
2. **生成缺少的 Step Definition 樣板**：到對應的目錄
3. **定義所需介面**：在 `types/` 或對應目錄建立型別定義
4. **保持介面為空實作**：使用 `throw new Error('紅燈階段：尚未實作')`

### ❌ 不要做的事

1. **不要實作業務邏輯**：Step Definition 方法內部保持 throw Error
2. **不要讓測試通過**：測試應該因為實作空白而失敗（紅燈）
3. **不要覆蓋已存在的步驟**：只生成缺少的

---

## ⚠️ 執行前檢查（防止覆蓋）

在生成任何 Step Definition 之前，**必須先執行以下檢查**：

### 檢查流程

1. **掃描現有 Step Definitions**
   ```bash
   # 搜尋所有 Given/When/Then
   grep -r "Given\|When\|Then" test/bdd/steps/
   ```

2. **提取已存在的 Step Patterns**
   - 從現有檔案中提取所有 `Given('...')`、`When('...')`、`Then('...')` 的 Pattern

3. **解析 Feature File 需要的步驟**
   - 從目標 Feature File 提取所有 Given/When/Then/And 步驟

4. **對比找出缺少的步驟**
   - **只針對缺少的步驟生成樣板**

5. **輸出檢查結果**
   ```
   ✅ 已存在的步驟（不需生成）:
   - Given 系統中有以下使用者：
   - Then 操作成功

   📝 需要新增的步驟（將生成樣板）:
   - Given 使用者 "coach1" 尚未登入
   - When 使用者以帳號 "coach1" 密碼 "pass123" 登入
   ```

---

## Step Definition 樣板格式

```typescript
// test/bdd/steps/{目錄}/{feature}.ts

import { Given, When, Then } from 'quickpickle'
import type { DataTable } from 'quickpickle'
import { expect } from 'vitest'
import type { TestWorld } from '../../helpers/world'

// TODO: import repository and service creators
// import { createUserRepository } from '../../../../server/mock/data/userRepository'
// import { createAuthService } from '../../../../composables/useAuthService'

Given('使用者 {string} 尚未登入', async (world: TestWorld, account: string) => {
  /*
   * TODO: [事件風暴部位: Aggregate - User]
   * TODO: 設定 world.currentUser = account
   */
  throw new Error('紅燈階段：尚未實作')
})
```

### 樣板規範

1. **檔案位置**：根據 Decision Tree 放到對應目錄
2. **import**：必須匯入 quickpickle 的 Given/When/Then
3. **world 類型**：使用 `TestWorld` 類型標註
4. **TODO 註解**：標註事件風暴部位
5. **throw Error**：使用 `throw new Error('紅燈階段：尚未實作')` 作為佔位符

---

## 各目錄樣板範例

### aggregate_given/（建立初始資料）

```typescript
// test/bdd/steps/aggregate_given/user.ts

import { Given } from 'quickpickle'
import type { DataTable } from 'quickpickle'
import type { TestWorld } from '../../helpers/world'

import { createUserRepository } from '../../../../server/mock/data/userRepository'
import { createAuthService } from '../../../../composables/useAuthService'
import { createEventBus } from '../../../../composables/useEventBus'

Given('系統中有以下使用者：', async (world: TestWorld, dataTable: DataTable) => {
  /*
   * TODO: [事件風暴部位: Aggregate - User]
   * TODO: 建立 repository、eventBus、service
   * TODO: 將 dataTable 資料存入 repository
   */
  throw new Error('紅燈階段：尚未實作')
})

Given('使用者 {string} 尚未登入', async (world: TestWorld, account: string) => {
  /*
   * TODO: [事件風暴部位: Aggregate - User]
   * TODO: 設定 world.currentUser
   */
  throw new Error('紅燈階段：尚未實作')
})

Given('使用者 {string} 已連續登入失敗 {int} 次', async (world: TestWorld, account: string, times: number) => {
  /*
   * TODO: [事件風暴部位: Aggregate - User]
   * TODO: 更新 repository 中的 failedAttempts
   */
  throw new Error('紅燈階段：尚未實作')
})
```

### commands/（執行寫入操作）

```typescript
// test/bdd/steps/commands/auth.ts

import { When } from 'quickpickle'
import type { TestWorld } from '../../helpers/world'

When('使用者以帳號 {string} 密碼 {string} 登入', async (world: TestWorld, account: string, password: string) => {
  /*
   * TODO: [事件風暴部位: Command - login]
   * TODO: 使用 try-catch 執行 world.authService.login()
   * TODO: 成功時設定 world.operationResult = { success: true }
   * TODO: 失敗時設定 world.operationResult = { success: false, message: error.message }
   */
  throw new Error('紅燈階段：尚未實作')
})

When('使用者以 Refresh Token 請求新 Token', async (world: TestWorld) => {
  /*
   * TODO: [事件風暴部位: Command - refreshToken]
   * TODO: 使用 world.loginResult.refreshToken 呼叫 authService.refreshToken()
   */
  throw new Error('紅燈階段：尚未實作')
})
```

### query/（執行讀取操作）

```typescript
// test/bdd/steps/query/team.ts

import { When } from 'quickpickle'
import type { TestWorld } from '../../helpers/world'

When('教練查詢球隊列表', async (world: TestWorld) => {
  /*
   * TODO: [事件風暴部位: Query - getTeams]
   * TODO: 執行 world.teamService.getTeams()
   * TODO: 將結果存入 world.queryResult
   */
  throw new Error('紅燈階段：尚未實作')
})
```

### common_then/（通用驗證）

```typescript
// test/bdd/steps/common_then/index.ts

import { Then } from 'quickpickle'
import { expect } from 'vitest'
import type { TestWorld } from '../../helpers/world'

Then('操作成功', async (world: TestWorld) => {
  expect(world.operationResult?.success).toBe(true)
})

Then('操作失敗', async (world: TestWorld) => {
  expect(world.operationResult?.success).toBe(false)
})

Then('系統顯示 {string}', async (world: TestWorld, message: string) => {
  expect(world.operationResult?.message).toBe(message)
})

Then('系統產生 {string} 事件', async (world: TestWorld, eventName: string) => {
  /*
   * TODO: 驗證 world.eventBus.getLastEvent()
   */
  throw new Error('紅燈階段：尚未實作')
})
```

### aggregate_then/（驗證實體狀態）

```typescript
// test/bdd/steps/aggregate_then/auth.ts

import { Then } from 'quickpickle'
import { expect } from 'vitest'
import type { TestWorld } from '../../helpers/world'

Then('系統回傳 Access Token（有效期 1-2 小時）', async (world: TestWorld) => {
  /*
   * TODO: [事件風暴部位: Aggregate - Token]
   * TODO: 驗證 world.loginResult?.accessToken
   */
  throw new Error('紅燈階段：尚未實作')
})

Then('帳號 {string} 被鎖定 15 分鐘', async (world: TestWorld, account: string) => {
  /*
   * TODO: [事件風暴部位: Aggregate - User]
   * TODO: 從 world.userRepository 查詢並驗證 lockedUntil
   */
  throw new Error('紅燈階段：尚未實作')
})

Then('登入失敗次數重置為 0', async (world: TestWorld) => {
  /*
   * TODO: [事件風暴部位: Aggregate - User]
   * TODO: 從 world.userRepository 查詢 world.currentUser 並驗證 failedAttempts
   */
  throw new Error('紅燈階段：尚未實作')
})
```

### readmodel_then/（驗證查詢結果）

```typescript
// test/bdd/steps/readmodel_then/team.ts

import { Then } from 'quickpickle'
import { expect } from 'vitest'
import type { TestWorld } from '../../helpers/world'

Then('查詢結果應包含 {int} 筆球隊', async (world: TestWorld, count: number) => {
  /*
   * TODO: [事件風暴部位: ReadModel]
   * TODO: 驗證 world.queryResult.length
   */
  throw new Error('紅燈階段：尚未實作')
})
```

---

## TestWorld 類型定義

確保 `test/bdd/helpers/world.ts` 包含所需欄位：

```typescript
import type { QuickPickleWorld } from 'quickpickle'

export interface TestWorld extends QuickPickleWorld {
  // 服務實例
  userRepository: any
  eventBus: any
  authService: any
  teamRepository?: any
  teamService?: any
  timeProvider: () => Date

  // 當前測試狀態
  currentUser?: string
  loginResult?: {
    accessToken: string
    refreshToken: string
  }
  operationResult?: {
    success: boolean
    message?: string
  }
  queryResult?: any
  error?: Error

  // 事件列表
  events?: string[]
}
```

---

## 更新 index.ts

生成新步驟後，更新 `test/bdd/steps/index.ts`：

```typescript
// Step Definitions Entry Point
import './aggregate_given'
import './aggregate_then'
import './commands'
import './query'
import './common_then'
import './readmodel_then'

export type { TestWorld } from '../helpers/world'
```

---

## 驗證紅燈

```bash
# 執行測試，應該要失敗
npm run test:run -- --project bdd "docs/gherkin-spec/features/{feature}.feature"

# 預期輸出
# ❌ FAIL docs/gherkin-spec/features/{feature}.feature
# Error: 紅燈階段：尚未實作
```

**這就是紅燈**：
- ✅ Step Definition 樣板完整
- ✅ 介面定義完整（TestWorld 欄位）
- ✅ 業務邏輯未實作（拋出 Error）
- ✅ 測試執行會失敗

---

## 檢查清單

- [ ] 已掃描現有 Step Definitions，避免覆蓋
- [ ] 缺少的步驟已生成到對應目錄
- [ ] 每個步驟都有 TODO 註解標註事件風暴部位
- [ ] 每個步驟都使用 `throw new Error('紅燈階段：尚未實作')`
- [ ] TestWorld 介面已定義所需欄位
- [ ] `index.ts` 已更新匯入新檔案
- [ ] 執行測試確認**失敗**（紅燈）🔴
