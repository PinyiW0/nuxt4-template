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

- **一個 Command = 一個 Feature File**
- **一個 Query = 一個 Feature File**

### 4. Rule 設計原則

- **一個 Rule = 一個邊界條件的分類驗證**
- Rule 描述業務規則，不是技術實作

---

## Event Storming → Gherkin 映射

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

@epic-{x} @{entity} @{type}
Feature: {Command/Query 名稱}
  身為 {Actor}
  我想要 {目標}
  以便 {原因}

  Rule: {業務規則描述}

    @happy-path
    Example: {成功場景}
      Given {前置條件}
      When {Actor} {執行操作}
      Then {預期結果}

    @error-handling
    Example: {失敗場景}
      Given {觸發錯誤的前置條件}
      When {Actor} {執行操作}
      Then {錯誤結果}
```

---

## 完整範例

### Command 範例：建立球隊

```gherkin
# language: zh-TW
# Feature: 建立球隊
# Epic: B - 球隊/球員資料管理

@epic-b @team @command
Feature: 建立球隊
  身為 教練
  我想要 建立新球隊
  以便 管理球員名單

  Rule: 球隊名稱必須唯一（不區分大小寫）

    @happy-path
    Example: 成功建立球隊
      Given 系統中沒有球隊 "閃電隊"
      When 教練 建立球隊 "閃電隊"
      Then 球隊 "閃電隊" 應該存在
      And 球隊 "閃電隊" 狀態應為 "ACTIVE"

    @error-handling
    Example: 建立重複名稱的球隊應失敗
      Given 系統中存在球隊 "閃電隊"
      When 教練 建立球隊 "閃電隊"
      Then 應回傳錯誤 "球隊名稱已被使用"

    @error-handling
    Example: 建立僅大小寫不同的球隊名稱應失敗
      Given 系統中存在球隊 "TeamA"
      When 教練 建立球隊 "teama"
      Then 應回傳錯誤 "球隊名稱已被使用"

  Rule: 球隊名稱不可為空

    @boundary
    Example: 球隊名稱為空應失敗
      When 教練 建立球隊 ""
      Then 應回傳錯誤 "球隊名稱不可為空"
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

### Query 範例：查詢球隊列表

```gherkin
# language: zh-TW
# Feature: 查詢球隊列表
# Epic: B - 球隊/球員資料管理

@epic-b @team @query
Feature: 查詢球隊列表
  身為 教練
  我想要 查詢所有球隊
  以便 選擇要管理的球隊

  Rule: 可以查詢所有啟用的球隊

    @happy-path
    Example: 成功查詢球隊列表
      Given 系統中存在球隊 "閃電隊"，狀態為 "ACTIVE"
      And 系統中存在球隊 "勇士隊"，狀態為 "ACTIVE"
      When 教練 查詢球隊列表
      Then 應回傳 2 筆球隊
      And 應包含球隊 "閃電隊"
      And 應包含球隊 "勇士隊"

    @boundary
    Example: 無球隊時應回傳空列表
      Given 系統中沒有任何球隊
      When 教練 查詢球隊列表
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

## 品質檢核清單

### 格式檢核
- [ ] 使用 Gherkin v6.x 語法（Rule, Example）
- [ ] 一個 Command/Query 一個 Feature 檔案
- [ ] 一個 Rule 對應一個業務規則

### 語言檢核
- [ ] 使用業務友善 Key（名稱而非 ID）
- [ ] 字串用雙引號，數字不加引號
- [ ] Step 使用業務語言，非技術語法

### 覆蓋度檢核
- [ ] 每個 Rule 至少一個 Happy Path
- [ ] 每個錯誤情境有對應 Example
- [ ] 邊界條件有對應 Example
