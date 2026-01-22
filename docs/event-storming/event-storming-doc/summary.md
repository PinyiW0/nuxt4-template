# 規格驅動全自動開發術（SDD）精華總結

## 一、核心思維：抽象與翻譯的雙重性

### 為什麼需要抽象？
- **抽象 = 共同語言**：讓不同角色（業務、測試、開發）能在同一語言上協作
- 沒有共同語言，就無法協作；無法協作，就無法精準控制 AI 產出
- **規格必須「先抽象」、「後翻譯」**，才能成為精準的產出物

### Vision 金字塔（8 層抽象）

```
Vision → Goals → Capabilities → Features → User Stories → AC → Examples → Code
```

- 第 4-6 層（Features → User Story → AC）是**需求層**，協作的核心區域
- **Acceptance Criteria 是分界點**：之前討論「達成什麼」，之後關心「如何驗證」

### Problem Domain vs Solution Domain
- 不是二分法，而是**連續光譜**
- DSL-Level Examples 屬於高階業務解法
- ISA-Level Examples 屬於技術程式碼解法

---

## 二、Event Storming 模型：規格的共同語言

### 為什麼用 Event Storming？
- 顆粒度剛好：不過多技術細節，也不太抽象
- 連接 Problem Domain 和 Solution Domain 的橋樑
- **Event 是切入點**：無論業務或技術專家都關注的「重要改變」

### 六個核心元素

| 元素 | 定義 | 特性 |
|------|------|------|
| **Event** | 系統狀態的改變 | 用過去式描述、不可逆、代表系統邊界 |
| **Command** | Actor 對系統執行的操作 | 用主動式描述、可能失敗 |
| **Actor** | 執行 Command 的人或系統 | 可以是人或其他系統 |
| **Rules** | Command 的前置/後置條件 | Preconditions + Postconditions |
| **Aggregate** | 內聚的狀態體 | 需持久化的資料單位 |
| **Read Model** | 查詢介面 | 讓 Actor 查詢當前狀態做決策 |

### 兩種系統邊界模型

**1. 修改型操作（Command Operation）**

```
Command/Event → Preconditions → 改變 Aggregates → Postconditions → raise Event
```

**2. 查詢型操作（Query Operation）**

```
Query → Preconditions → 回傳 Read Model
```

---

## 三、Event Storming → Gherkin 翻譯規則

### 核心映射關係

**修改型操作**：

| Event Storming | Gherkin |
|----------------|---------|
| Preconditions（前置狀態） | Given |
| Command（執行操作） | When |
| Postconditions + Event | Then |

**查詢型操作**：

| Event Storming | Gherkin |
|----------------|---------|
| Preconditions（前置狀態） | Given |
| Query（執行查詢） | When |
| Read Model（回傳資料） | Then |

### Feature 切分原則
- **一個 Command = 一個 Feature File**
- **一個 Query = 一個 Feature File**

### Rule 設計原則
- 一個 Rule = 一個 Precondition 或 Postcondition 的邊界分類驗證

### Given 的三種寫法
1. **直接設定 Aggregates**：適合簡單 Aggregate
2. **透過 Commands 設定**：適合複雜 Aggregate（維護 Invariant）
3. **透過 Events 設定**：適合 CQRS 架構或外部事件

### Key 識別規則
- 優先使用**業務友善的 Key**（如名稱），而非技術 ID
- 字串用雙引號，數字不加引號

---

## 四、DSL-Level vs ISA-Level Gherkin

### DSL-Level 的局限
1. **缺少技術場域**：無法判斷是前端、後端還是移動端測試
2. **隱藏技術參數**：用友善 Key 而非技術 ID，缺少 API endpoint、HTTP method 等

→ AI 只能「腦補」，無法 100% 精準翻譯成測試程式碼

### ISA-Level 的定義

> **ISA = 測試程式碼的抽象**
> 基於特定 Tech Stack，參數明確，可被 100% 精準翻譯成測試程式碼

### ISA 的兩種實踐

| 風格 | 特點 |
|------|------|
| **明確技術參數** | 所有技術細節直接寫在步驟中，不需 isa.yml |
| **指令集包裝**（推薦） | 用固定句型包裝，配合 isa.yml + API Spec |

### 核心差異
- **DSL**：描述「做什麼」（業務驗收）
- **ISA**：描述「怎麼做」（技術驗收）
- 兩者都是**結果導向**語言，只描述驗收條件

---

## 五、完整翻譯鏈

```
Event Storming → DSL-Level Gherkin → ISA-Level Gherkin → Test Code → Code
```

| 層級 | 職責 | 受眾 |
|------|------|------|
| Event Storming | 建立共同語言模型 | 全體 |
| DSL-Level | 業務可讀的可執行規格 | 業務、QA、開發 |
| ISA-Level | 技術可翻譯的精準規格 | 開發、AI |
| Test/Code | 自動化測試與實作 | 機器 |

---

## 六、關鍵洞察

1. **協作就是控制**：連人都無法協作，就無法控制 AI 產出
2. **規格精度決定自動化程度**：Event Storming → 高精度 Gherkin → AI 精準生成
3. **結果導向的語言**：AI 時代工程師要學的是「比高階語言更高階」的語言
4. **你不會被取代，但必須轉型**：從寫「過程導向」的 Code，轉為寫「結果導向」的規格

---

## 核心公式

> **抽象（共同語言）+ 精準翻譯（每層一致）= 規格驅動全自動開發**
