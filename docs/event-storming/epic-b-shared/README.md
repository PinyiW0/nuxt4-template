# Epic-B 共享 DSL 規格

## 設計原則

這份 DSL 設計為**前後端共用**，遵循以下原則：

### 1. 使用商業語言

- 所有規則使用業務人員能理解的語言
- 技術約束以業務規則形式呈現
- 避免暴露資料庫欄位或技術實作細節

### 2. Rule 作為共同合約

每個 Rule 都是前後端的共同約定：

| Rule 內容 | 前端解讀 | 後端解讀 |
|-----------|----------|----------|
| 背號必須在 0-99 之間 | input `min=0 max=99` | DB CHECK, API 驗證 |
| 球隊名稱不可重複 | 送出前檢查或依賴 API | UNIQUE 約束 |
| 管理者可操作所有球隊 | 權限判斷顯示/隱藏 | API 授權檢查 |
| 刪除操作需記錄操作者與時間 | 顯示刪除者資訊 | 審計欄位 |

### 3. 角色權限明確定義

```gherkin
Rule: 管理者可操作所有球隊
Rule: 教練只能操作自己建立的球隊
```

前端：根據當前用戶角色控制 UI 顯示
後端：API 授權邏輯

### 4. DataTable 代表輸入結構

```gherkin
When 使用者建立球員:
  | 姓名 | 背號 | 身高 | 守備位置 |
  | 王小明 | 1 | 175 | P |
```

- 欄位名稱使用中文（業務語言）
- 不包含系統欄位（id, created_at 等）
- 前端：表單欄位設計依據
- 後端：API Request Body 結構

### 5. 狀態用業務語言表達

```gherkin
# 好的寫法
Given 球隊 "藍鷹隊" 已被刪除
And 回傳結果不包含已刪除的球隊

# 避免的寫法
Given 球隊 "藍鷹隊" 的 is_deleted 為 true
```

### 6. 錯誤訊息為共用規格

```gherkin
Then 系統顯示錯誤 "背號已被使用"
```

- 前端：使用相同錯誤訊息
- 後端：API 回傳相同錯誤訊息

---

## 標籤規範

| 標籤 | 說明 |
|------|------|
| `@epic-b` | Epic 分類 |
| `@team` / `@player` | 實體分類 |
| `@query` | 查詢操作（無狀態變更） |
| `@command` | 命令操作（有狀態變更） |
| `@happy-path` | 正常流程 |
| `@validation` | 驗證規則 |
| `@permission` | 權限規則 |
| `@error-handling` | 錯誤處理 |
| `@boundary` | 邊界條件 |

---

## 檔案列表

| 檔案 | 功能 | 類型 |
|------|------|------|
| us-b1-query-team.shared.feature | 查詢球隊列表 | Query |
| us-b2-create-team.shared.feature | 建立球隊 | Command |
| us-b2-update-team.shared.feature | 編輯球隊 | Command |
| us-b2-delete-team.shared.feature | 刪除球隊 | Command |
| us-b3-query-player.shared.feature | 查詢球員列表 | Query |
| us-b3-create-player.shared.feature | 新增球員 | Command |
| us-b3-update-player.shared.feature | 編輯球員 | Command |
| us-b3-delete-player.shared.feature | 刪除球員 | Command |
| us-b4-reorder-player.shared.feature | 調整球員順序 | Command |
