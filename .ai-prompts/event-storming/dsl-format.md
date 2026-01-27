# DSL-Level Gherkin 格式規範

本文件定義 Event Storming 產出的 DSL-Level Gherkin 語法規範。

## DSL vs ISA 的定位

```
Event Storming → DSL-Level Gherkin → ISA-Level Gherkin → Test Code → Code
                 ^^^^^^^^^^^^^^^^
                 本文件規範的範圍
```

| 層級 | 職責 | 受眾 | 特點 |
|------|------|------|------|
| **DSL-Level** | 業務可讀的可執行規格 | 業務、QA、開發 | 用業務語言、無技術細節 |
| **ISA-Level** | 技術可翻譯的精準規格 | 開發、AI | 有技術參數、可 100% 轉測試碼 |

---

## 核心原則

### 1. 使用業務友善的 Key

**正確（DSL）**：
```gherkin
Given 系統中存在球隊 "閃電隊"
When 教練 選擇球隊 "閃電隊"
```

**錯誤（這是 ISA）**：
```gherkin
Given 準備一個球隊, with table:
  | >Team.id | teamName |
  | <teamId  | 閃電隊   |
When (UID="$User.id") 選擇球隊, call table:
  | teamId   |
  | $Team.id |
```

### 2. 字串與數字格式

- **字串**：用雙引號 `"閃電隊"`
- **數字**：不加引號 `背號 1`
- **百分比**：`進度為 70%`

### 3. Feature 切分原則

- **一個 Command = 一個 Feature File**（對應一個 Aggregate 操作）
- **一個 Query = 一個 Feature File**

**錯誤範例**（一個 Feature 包含多個 Command）：
```gherkin
# ❌ 錯誤：查詢球隊和選擇球隊是兩個不同的 Command
Feature: 查詢球隊列表
  Rule: 可以查詢所有球隊      # Command: QueryTeamList
  Rule: 可以選擇特定球隊      # Command: SelectTeam ← 應獨立成 Feature
```

**正確拆分**：
```
us-b1-query-team-list.feature   → @publishes: 球隊列表已查詢
us-b1-select-team.feature       → @publishes: 球隊已選擇
```

### 4. When 語法規則（重要）

| 關鍵字 | And 使用 | 原因 |
|--------|----------|------|
| Given  | ✅ 允許   | 前置條件可以有多個 |
| **When** | **❌ 禁止** | **每個 Example 只有一個 Command** |
| Then   | ✅ 允許   | 驗證結果可以有多個 |

**原因**：Command 對應 Event，一個 Example 測試一個 Command 對 Aggregate 的操作。

**錯誤範例**：
```gherkin
# ❌ 錯誤：一個 Example 有兩個 Command
When 教練 建立球隊 "閃電隊"
And 教練 新增球員 "王小明"    # ← 這是另一個 Command
```

### 5. Rule 設計原則

- **一個 Rule = 一個邊界條件的分類驗證**
- Rule 描述業務規則，不是技術實作

### 6. 角色權限規則（重要）

根據 PRD 中的角色定義，每個 Feature 必須包含權限測試：

| 角色 | 權限範圍 | 必測場景 |
|------|----------|----------|
| 管理者 | 可操作所有資源 | 操作任何人建立的資源 |
| 教練 | 只能操作自己建立的資源 | 操作自己的資源 |
| 教練 | 無法操作他人資源 | 操作他人資源應回傳錯誤 |

**Given 角色設定範例**：
```gherkin
# 設定角色
Given 使用者為「管理者」角色
Given 使用者為「教練」角色，帳號為 "coach1"

# 設定資源擁有者
Given 系統中存在球隊 "藍鷹隊"，建立者為 "coach1"
Given 球隊 "紅龍隊" 的建立者為 "coach2"
```

---

## Event Storming → Gherkin 映射

### Command、Aggregate、Event 關係（DDD 觀點）

```
Command ──operates on──▶ Aggregate ──emits──▶ Event(s)
```

| 映射模式 | 說明 | Feature 標示 |
|----------|------|--------------|
| C → E | 一個 Command 產生一個 Event | `@publishes: 球隊已建立` |
| C → 3E | 一個 Command 觸發多個 Event（級聯） | `@publishes: 球隊已刪除, 球員已刪除` |
| 3C → E | 多個 Command 協調完成（Saga） | 各 Feature 用 `@saga` 標示 |

### 修改型操作（Command）

| Event Storming | Gherkin |
|----------------|---------|
| Preconditions（前置狀態） | Given |
| Command（執行操作） | When |
| Postconditions + Event | Then |

### 查詢型操作（Query）

| Event Storming | Gherkin |
|----------------|---------|
| Preconditions（前置狀態） | Given |
| Query（執行查詢） | When |
| Read Model（回傳資料） | Then |

---

## Given 的三種寫法

### 1. 直接設定 Aggregates（推薦）

適合簡單 Aggregate：

```gherkin
Given 系統中存在球隊 "閃電隊"
And 球隊 "閃電隊" 有球員 "王小明"，背號 1
```

### 2. 透過 Commands 設定

適合複雜 Aggregate（需維護 Invariant）：

```gherkin
Given 教練 已建立球隊 "閃電隊"
And 教練 已新增球員 "王小明" 到球隊 "閃電隊"，背號 1
```

### 3. 透過 Events 設定

適合 CQRS 架構或外部事件：

```gherkin
Given 球隊 "閃電隊" 已建立
And 球員 "王小明" 已加入球隊 "閃電隊"
```

---

## Feature 檔案結構（Gherkin v6.x）

```gherkin
# language: zh-TW
# encoding: UTF-8
# Feature: {Command/Query 名稱}
# Epic: {Epic ID} - {Epic 名稱}
# Source: {PRD 來源}
# Generated: YYYY-MM-DD
# @publishes: {產生的 Event，可多個}
# @requires: {前置依賴的 Feature}

@epic-{x} @{entity} @{type}
Feature: {Command/Query 名稱}
  身為 {Actor}
  我想要 {目標}
  以便 {原因}

  Background:                    # 選用，詳見下方使用準則
    Given {所有 Example 共用的前置條件}

  # ===== Phase 1: 核心決策 =====

  Rule: {權限規則}
  Rule: {全域決策相關規則}

  # ===== Phase 2: 核心業務 =====

  Rule: {業務規則描述}

    @happy-path
    Example: {成功場景}
      Given {前置條件}
      When {Actor} {執行操作}
      Then {預期結果}

  # ===== Phase 3: 邊界條件 =====

  Rule: {空值驗證規則}
  Rule: {範圍驗證規則}
  Rule: {重複性驗證規則}

    @error-handling
    Example: {失敗場景}
      Given {觸發錯誤的前置條件}
      When {Actor} {執行操作}
      Then {錯誤結果}
```

### 跨 Feature 依賴標籤

| 標籤 | 說明 | 範例 |
|------|------|------|
| `@publishes` | 此 Command 產生的 Event（可多個） | `@publishes: 球隊已刪除, 球員已刪除` |
| `@subscribes` | 訂閱的 Event（觸發此 Command，Saga 用） | `@subscribes: 訂單已建立` |
| `@requires` | 前置依賴的 Feature | `@requires: 使用者登入` |
| `@saga` | 所屬的 Saga 流程（跨 Aggregate 協調） | `@saga: 訂單處理流程` |

---

## Background 使用準則

### 何時使用 Background

| 情況 | 使用 Background | 使用 Given |
|------|-----------------|------------|
| 所有 Example 都需要相同的前置條件 | ✅ | - |
| 只有部分 Example 需要 | - | ✅ |
| 前置條件涉及會變動的資料 | - | ✅ |
| 前置條件描述「不存在」的狀態 | - | ✅ |

### 適合放在 Background 的內容

```gherkin
Background:
  # ✅ 好：所有測試都需要的基礎 Entity
  Given 系統中存在球隊 "閃電隊"

  # ✅ 好：所有測試都需要的使用者狀態
  And 教練 已登入系統
```

### 不適合放在 Background 的內容

```gherkin
Background:
  # ❌ 壞：「不存在」的狀態不應放在 Background
  Given 系統中沒有球隊 "閃電隊"

  # ❌ 壞：只有部分 Example 需要的資料
  Given 球隊 "閃電隊" 有球員 "王小明"，背號 1

  # ❌ 壞：會在測試中變動的資料
  Given 球隊 "閃電隊" 狀態為 "ACTIVE"
```

### Background 範例

**正確用法**：

```gherkin
@epic-b @player @command
Feature: 建立球員
  身為 教練
  我想要 新增球員到球隊
  以便 維護球員名單

  Background:
    # 所有 Example 都需要球隊存在
    Given 系統中存在球隊 "閃電隊"

  Rule: 背號在同一球隊內必須唯一

    @happy-path
    Example: 成功新增球員
      # 不需要重複 "Given 系統中存在球隊 閃電隊"
      When 教練 新增球員到球隊 "閃電隊"，姓名 "王小明"，背號 1，守位 "P"，排序 1
      Then 球隊 "閃電隊" 應有球員 "王小明"

    @error-handling
    Example: 新增重複背號的球員應失敗
      # 這個 Example 特有的前置條件放在 Given
      Given 球隊 "閃電隊" 有球員 "王小明"，背號 1
      When 教練 新增球員到球隊 "閃電隊"，姓名 "李小華"，背號 1，守位 "C"，排序 2
      Then 應回傳錯誤 "背號已被使用"
```

**錯誤用法**：

```gherkin
# ❌ 錯誤：Background 放了不是所有 Example 都需要的資料
Feature: 建立球隊

  Background:
    Given 系統中存在球隊 "閃電隊"  # 但「成功建立」需要的是「不存在」

  Rule: 球隊名稱必須唯一

    @happy-path
    Example: 成功建立球隊
      # ❌ 問題：Background 說球隊存在，但這裡需要不存在
      Given 系統中沒有球隊 "閃電隊"  # 與 Background 矛盾
      When 教練 建立球隊 "閃電隊"
      Then 球隊 "閃電隊" 應該存在
```

### Background 與 Rule 的關係

Background 適用於整個 Feature 的所有 Example，不能針對單一 Rule：

```gherkin
Feature: 球員管理

  Background:
    Given 系統中存在球隊 "閃電隊"  # 適用於下方所有 Rule

  Rule: 背號必須唯一
    Example: ...
    Example: ...

  Rule: 背號範圍為 0-99
    Example: ...  # 也會套用 Background
    Example: ...
```

如果不同 Rule 需要不同的共用前置條件，考慮拆分為多個 Feature 檔案。

---

## 完整範例

### Command 範例：刪除球隊（含角色權限）

```gherkin
# language: zh-TW
# Feature: 刪除球隊
# Epic: B - 球隊/球員資料管理
# Allowed Roles: 管理者, 教練

@epic-b @team @command
Feature: 刪除球隊
  身為 管理者/教練
  我想要 刪除不需要的球隊
  以便 維護乾淨的資料

  Background:
    Given 使用者已登入系統

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可刪除所有球隊

    @permission @happy-path
    Example: 管理者刪除任意球隊
      Given 使用者為「管理者」角色
      And 系統中存在球隊 "藍鷹隊"，建立者為 "coach1"
      When 使用者 刪除球隊 "藍鷹隊"
      Then 球隊 "藍鷹隊" 狀態應為 "DELETED"
      And 球隊 "藍鷹隊" 的刪除者為目前使用者

  Rule: 教練只能刪除自己建立的球隊

    @permission @happy-path
    Example: 教練刪除自己建立的球隊
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 系統中存在球隊 "藍鷹隊"，建立者為 "coach1"
      When 使用者 刪除球隊 "藍鷹隊"
      Then 球隊 "藍鷹隊" 狀態應為 "DELETED"

    @permission @error-handling
    Example: 教練無法刪除他人建立的球隊
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 系統中存在球隊 "紅龍隊"，建立者為 "coach2"
      When 使用者 刪除球隊 "紅龍隊"
      Then 應回傳錯誤 "無權限操作此球隊"

  # ===== Phase 2: 核心業務 =====

  Rule: 刪除球隊採用軟刪除

    @happy-path
    Example: 軟刪除球隊
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 系統中存在球隊 "藍鷹隊"，建立者為 "coach1"，狀態為 "ACTIVE"
      When 使用者 刪除球隊 "藍鷹隊"
      Then 球隊 "藍鷹隊" 狀態應為 "DELETED"
      And 球隊 "藍鷹隊" 的刪除時間已記錄

  # ===== Phase 3: 邊界條件 =====

  Rule: 無法刪除不存在或已刪除的球隊

    @error-handling
    Example: 刪除已刪除的球隊應失敗
      Given 使用者為「管理者」角色
      And 系統中存在球隊 "解散隊"，狀態為 "DELETED"
      When 使用者 刪除球隊 "解散隊"
      Then 應回傳錯誤 "球隊不存在或已刪除"
```

### Command 範例：建立球員

```gherkin
# language: zh-TW
# Feature: 建立球員
# Epic: B - 球隊/球員資料管理

@epic-b @player @command
Feature: 建立球員
  身為 教練
  我想要 新增球員到球隊
  以便 維護球員名單

  Background:
    Given 系統中存在球隊 "閃電隊"

  Rule: 背號在同一球隊內必須唯一

    @happy-path
    Example: 成功新增球員
      When 教練 新增球員到球隊 "閃電隊"，姓名 "王小明"，背號 1，守位 "P"，排序 1
      Then 球隊 "閃電隊" 應有球員 "王小明"
      And 球員 "王小明" 背號應為 1

    @error-handling
    Example: 新增重複背號的球員應失敗
      Given 球隊 "閃電隊" 有球員 "王小明"，背號 1
      When 教練 新增球員到球隊 "閃電隊"，姓名 "李小華"，背號 1，守位 "C"，排序 2
      Then 應回傳錯誤 "背號已被使用"

    @happy-path
    Example: 不同球隊可使用相同背號
      Given 系統中存在球隊 "勇士隊"
      And 球隊 "閃電隊" 有球員 "王小明"，背號 1
      When 教練 新增球員到球隊 "勇士隊"，姓名 "張大華"，背號 1，守位 "C"，排序 1
      Then 球隊 "勇士隊" 應有球員 "張大華"

  Rule: 背號範圍為 0-99

    @boundary
    Example: 背號為 0 應成功
      When 教練 新增球員到球隊 "閃電隊"，姓名 "王小明"，背號 0，守位 "P"，排序 1
      Then 球員 "王小明" 背號應為 0

    @boundary
    Example: 背號為 99 應成功
      When 教練 新增球員到球隊 "閃電隊"，姓名 "王小明"，背號 99，守位 "P"，排序 1
      Then 球員 "王小明" 背號應為 99

  Rule: 新增時必須指定排序

    @error-handling
    Example: 未指定排序應失敗
      When 教練 新增球員到球隊 "閃電隊"，姓名 "王小明"，背號 1，守位 "P"
      Then 應回傳錯誤 "必須指定排序"
```

### Query 範例：查詢球隊列表（含角色權限）

```gherkin
# language: zh-TW
# Feature: 查詢球隊列表
# Epic: B - 球隊/球員資料管理
# Allowed Roles: 管理者, 教練

@epic-b @team @query
Feature: 查詢球隊列表
  身為 管理者/教練
  我想要 查詢球隊列表
  以便 選擇要管理的球隊

  Background:
    Given 使用者已登入系統

  # ===== Phase 1: 核心決策 =====

  Rule: 管理者可查詢所有球隊

    @permission @happy-path
    Example: 管理者查詢球隊列表
      Given 使用者為「管理者」角色
      And 系統中存在球隊 "藍鷹隊"，建立者為 "coach1"
      And 系統中存在球隊 "紅龍隊"，建立者為 "coach2"
      When 使用者 查詢球隊列表
      Then 應回傳 2 筆球隊
      And 應包含球隊 "藍鷹隊"
      And 應包含球隊 "紅龍隊"

  Rule: 教練只能查詢自己建立的球隊

    @permission @happy-path
    Example: 教練查詢自己建立的球隊
      Given 使用者為「教練」角色，帳號為 "coach1"
      And 系統中存在球隊 "藍鷹隊"，建立者為 "coach1"
      And 系統中存在球隊 "紅龍隊"，建立者為 "coach2"
      When 使用者 查詢球隊列表
      Then 應回傳 1 筆球隊
      And 應包含球隊 "藍鷹隊"
      And 不應包含球隊 "紅龍隊"

  # ===== Phase 2: 核心業務 =====

  Rule: 查詢結果預設過濾已刪除的球隊

    @happy-path
    Example: 已刪除的球隊不顯示
      Given 使用者為「管理者」角色
      And 系統中存在球隊 "藍鷹隊"，狀態為 "ACTIVE"
      And 系統中存在球隊 "解散隊"，狀態為 "DELETED"
      When 使用者 查詢球隊列表
      Then 應回傳 1 筆球隊
      And 不應包含球隊 "解散隊"

  # ===== Phase 3: 邊界條件 =====

  Rule: 無球隊時應回傳空列表

    @boundary
    Example: 新教練查詢球隊列表
      Given 使用者為「教練」角色，帳號為 "coach_new"
      And 使用者尚未建立任何球隊
      When 使用者 查詢球隊列表
      Then 應回傳 0 筆球隊
```

---

## Step 撰寫指南

### Given Steps

描述系統的前置狀態，使用業務語言：

```gherkin
# 存在性
Given 系統中存在球隊 "閃電隊"
Given 系統中沒有球隊 "幽靈隊"
Given 系統中沒有任何球隊

# 關聯
Given 球隊 "閃電隊" 有球員 "王小明"，背號 1

# 狀態
Given 球隊 "閃電隊" 狀態為 "ACTIVE"
Given 球員 "王小明" 排序為 1
```

### When Steps

描述 Actor 執行的操作：

```gherkin
# Command
When 教練 建立球隊 "閃電隊"
When 教練 編輯球隊 "閃電隊" 名稱為 "雷霆隊"
When 教練 刪除球隊 "閃電隊"
When 教練 新增球員到球隊 "閃電隊"，姓名 "王小明"，背號 1，守位 "P"，排序 1

# Query
When 教練 查詢球隊列表
When 教練 查詢球隊 "閃電隊" 的球員列表
When 教練 選擇球隊 "閃電隊"
```

### Then Steps

描述預期結果，使用業務語言：

```gherkin
# 存在性驗證
Then 球隊 "閃電隊" 應該存在
Then 球隊 "閃電隊" 應該不存在
Then 球隊 "閃電隊" 應有球員 "王小明"

# 屬性驗證
Then 球隊 "閃電隊" 狀態應為 "DELETED"
Then 球員 "王小明" 背號應為 1

# 列表驗證
Then 應回傳 2 筆球隊
Then 應包含球隊 "閃電隊"

# 錯誤驗證
Then 應回傳錯誤 "球隊名稱已被使用"
```

---

## 標籤規範

### 必要標籤

| 標籤 | 格式 | 範例 |
|------|------|------|
| Epic | `@epic-{letter}` | `@epic-b` |
| Entity | `@{entity}` | `@team`, `@player` |
| 操作類型 | `@command` 或 `@query` | `@command` |

### 場景標籤

| 標籤 | 用途 |
|------|------|
| `@happy-path` | 正常成功流程 |
| `@error-handling` | 錯誤處理場景 |
| `@boundary` | 邊界條件測試 |
| `@permission` | 權限相關測試（Phase 1 必須包含） |

---

## 邊界決策記錄

每個 Feature 檔案頭部應記錄相關的邊界決策：

```gherkin
# Boundary Decisions:
#   - Q1: 背號同一球隊內唯一
#   - Q2: 軟刪除
#   - Q3: 級聯刪除
```

這些決策會影響 Rule 和 Example 的設計。

---

## 覆蓋率三階段

每個 Feature 的 Rule 應按以下階段組織並確保覆蓋：

```
┌─────────────────────────────────────────────────────┐
│ Phase 1: 核心決策 (Global Decisions)                 │
│   - 權限規則（誰可以執行這個操作）                       │
│   - 刪除策略（硬刪除/軟刪除）                           │
│   - 唯一性範圍（全域/局部唯一）                         │
└─────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│ Phase 2: 核心業務 (Business Rules)                   │
│   - Happy Path（正常成功流程）                         │
│   - 業務約束（名稱不可重複、背號唯一等）                  │
│   - 關聯處理（級聯刪除、連帶更新）                       │
└─────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│ Phase 3: 邊界條件 (Boundary Conditions)              │
│   - 空值驗證（必填欄位為空、純空白）                     │
│   - 範圍驗證（數值上下限、字串長度）                     │
│   - 重複性驗證（唯一性欄位衝突）                        │
│   - 狀態衝突（已刪除、已鎖定、不存在）                   │
└─────────────────────────────────────────────────────┘
```

---

## 品質檢核清單

### 格式檢核
- [ ] 使用 Gherkin v6.x 語法（Rule, Example）
- [ ] 一個 Command/Query 一個 Feature 檔案
- [ ] 一個 Rule 對應一個業務規則
- [ ] **When 只有一個，禁止 When...And...**

### 語言檢核
- [ ] 使用業務友善 Key（名稱而非 ID）
- [ ] 字串用雙引號，數字不加引號
- [ ] Step 使用業務語言，非技術語法

### 依賴標示檢核
- [ ] 標示 `@publishes`（產生的 Event）
- [ ] 標示 `@requires`（前置依賴）
- [ ] Saga 流程標示 `@saga` 和 `@subscribes`

### 覆蓋度檢核（三階段）
- [ ] **Phase 1 核心決策**：
  - [ ] **權限規則已測試**（必要）
    - [ ] 管理者權限測試（可操作所有資源）
    - [ ] 教練權限測試（只能操作自己建立的資源）
    - [ ] 跨用戶限制測試（教練操作他人資源應失敗）
  - [ ] 審計欄位測試（created_by, deleted_by 等）
- [ ] **Phase 2 核心業務**：每個 Rule 至少一個 Happy Path
- [ ] **Phase 3 邊界條件**：
  - [ ] 空值驗證（必填欄位）
  - [ ] 範圍驗證（數值上下限）
  - [ ] 重複性驗證（唯一性衝突）
  - [ ] 狀態驗證（不存在、已刪除）

### 權限檢核（強制）

每個 Command/Query Feature 必須回答以下問題：

| 問題 | 應有的 Example |
|------|----------------|
| 管理者可以操作所有資源嗎？ | `@permission` 管理者操作任意資源 |
| 教練可以操作自己的資源嗎？ | `@permission` 教練操作自己建立的資源 |
| 教練操作他人資源會怎樣？ | `@permission @error-handling` 教練操作他人資源應失敗 |
