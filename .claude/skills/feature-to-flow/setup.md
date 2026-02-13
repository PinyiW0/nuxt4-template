# Phase 0: 架構建立

## 目標

分析所有 `.feature` 檔案，建立跨 feature 的共用架構：`_common.flow.md`。

---

## 核心原則

### testid 來源

> **testid 在 `.flow.md` 中定義**，不從 Vue 檔案提取。
> Vue 頁面是 testid 的**消費者**，`.flow.md` 是**生產者**（single source of truth）。

因此本階段：
- ✅ 讀取所有 `.feature` 檔案，分析涉及的頁面和共用模式
- ✅ 讀取 `SPEC.md` 的 testid 命名規則
- ❌ **不讀取** Vue 頁面（`app/pages/`）
- ❌ **不提取** 現有 UI 的 testid

---

## 必讀規範

```
僅需讀取：
1. docs/e2e-flows/SPEC.md          — 格式規格
2. docs/gherkin-spec/features/*.feature — 所有 DSL Feature 檔案
```

---

## 執行步驟

### Step 1：讀取所有 Feature

⚠️ **必須讀取全部 .feature 檔案**，才能正確分析共用模式。

### Step 2：分析共用模式

從所有 `.feature` 檔案中提取：

1. **涉及的頁面**：從 When/Then 推導（登入→login、建立球隊→teams、查詢訓練→trainings...）
2. **共用 Background**：跨 feature 重複出現的 Given（如「教練 "coach1" 已登入」）
3. **共用 Then**：跨 feature 重複出現的驗證（如「操作成功」「系統顯示 {string}」）
4. **測試帳號**：從 Background DataTable 提取使用者資料

### Step 3：產出 `_common.flow.md`

```markdown
# 共用 — E2E 操作流程

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

#### 內容規範

- `_common.flow.md` 的共用元素只放**跨所有 feature 共享的元素**（導航列、確認彈窗）
- 各頁面專屬元素放在各自的 `.flow.md` 元素定義表中
- 共用步驟只放**被 2 個以上 feature 引用的操作**
- 上方為範本，實際內容根據分析結果調整

### Step 4：詢問用戶確認

確認格式：

```
Phase 0 完成：架構建立

已產出：
- docs/e2e-flows/_common.flow.md（N 個共用步驟）

涉及的頁面摘要：
| 頁面 | 關聯 Feature |
|------|-------------|
| login | 01, 02 |
| teams | 03, 04, 05, 06 |
| ... | ... |

確認後可執行 Phase 1 轉換個別 feature。
```

---

## 檢查清單

- [ ] 已讀取所有 `.feature` 檔案
- [ ] `_common.flow.md` 已建立（含共用步驟 + testid 命名規則 + 確認彈窗）
- [ ] 各頁面元素定義留待各 `.flow.md` 自行定義
- [ ] testid 遵循 SPEC.md 命名規則
- [ ] 未讀取任何 Vue 頁面檔案
- [ ] 共用步驟只包含被 2 個以上 feature 引用的操作
- [ ] 驗證詞使用 SPEC.md 定義的 8 個固定驗證詞
- [ ] 確認彈窗使用 `#confirm-modal` / `#confirm-ok` testid
- [ ] 已詢問用戶確認
