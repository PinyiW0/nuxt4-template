# 架構盤點規則（Phase: map）

## 目標

分析 `.feature` 檔案，建立 Gherkin → Step Definition 的對應關係，識別事件風暴部位，指定對應的目錄。

---

## Decision Tree（決策樹）

```
讀取 Gherkin 語句
↓
判斷位置（Given/When/Then/And）

Given:
  建立測試的初始資料狀態（實體屬性值）？
    → aggregate_given/：Given('...', async (world, ...) => { repo.save(...) })
  已完成的寫入操作（建立前置條件）？
    → commands/：Given('...', async (world, ...) => { service.method(...) })

When:
  讀取操作（需要回傳值供 Then 驗證）？
    → query/：When('...', async (world, ...) => { world.result = service.query(...) })
  寫入操作（修改系統狀態，無回傳值）？
    → commands/：When('...', async (world, ...) => { service.method(...) })

Then:
  只關注操作成功或失敗（不驗證具體資料）？
    → common_then/：Then('操作成功/失敗', ...)
  驗證 Command 操作後的資料狀態（從 repository 查詢）？
    → aggregate_then/：Then('...', async (world) => { const e = repo.find(); expect(e.x) })
  驗證 Query 操作的回傳值（使用 world.result）？
    → readmodel_then/：Then('...', async (world) => { expect(world.result.x) })

And:
  繼承前一個 Given/When/Then 的判斷規則
```

---

## 目錄分類說明

| 目錄 | 用途 | 典型語句 |
|------|------|---------|
| `aggregate_given/` | 建立初始資料狀態 | `系統中有以下...`、`使用者 X 的 Y 為 Z` |
| `commands/` | 執行寫入操作 | `使用者 X 建立/更新/刪除 Y`、`使用者 X 登入` |
| `query/` | 執行讀取操作 | `使用者 X 查詢/取得/列出 Y` |
| `common_then/` | 通用驗證 | `操作成功`、`操作失敗`、`系統顯示 X`、`系統產生 X 事件` |
| `aggregate_then/` | 驗證實體狀態 | `X 的 Y 應為 Z`、`X 被鎖定` |
| `readmodel_then/` | 驗證查詢結果 | `查詢結果應包含 X`、`回傳 X` |

---

## Given 對應規則

### Pattern 1: Given + Aggregate（建立實體狀態）

**識別規則**：
- 語句中包含實體名詞 + 屬性描述
- 描述「某個東西的某個屬性是某個值」
- 常見句型：「系統中有以下」「在...的...為」「的...為」「包含」「存在」「有」

```gherkin
Given 系統中有以下使用者：
  | account | password | role |
  | admin   | pass123  | 管理者 |
```

```typescript
// test/bdd/steps/aggregate_given/user.ts
Given('系統中有以下使用者：', async (world: TestWorld, dataTable: DataTable) => {
  /*
   * TODO: [事件風暴部位: Aggregate - User]
   * TODO: 建立 repository 並存入資料
   */
  throw new Error('紅燈階段：尚未實作')
})
```

### Pattern 2: Given + Command（已完成的動作）

**識別規則**：
- 動作會修改系統狀態（已完成的動作）
- 描述「已經執行完某個動作」
- 常見過去式：「已登入」「已建立」「已完成」「已連續...次」

```gherkin
Given 使用者 "coach1" 已登入
```

```typescript
// test/bdd/steps/commands/auth.ts（或 aggregate_given/ 視情況）
Given('使用者 {string} 已登入', async (world: TestWorld, account: string) => {
  /*
   * TODO: [事件風暴部位: Command - login]
   * TODO: 執行登入建立前置條件
   */
  throw new Error('紅燈階段：尚未實作')
})
```

---

## When 對應規則

### Pattern 1: When + Command（寫入操作）

**識別規則**：
- 動作會修改系統狀態
- 描述「執行某個動作」
- 常見現在式：「建立」「更新」「刪除」「提交」「登入」「添加」「移除」

**關鍵**：Command **不需要接收回傳值**，但要處理成功/失敗狀態

```gherkin
When 使用者以帳號 "coach1" 密碼 "pass123" 登入
```

```typescript
// test/bdd/steps/commands/auth.ts
When('使用者以帳號 {string} 密碼 {string} 登入', async (world: TestWorld, account: string, password: string) => {
  /*
   * TODO: [事件風暴部位: Command - login]
   * TODO: 執行登入，將結果存入 world.operationResult
   */
  throw new Error('紅燈階段：尚未實作')
})
```

### Pattern 2: When + Query（讀取操作）

**識別規則**：
- 動作不修改系統狀態，只讀取資料
- 描述「取得某些資訊」的動作
- 常見動詞：「查詢」「取得」「列出」「檢視」「獲取」

**關鍵**：Query **必須將結果存入 world**，供 Then 驗證

```gherkin
When 教練查詢球隊列表
```

```typescript
// test/bdd/steps/query/team.ts
When('教練查詢球隊列表', async (world: TestWorld) => {
  /*
   * TODO: [事件風暴部位: Query - getTeams]
   * TODO: 執行查詢，將結果存入 world.queryResult
   */
  throw new Error('紅燈階段：尚未實作')
})
```

---

## Then 對應規則

### Pattern 1: 操作成功

```gherkin
Then 操作成功
```

```typescript
// test/bdd/steps/common_then/index.ts
Then('操作成功', async (world: TestWorld) => {
  expect(world.operationResult?.success).toBe(true)
})
```

### Pattern 2: 操作失敗

```gherkin
Then 操作失敗
```

```typescript
// test/bdd/steps/common_then/index.ts
Then('操作失敗', async (world: TestWorld) => {
  expect(world.operationResult?.success).toBe(false)
})
```

### Pattern 3: 系統顯示訊息

```gherkin
And 系統顯示 "帳號或密碼錯誤"
```

```typescript
// test/bdd/steps/common_then/index.ts
Then('系統顯示 {string}', async (world: TestWorld, message: string) => {
  expect(world.operationResult?.message).toBe(message)
})
```

### Pattern 4: Then + Aggregate（驗證實體狀態）

**識別規則**：
- 驗證實體的屬性值（而非查詢回傳值）
- 前提：When 是 Command 操作
- 常見句型：「應為」「應包含」「被鎖定」

```gherkin
And 帳號 "coach1" 被鎖定 15 分鐘
```

```typescript
// test/bdd/steps/aggregate_then/user.ts
Then('帳號 {string} 被鎖定 15 分鐘', async (world: TestWorld, account: string) => {
  /*
   * TODO: [事件風暴部位: Aggregate - User]
   * TODO: 從 repository 查詢並驗證
   */
  const user = world.userRepository.findByAccount(account)
  expect(user?.lockedUntil).toBeDefined()
})
```

### Pattern 5: Then + ReadModel（驗證查詢結果）

**識別規則**：
- 驗證的是查詢回傳值（而非 repository 中的狀態）
- 前提：When 是 Query 操作（已有 world.queryResult）
- 常見句型：「查詢結果應」「回應應」「應返回」

**關鍵**：不重新調用 service，使用 world 中的 result

```gherkin
And 查詢結果應包含 2 筆球隊
```

```typescript
// test/bdd/steps/readmodel_then/team.ts
Then('查詢結果應包含 {int} 筆球隊', async (world: TestWorld, count: number) => {
  expect(world.queryResult).toHaveLength(count)
})
```

---

## 輸出格式

產出 `test/bdd/{feature}.mapping.md`：

```markdown
# {Feature 名稱} - 架構盤點

## Feature: {功能名稱}

### Background

| Step | Gherkin | 目錄 | 事件風暴部位 |
|------|---------|------|-------------|
| Given | 系統中有以下使用者： | aggregate_given/ | Aggregate - User |

### Rule: {業務規則}

#### Example: {情境}

| Step | Gherkin | 目錄 | 事件風暴部位 |
|------|---------|------|-------------|
| Given | 使用者 "coach1" 尚未登入 | aggregate_given/ | Aggregate - User |
| When | 使用者以帳號 "coach1" 密碼 "pass123" 登入 | commands/ | Command - login |
| Then | 操作成功 | common_then/ | Success |
| And | 系統回傳 Access Token | aggregate_then/ | Aggregate - Token |

### 涉及的 Repository

- `userRepository`: User 資料存取

### 涉及的 Service

- `authService`: 認證業務邏輯

### 需要新增的 Step Definitions

| 目錄 | 檔案 | 步驟 |
|------|------|------|
| aggregate_given/ | user.ts | 系統中有以下使用者：、使用者 {string} 尚未登入 |
| commands/ | auth.ts | 使用者以帳號 {string} 密碼 {string} 登入 |
| common_then/ | index.ts | 操作成功、操作失敗、系統顯示 {string} |
```

---

## Context Inheritance（上下文繼承）

若 Then/And 省略部分 Key，從上文（Given/When）繼承：

```gherkin
Given 使用者 "Alice" 在課程 1 的進度為 70%
When 使用者 "Alice" 更新課程 1 的影片進度為 80%
And 進度應為 80%  ← 省略 userId 和 lessonId
```

推斷：`userId = 'Alice'`, `lessonId = 1`

在 Step Definition 中透過 `world.currentUser`、`world.currentLessonId` 等欄位傳遞。
