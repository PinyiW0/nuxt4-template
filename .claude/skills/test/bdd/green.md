# 綠燈階段規則（Phase: green）🟢

## 目標

實作**最少量**的程式碼，讓 Step Definition 從紅燈變綠燈。

---

## quickpickle 特性

Step Definitions 中的實作邏輯：
- 在 `Given` 中建立 repository、service 並存入 `world`
- 在 `When` 中呼叫 service 方法，結果存入 `world`
- 在 `Then` 中從 `world` 取得結果並驗證

---

## 核心原則

### 1. 最小增量開發原則

只寫讓測試通過所需的最少程式碼，不要多做。

```typescript
// ❌ 做太多了（測試沒要求）
function createTeam(data: CreateTeamInput) {
  validateTeamData(data)         // 沒測試
  checkDuplicateName(data.name)  // 沒測試
  logOperation(data)             // 沒測試
  sendNotification()             // 沒測試
  return teams.push({ ...data, id: nextId++ })
}

// ✅ 剛好夠（只實作測試要求的）
function createTeam(data: CreateTeamInput) {
  teams.push({ ...data, id: nextId++ })
}
```

### 2. Trial-and-Error 流程

```
1. 執行測試 → 看哪個失敗
2. 寫最少的程式碼修正
3. 執行測試 → 還有失敗？
4. 重複 2-3，直到全部通過
```

**不要一次寫完**，讓測試驅動你一步步完成。

### 3. 允許的做法

- ✅ Hardcode 回傳值
- ✅ 簡單的 if-else
- ✅ 直接操作資料
- ✅ 用 `Map` 或陣列模擬資料庫

### 4. 不允許的做法

- ❌ 提前優化
- ❌ 加入額外功能
- ❌ 過度抽象
- ❌ 處理測試沒覆蓋的情境

---

## Service / Repository 職責分配

### Repository 職責：資料存取

- 負責儲存、查詢、刪除資料
- 只管資料的 CRUD，不管業務邏輯
- 用記憶體內的資料結構（Map、陣列）模擬 DB 操作

```typescript
// server/mock/data/team.ts
import type { Team } from '~/types/team'

export function createTeamRepository() {
  const teams = new Map<number, Team>()
  let nextId = 1

  return {
    save(team: Team): Team {
      const id = team.id ?? nextId++
      const savedTeam = { ...team, id }
      teams.set(id, savedTeam)
      return savedTeam
    },

    findById(id: number): Team | undefined {
      return teams.get(id)
    },

    findByName(name: string): Team | undefined {
      return Array.from(teams.values()).find(t => t.name === name)
    },

    findAll(): Team[] {
      return Array.from(teams.values())
    },

    clear(): void {
      teams.clear()
      nextId = 1
    }
  }
}
```

### Service 職責：業務邏輯

- 負責實作業務規則和流程
- 透過 Repository 讀取和儲存資料
- **必須支援依賴注入**（測試才能注入 Repository）

```typescript
// composables/useTeamService.ts
import type { Team } from '~/types/team'

interface TeamServiceDeps {
  teamRepository: ReturnType<typeof createTeamRepository>
}

export function createTeamService({ teamRepository }: TeamServiceDeps) {
  return {
    createTeam(data: { name: string; createdBy: string }): Team {
      // 業務規則檢查（如果測試有要求）
      if (!data.name) {
        throw new Error('球隊名稱不可為空')
      }

      // 透過 repository 儲存
      return teamRepository.save({
        name: data.name,
        createdBy: data.createdBy
      })
    },

    getTeams(): Team[] {
      return teamRepository.findAll()
    }
  }
}
```

---

## 為什麼需要依賴注入？

**讓測試和 Service 使用同一個 Repository 實例。**

```typescript
// 測試檔案
it('Example: 成功建立球隊', () => {
  // 1. 創建 Repository
  const teamRepository = createTeamRepository()

  // 2. 注入到 Service
  const teamService = createTeamService({ teamRepository })

  // 3. 執行操作
  teamService.createTeam({ name: '紅龍隊', createdBy: 'coach1' })

  // 4. 透過同一個 Repository 驗證（關鍵！）
  const team = teamRepository.findByName('紅龍隊')
  expect(team).toBeDefined()
  expect(team!.createdBy).toBe('coach1')
})
```

如果不支援依賴注入，測試和 Service 會使用不同的 Repository，測試就無法驗證狀態變化。

---

## 常見情境的最小實作

### 成功回傳

```typescript
// 測試: Command 正常執行（不拋異常）
// 最小實作:
function createTeam(data: CreateTeamInput) {
  teamRepository.save(data)
}
```

### 回傳資料

```typescript
// 測試: expect(result.name).toBe('紅龍隊')
// 最小實作:
function createTeam(data: CreateTeamInput) {
  return teamRepository.save({ ...data, id: nextId++ })
}
```

### 拋出錯誤

```typescript
// 測試: expect(() => createTeam({ name: '' })).toThrow('球隊名稱不可為空')
// 最小實作:
function createTeam(data: CreateTeamInput) {
  if (!data.name) throw new Error('球隊名稱不可為空')
  return teamRepository.save(data)
}
```

### 查詢後驗證

```typescript
// 測試: const team = repo.findByName('紅龍隊'); expect(team.createdBy).toBe('coach1')
// 最小實作:
function createTeam(data: CreateTeamInput) {
  teamRepository.save({ ...data })  // 直接存入
}
```

### 查詢回傳列表

```typescript
// 測試: expect(result).toHaveLength(2)
// 最小實作:
function getTeams(): Team[] {
  return teamRepository.findAll()
}
```

---

## 完整範例

### 紅燈測試

```typescript
describe('Feature: 建立球隊', () => {
  let teamRepository: ReturnType<typeof createTeamRepository>
  let teamService: ReturnType<typeof createTeamService>

  beforeAll(() => {
    teamRepository = createTeamRepository()
    teamService = createTeamService({ teamRepository })
  })

  beforeEach(() => {
    teamRepository.clear()  // 每個測試前清空資料
  })

  describe('Rule: 建立球隊只需提供名稱', () => {
    it('Example: 成功建立球隊', () => {
      // When
      teamService.createTeam({ name: '紅龍隊', createdBy: 'coach1' })

      // Then
      const team = teamRepository.findByName('紅龍隊')
      expect(team).toBeDefined()
      expect(team!.createdBy).toBe('coach1')
    })

    it('Example: 球隊名稱不可為空', () => {
      expect(() => {
        teamService.createTeam({ name: '', createdBy: 'coach1' })
      }).toThrow('球隊名稱不可為空')
    })
  })
})
```

### 綠燈實作

```typescript
// server/mock/data/team.ts
export function createTeamRepository() {
  const teams = new Map<number, Team>()
  let nextId = 1

  return {
    save(team: Team): Team {
      const id = team.id ?? nextId++
      const savedTeam = { ...team, id }
      teams.set(id, savedTeam)
      return savedTeam
    },
    findByName(name: string): Team | undefined {
      return Array.from(teams.values()).find(t => t.name === name)
    },
    clear(): void {
      teams.clear()
      nextId = 1
    }
  }
}

// composables/useTeamService.ts
export function createTeamService({ teamRepository }: TeamServiceDeps) {
  return {
    createTeam(data: { name: string; createdBy: string }): Team {
      if (!data.name) {
        throw new Error('球隊名稱不可為空')
      }
      return teamRepository.save(data)
    }
  }
}
```

---

## Lint Gate（必須通過）

實作完成後，**必須執行 lint 修復並確認零錯誤**：

```bash
npm run lint --fix
npm run lint    # 確認 0 errors
```

常見需手動修的問題：
- `unused-imports/no-unused-vars`：未使用參數加 `_` 前綴
- `unused-imports/no-unused-imports`：移除未使用的 import
- `prefer-const`：`let` 改為 `const`

> **重要**：不通過 lint 的程式碼會導致 pre-commit hook 失敗，無法 commit。

---

## 驗證綠燈

```bash
# 執行測試，應該要通過
npm run test:run -- --project bdd "docs/gherkin-spec/features/{feature}.feature"

# 預期輸出
# ✓ PASS docs/gherkin-spec/features/{feature}.feature
```

---

## 完成條件

綠燈階段完成的標準：

- ✅ 執行測試，全部通過（綠燈 🟢）
- ✅ 沒有編譯/執行錯誤
- ✅ 程式碼簡單直接
- ✅ Service 支援依賴注入

**不需要**：
- ❌ 程式碼優雅（留給藍燈階段）
- ❌ 效能優化（留給藍燈階段）
- ❌ 完整錯誤處理（測試沒要求就不做）

---

## 檢查清單

- [ ] `npm run lint` 零錯誤
- [ ] 所有測試通過（綠燈）🟢
- [ ] Repository 使用記憶體資料結構（Map/陣列）
- [ ] Service 透過建構子注入 Repository
- [ ] 沒有新增測試沒覆蓋的功能
- [ ] 程式碼可能很醜（這是正常的）
- [ ] 準備進入藍燈階段重構

---

## 記住

1. **測試驅動你** - 不要猜測需要什麼，讓失敗的測試告訴你
2. **最小實作** - 只寫通過測試需要的程式碼
3. **依賴注入** - Service 必須支援注入 Repository
4. **Trial-and-Error** - 執行測試 → 修正 → 再執行，不斷循環

完成綠燈後，進入藍燈階段 🔵
