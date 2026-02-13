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

### 登入頁

| 元素 | testid | 說明 |
|------|--------|------|
| 帳號欄位 | login-account | 帳號輸入框 |
| 密碼欄位 | login-password | 密碼輸入框 |
| 登入按鈕 | login-submit | 登入送出按鈕 |

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
- 「使用者 "{account}" 尚未登入」→ 不需操作（預設未登入）
- 「{entity} "{name}" 已存在」→ 不需操作（mock 資料已預設）
- 「球員 "{name}" 有 N 筆訓練紀錄」→ 不需操作（mock 資料已預設）
- 「使用者 "{account}" 不存在」→ 不需操作（mock 資料已預設）
- 「AI 系統狀態為 "{status}"」→ 不需操作（mock 資料已預設）
- 「AI 系統關聯訓練 "{id}"」→ 不需操作（mock 資料已預設）
- 「訓練 "{id}" 的好球帶設定」→ 不需操作（mock 資料已預設）

### 通用 Then

- 「操作成功」→ 顯示成功提示
- 「操作失敗」→ 顯示錯誤提示
- 「系統顯示 "{message}"」→ 文字「{message}」可見
- 「系統產生 "{event}" 事件」→ ⏭️ 跳過（內部事件）
- 「系統回傳 Access Token」→ ⏭️ 跳過（畫面上看不到 token）
- 「系統回傳新的 Access Token」→ ⏭️ 跳過（畫面上看不到 token）
- 「系統回傳 Refresh Token」→ ⏭️ 跳過（畫面上看不到 token）
- 「登入失敗次數重置為 0」→ ⏭️ 跳過（內部狀態）
- 「帳號被鎖定 N 分鐘」→ ⏭️ 跳過（內部狀態）
- 「前端清除 Access Token」→ ⏭️ 跳過（內部狀態）
- 「前端清除 Refresh Token」→ ⏭️ 跳過（內部狀態）
- 「無任何狀態變更」→ ⏭️ 跳過（內部狀態）
- 「{entity} "{name}" 的狀態為 "{status}"」→ ⏭️ 跳過（內部狀態）
- 「{entity} "{name}" 的訓練紀錄保留不變」→ ⏭️ 跳過（內部狀態）
- 「不產生新的 "{event}" 事件」→ ⏭️ 跳過（內部事件）
- 「未完成的投球數據被丟棄」→ ⏭️ 跳過（內部狀態）

## 測試帳號

| 帳號 | 角色 | 密碼 |
|------|------|------|
| admin | 管理者 | pass123 |
| coach1 | 教練 | pass123 |
| coach2 | 教練 | pass123 |

## 頁面路由對照表

| 頁面 | 路由 | 關聯 Feature |
|------|------|-------------|
| 登入頁 | `/login` | 01, 02 |
| 首頁 | `/` | 01 |
| 球隊管理 | `/teams` | 03, 04, 05, 06 |
| 球員管理 | `/players` | 07, 08, 09, 10, 11 |
| 訓練管理 | `/trainings` | 12, 13, 14 |
| 訓練詳情 | `/trainings/{id}` | 15, 16, 17, 18, 20 |
| 單球儀表板 | `/trainings/{id}/pitches/{pitchId}` | 19 |
