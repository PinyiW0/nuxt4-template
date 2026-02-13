# E2E Flow 格式規格

## 概要

`.flow.md` 是 E2E 測試的 **single source of truth**，定義：
- testid 命名
- UI 操作步驟
- 驗證方式

翻譯鏈：`.feature` → `.flow.md` → `.spec.ts`

---

## 檔案結構

```
docs/e2e-flows/
├── SPEC.md                    ← 本文件（格式規格）
├── _common.flow.md            ← 跨 feature 共用步驟
└── {NN}-{name}.flow.md        ← 各 feature 操作流程
```

> **不再使用 `pages/*.elements.md`**。所有 testid 定義直接寫在各 `.flow.md` 的元素定義表中。

---

## testid 命名規則

| 類型 | 規則 | 範例 |
|------|------|------|
| 頁面容器 | `{page}-page` | `login-page`, `teams-page` |
| 列表 / 表格 | `{entity}-list` | `team-list`, `player-list` |
| 列表行 | `{entity}-row` | `history-row` |
| 新增按鈕 | `{entity}-create` | `team-create` |
| 編輯按鈕 | `{entity}-edit` | `team-edit` |
| 刪除按鈕 | `{entity}-delete` | `team-delete` |
| 表單彈窗 | `{entity}-form-modal` | `team-form-modal` |
| 表單欄位 | `{entity}-{field}` | `team-name`, `login-account` |
| 儲存 / 送出按鈕 | `{entity}-save` 或 `{entity}-submit` | `team-save` |
| 批次刪除按鈕 | `batch-delete-btn` | `batch-delete-btn` |
| 確認彈窗 | `confirm-modal` | `confirm-modal` |
| 確認按鈕 | `confirm-ok` | `confirm-ok` |

---

## 操作動詞（固定 7 個）

| 動詞 | 用途 | 範例 |
|------|------|------|
| 前往 | 導航到頁面 | `前往球隊管理頁 → /teams` |
| 點擊 | 按鈕、連結 | `點擊「新增球隊」按鈕 → #team-create` |
| 輸入 | 填入欄位（空欄位） | `輸入 coach1 → #login-account` |
| 清空並輸入 | 填入欄位（已有值） | `清空並輸入 新名稱 → #team-name` |
| 勾選 | Checkbox | `勾選「T001」那列的 checkbox → #history-row` |
| 取消勾選 | Checkbox | `取消勾選「T001」那列的 checkbox` |
| 等待 | 非同步操作完成 | `等待彈窗出現 → #team-form-modal` |

---

## 驗證詞（固定 8 個）

| 驗證詞 | 用途 | Flow 語法 |
|--------|------|-----------|
| 顯示成功提示 | Toast 成功訊息 | `→ 顯示成功提示「球隊已新增」` |
| 顯示錯誤提示 | Toast 錯誤訊息 | `→ 顯示錯誤提示「帳號或密碼錯誤」` |
| 文字可見 | 文字存在 | `→ 文字「歡迎回來」可見` |
| 文字不可見 | 文字不存在 | `→ 文字「紅龍隊」不可見` |
| 包含 | 元素含文字 | `→ #team-list 包含「紅龍隊」` |
| 不包含 | 元素不含文字 | `→ #team-list 不包含「紅龍隊」` |
| 跳轉 | URL 變化 | `→ 跳轉到 /teams` |
| ⏭️ 跳過 | 不可 E2E 驗證 | `→ ⏭️ 跳過（內部事件）` |

### 複合驗證語法

| 複合語法 | 用途 |
|----------|------|
| `→ #id 中「{rowText}」那列包含「{text}」` | 行內驗證 |
| `→ 前往 {path}，#id 包含「{text}」` | 跨頁驗證 |
| `→ 前往 {path}，#id 不包含「{text}」` | 跨頁驗證 |
| `→ 前往 {path}，文字「{text}」可見` | 跨頁驗證 |

---

## .flow.md 範例

```markdown
# 建立球隊 — E2E 操作流程

> 頁面：球隊管理（/teams）

## 元素定義

| 元素 | testid | 說明 |
|------|--------|------|
| 球隊頁面 | teams-page | 頁面容器 |
| 新增球隊按鈕 | team-create | 開啟新增彈窗 |
| 球隊列表 | team-list | 球隊表格 |
| 表單彈窗 | team-form-modal | 新增/編輯共用彈窗 |
| 球隊名稱欄位 | team-name | 名稱輸入框 |
| 儲存按鈕 | team-save | 彈窗送出按鈕 |

## 共用前置條件

- 「系統中有以下球隊：」→ 不需操作（mock 資料已預設）
- 「教練 "coach1" 已登入」→ （共用步驟，見 _common.flow.md）

## 規則：建立球隊只需提供名稱

### 情境：成功建立球隊

前置條件：
- 「教練 "coach1" 已登入」→ （共用步驟，見 _common.flow.md）

操作步驟：
- 「教練建立球隊名稱為 "紅龍隊"」
  1. 前往球隊管理頁 → /teams
  2. 點擊「新增球隊」按鈕 → #team-create
  3. 等待彈窗出現 → #team-form-modal
  4. 在「球隊名稱」欄位輸入 紅龍隊 → #team-name
  5. 點擊「建立」按鈕 → #team-save

預期結果：
- 「操作成功」→ 顯示成功提示「球隊已新增」
- 「系統產生 '球隊已建立' 事件」→ ⏭️ 跳過（內部事件）
- 「球隊 "紅龍隊" 的建立者為 "coach1"」→ #team-list 中「紅龍隊」那列包含「coach1」

### 情境：球隊名稱不可為空

⏭️ 整個情境跳過
原因：需要控制表單驗證狀態，E2E 層級由單元測試覆蓋
```

---

## _common.flow.md 結構

```markdown
# 共用 — E2E 操作流程

## testid 命名規則

（同 SPEC.md 的 testid 命名規則表）

## 共用元素定義

### 導航列

| 元素 | testid | 說明 |
|------|--------|------|
| 使用者選單 | user-menu | 右上角使用者選單 |
| 登出按鈕 | logout-button | 登出按鈕 |
| 歡迎訊息 | welcome-message | 歡迎文字 |

### 確認彈窗

| 元素 | testid | 說明 |
|------|--------|------|
| 確認彈窗 | confirm-modal | 刪除確認彈窗 |
| 確認按鈕 | confirm-ok | 彈窗確認按鈕 |

## 共用步驟定義

### 登入操作

- 「{role} "{account}" 已登入」
  1. 前往登入頁 → /login
  2. 在「帳號」欄位輸入 {account} → #login-account
  3. 在「密碼」欄位輸入 pass123 → #login-password
  4. 點擊「登入」按鈕 → #login-submit
  5. 等待跳轉到首頁 → /

### 登出操作

- 「使用者登出」
  1. 點擊使用者選單 → #user-menu
  2. 點擊「登出」按鈕 → #logout-button
  3. 等待跳轉到登入頁 → /login

### 確認彈窗操作

- 「確認刪除」
  1. 等待確認彈窗出現 → #confirm-modal
  2. 點擊「確認」按鈕 → #confirm-ok

### 通用 Given

- 「系統中有以下{任意}」→ 不需操作（mock 資料已預設）

### 通用 Then

- 「操作成功」→ 顯示成功提示
- 「操作失敗」→ 顯示錯誤提示
- 「系統顯示 "{message}"」→ 文字「{message}」可見
- 「系統產生 "{event}" 事件」→ ⏭️ 跳過（內部事件）
```

---

## 語法規範

1. **Gherkin 原文**用「」包裹
2. **動詞**只使用固定的 7 個
3. **`→`** 後面必須是：`#{testid}`、`/path`、`不需操作`、`⏭️ 跳過（原因）` 之一
4. **驗證詞**只使用固定的 8 個
5. **引用共用步驟**格式：`→ （共用步驟，見 _common.flow.md）`
6. **引用同文件步驟**格式：`→ （同上方「{情境名}」的操作步驟）`

---

## 確認彈窗規範

所有刪除操作的確認彈窗**統一使用 testid**，不使用文字匹配：

```markdown
# ❌ 舊格式
3. 等待確認彈窗出現 → 畫面出現文字「確定要刪除」
4. 點擊「刪除」確認按鈕 → 點擊彈窗中的確認按鈕

# ✅ 新格式
3. 等待確認彈窗出現 → #confirm-modal
4. 點擊「確認」按鈕 → #confirm-ok
```

---

## 品質規範

1. 每個操作步驟都必須有 `→` 標記
2. 不可遺漏等待步驟（彈窗出現、頁面跳轉）
3. 編輯操作必須用「清空並輸入」而非「輸入」
4. 列表內操作必須先「找到 X 那列」再操作
