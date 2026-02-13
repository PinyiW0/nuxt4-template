# Phase 1: 逐一轉換

## 目標

將單一 DSL `.feature` 檔案轉換為 `.flow.md` 操作流程文件。

---

## 必讀規範

```
僅需讀取：
1. docs/e2e-flows/SPEC.md                              — 格式規格
2. docs/e2e-flows/_common.flow.md                       — 共用步驟（Phase 0 產出）
3. docs/gherkin-spec/features/{NN}-{name}.dsl.feature   — 目標 feature
```

---

## 前置條件

Phase 0 必須已完成：
- `docs/e2e-flows/_common.flow.md` 存在

→ 不存在 → 提示先執行 `/feature-to-flow 0`

---

## 執行步驟

### Step 1：讀取並解析 Feature

```
解析 .feature 檔案結構：
├── Feature 名稱
├── Background（Feature-level 或 Rule-level）
│   ├── Given 列表
│   └── DataTable（如有）
├── Rule[] — 業務規則
│   └── Example[] — 情境
│       ├── Given[] — 前置條件
│       ├── When[] — 觸發動作
│       └── Then[] — 預期結果
```

### Step 2：判斷涉及的頁面

從 When/Then 推導此 feature 涉及哪些頁面。

| Feature 關鍵字 | 頁面 | 路由 |
|---------------|------|------|
| 登入、登出 | 登入頁 | `/login` |
| 球隊 | 球隊管理 | `/teams` |
| 球員 | 球員管理 | `/players` |
| 訓練（列表、建立） | 訓練管理 | `/trainings` |
| 歷史訓練、批次刪除 | 歷史訓練 | `/trainings/history` |
| AI 系統、好球帶 | 訓練詳情 | `/trainings/{id}` |
| 投球清單 | 投球列表 | `/trainings/{id}` |
| 單球儀表板 | 單球詳情 | `/trainings/{id}/pitches/{pitchId}` |
| 訓練分析 | 訓練分析 | `/trainings/{id}/analysis` |
| 選手分析 | 選手分析 | `/analysis` |
| 選手統計 | 選手統計 | `/analysis/{id}` |

### Step 3：撰寫元素定義表

在 `.flow.md` 頂部建立該 feature 涉及的所有 testid 定義。

遵循 SPEC.md 的 testid 命名規則。

#### 元素推導 Decision Tree

```
Gherkin 語句
├── "建立 / 新增 {entity}"
│   └── 需要：{entity}-create, {entity}-form-modal, {entity}-{fields...}, {entity}-save
├── "編輯 / 修改 / 更新 {entity}"
│   └── 需要：{entity}-edit, {entity}-form-modal, {entity}-{fields...}, {entity}-save
├── "刪除 {entity}"
│   └── 需要：{entity}-delete（+ 確認彈窗 #confirm-modal / #confirm-ok）
├── "查詢 / 列表 / 列出"
│   └── 需要：{entity}-list
├── "排序"
│   └── 需要：{entity}-list（拖曳或排序按鈕）
├── "啟動 / 關閉 / 切換"
│   └── 需要：{entity}-{action}（如 training-ai-toggle）
├── "設定 / 調整"
│   └── 需要：{entity}-modal, {entity}-{fields...}, {entity}-save
└── "登入 / 登出"
    └── 見 _common.flow.md（不在此處定義）
```

### Step 4：撰寫 .flow.md

按照 SPEC.md 格式撰寫操作流程文件。

### Step 5：詢問用戶確認

確認格式：

```
「04-建立球隊」轉換完成

已產出：docs/e2e-flows/04-建立球隊.flow.md
  - 規則數：2
  - 情境數：4（正常 3 + 跳過 1）
  - 元素數：6

確認後繼續轉換下一個 feature？
```

---

## Gherkin → Flow 轉換規則

### Given 轉換

| Given 類型 | 轉換方式 |
|-----------|---------|
| 「系統中有以下{entity}：」+ DataTable | → 不需操作（mock 資料已預設） |
| 「{role} "{account}" 已登入」 | → （共用步驟，見 _common.flow.md） |
| 「使用者 "{account}" 尚未登入」 | → 不需操作（預設未登入） |
| 「{entity} "{name}" 已存在」 | → 不需操作（mock 資料已預設） |
| 「使用者已連續登入失敗 N 次」 | → ⏭️ 跳過（需要控制內部狀態） |
| 「帳號被鎖定」 | → ⏭️ 跳過（需要控制內部狀態） |

### When 轉換

When 是轉換的核心 — 將業務動作拆解為 UI 操作步驟。

#### CRUD 通用模式

**建立（Create）**：
```markdown
- 「{role}建立{entity}名稱為 "{name}"」
  1. 點擊「新增{entity}」按鈕 → #{entity}-create
  2. 等待彈窗出現 → #{entity}-form-modal
  3. 在「{entity}名稱」欄位輸入 {name} → #{entity}-name
  4. 點擊「建立」按鈕 → #{entity}-save
```

**編輯（Update）**：
```markdown
- 「{role}將{entity} "{old}" 名稱改為 "{new}"」
  1. 在{entity}列表中找到「{old}」那列 → #{entity}-list
  2. 點擊該列的「編輯」按鈕 → #{entity}-edit
  3. 等待彈窗出現 → #{entity}-form-modal
  4. 清空「{entity}名稱」欄位並輸入 {new} → #{entity}-name
  5. 點擊「儲存」按鈕 → #{entity}-save
```

**刪除（Delete）**：
```markdown
- 「{role}刪除{entity} "{name}"」
  1. 在{entity}列表中找到「{name}」那列 → #{entity}-list
  2. 點擊該列的「刪除」按鈕 → #{entity}-delete
  3. 等待確認彈窗出現 → #confirm-modal
  4. 點擊「確認」按鈕 → #confirm-ok
```

**查詢（Read）**：
```markdown
- 「{role}查詢{entity}列表」
  1. 前往{entity}管理頁 → /{entities}
  2. 等待頁面載入 → #{entities}-page
```

#### 批次操作模式

```markdown
- 「{role}批次刪除訓練 "T001"、"T002"」
  1. 勾選「T001」那列的 checkbox → #history-row
  2. 勾選「T002」那列的 checkbox → #history-row
  3. 點擊「批次刪除」按鈕 → #batch-delete-btn
  4. 等待確認彈窗出現 → #confirm-modal
  5. 點擊「確認」按鈕 → #confirm-ok
```

#### 切換/設定模式

```markdown
- 「{role}啟動 AI 系統」
  1. 點擊「AI 啟動」切換按鈕 → #training-ai-toggle
  2. 等待成功提示出現
```

### Then 轉換

| Then 類型 | 轉換方式 |
|-----------|---------|
| 「操作成功」 | → 顯示成功提示 |
| 「操作失敗」 | → 顯示錯誤提示 |
| 「系統顯示 "{message}"」 | → 文字「{message}」可見 |
| 「系統產生 "{event}" 事件」 | → ⏭️ 跳過（內部事件） |
| 「{entity} "{name}" 的{field}為 "{value}"」 | → #{entity}-list 中「{name}」那列包含「{value}」 |
| 「查詢結果應包含 N 筆」 | → #{entity}-list 包含 N 筆（用 `locator('tbody tr')` 計數） |
| 「列表中不包含 "{name}"」 | → #entity-list 不包含「{name}」 |
| 「系統回傳 Access Token」 | → ⏭️ 跳過（畫面上看不到 token） |
| 「登入失敗次數重置為 0」 | → ⏭️ 跳過（內部狀態） |
| 「帳號被鎖定 N 分鐘」 | → ⏭️ 跳過（內部狀態） |

---

## 跳過邏輯 Decision Tree

### 步驟跳過

```
Then 語句
├── 涉及內部狀態（failedAttempts、lockedUntil、token）→ ⏭️ 跳過
├── 涉及內部事件（系統產生 "X" 事件）→ ⏭️ 跳過
├── 涉及 API 回傳值（系統回傳 Access Token）→ ⏭️ 跳過
└── 可在畫面上驗證 → 轉換為驗證步驟
```

### 情境跳過

```
整個情境
├── 所有 When 都需要控制內部狀態 → ⏭️ 整個情境跳過
│   例：連續登入失敗 5 次、鎖定期滿後重新登入
├── Given 需要不可能的前置狀態 → ⏭️ 整個情境跳過
│   例：帳號已被鎖定（需要內部狀態控制）
├── API 層已過濾，UI 無法觸發 → ⏭️ 整個情境跳過
│   例：教練編輯他人的球隊（列表中不會出現）
├── 無對應 UI 的 API 操作 → ⏭️ 整個情境跳過
│   例：Refresh Token 換取新 Token
└── 其他情況 → 正常轉換
```

---

## 輸出格式

```markdown
# {功能名稱} — E2E 操作流程

> 頁面：{頁面中文名}（{路由}）

## 元素定義

| 元素 | testid | 說明 |
|------|--------|------|
| ... | ... | ... |

## 共用前置條件

- 「{Background Given}」→ {處理方式}

## 規則：{Rule 名稱}

### 情境：{Example 名稱}

前置條件：
- 「{Given 原文}」
  1. {操作步驟} → #{testid}

操作步驟：
- 「{When 原文}」
  1. {操作步驟} → #{testid}
  2. ...

預期結果：
- 「{Then 原文}」→ {驗證描述}
```

### 跳過情境格式

```markdown
### 情境：{Example 名稱}

⏭️ 整個情境跳過
原因：{為什麼 E2E 測不了}
```

---

## 撰寫規範

### 語法規範

1. **Gherkin 原文**用「」包裹
2. **動詞**只使用固定的 7 個：前往、點擊、輸入、清空並輸入、勾選、取消勾選、等待
3. **`→`** 後面必須是：`#{testid}`、`/path`、`不需操作`、`⏭️ 跳過（原因）` 之一
4. **驗證詞**只使用固定的 8 個：顯示成功提示、顯示錯誤提示、文字可見、文字不可見、包含、不包含、跳轉、⏭️ 跳過
5. **引用共用步驟**格式：`→ （共用步驟，見 _common.flow.md）`
6. **引用同文件步驟**格式：`→ （同上方「{情境名}」的操作步驟）`

### 確認彈窗規範

所有刪除操作的確認彈窗**統一使用 testid**：

```markdown
# ❌ 舊格式（禁止使用）
3. 等待確認彈窗出現 → 畫面出現文字「確定要刪除」
4. 點擊「刪除」確認按鈕 → 點擊彈窗中的確認按鈕

# ✅ 新格式
3. 等待確認彈窗出現 → #confirm-modal
4. 點擊「確認」按鈕 → #confirm-ok
```

### 品質規範

1. 每個操作步驟都必須有 `→` 標記，方便下游解析
2. 不可遺漏等待步驟（彈窗出現、頁面跳轉）
3. 編輯操作必須用「清空並輸入」而非「輸入」
4. 列表內操作必須先「找到 X 那列」再操作

---

## 檢查清單

- [ ] 已讀取 SPEC.md、_common.flow.md
- [ ] 頂部有頁面名稱和路由
- [ ] 元素定義表涵蓋此 feature 涉及的 testid
- [ ] testid 遵循 SPEC.md 命名規則
- [ ] 每個 Given 都有轉換方式（操作/共用引用/不需操作/跳過）
- [ ] 每個 When 都拆解為具體 UI 操作步驟
- [ ] 每個 Then 都有驗證方式或跳過標記
- [ ] 動詞只使用固定的 7 個
- [ ] 驗證詞只使用固定的 8 個
- [ ] 確認彈窗使用 `#confirm-modal` / `#confirm-ok`（不使用文字匹配）
- [ ] 所有 `→` 標記格式正確
- [ ] 引用步驟有標明來源
- [ ] 跳過的情境有說明原因
- [ ] 已詢問用戶確認
