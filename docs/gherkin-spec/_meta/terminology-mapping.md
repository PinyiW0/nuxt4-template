# 詞彙對應表

> 自動產生於 Event Storming Stage 7
> 最後更新：2026-01-27
> 來源：PRD Event Storming 分析

---

## Entity 對照表

| Entity (EN) | 中文名稱 | 資料表 | 主鍵欄位 | 說明 |
|-------------|----------|--------|----------|------|
| User | 使用者 | users | user_id | 系統的使用者，包含管理者與教練 |
| Team | 球隊 | teams | team_id | 棒球隊伍，包含多個球員 |
| Player | 球員 | players | player_id | 球隊中的選手 |
| Training | 訓練 | trainings | training_id | 一次訓練紀錄 |
| Pitch | 投球 | pitches | pitch_id | 單次投球紀錄，由 AI 系統自動捕捉 |
| StrikeZone | 好球帶 | strike_zones | strike_zone_id | 打者的好球帶範圍設定 |
| AISystem | AI 系統 | - | - | AI 影像辨識偵測系統 |

---

## 欄位對照表

### User 使用者

| 欄位 (camelCase) | 中文名稱 | 類型 | 說明 |
|------------------|----------|------|------|
| id | 使用者ID | uuid | 主鍵 |
| account | 帳號 | string | 登入用帳號 |
| password | 密碼 | string | 加密後的密碼 |
| role | 角色 | enum | admin/coach |
| name | 姓名 | string | 使用者姓名 |

### Team 球隊

| 欄位 (camelCase) | 中文名稱 | 類型 | 說明 |
|------------------|----------|------|------|
| id | 球隊ID | uuid | 主鍵 |
| name | 球隊名稱 | string | 2-50 字元，不區分大小寫唯一 |
| status | 狀態 | enum | ACTIVE/DELETED |
| createdBy | 建立者 | uuid | FK → User |
| createdAt | 建立時間 | timestamp | - |
| deletedBy | 刪除者 | uuid | FK → User |
| deletedAt | 刪除時間 | timestamp | 軟刪除時間 |

### Player 球員

| 欄位 (camelCase) | 中文名稱 | 類型 | 說明 |
|------------------|----------|------|------|
| id | 球員ID | uuid | 主鍵 |
| teamId | 所屬球隊ID | uuid | FK → Team |
| name | 姓名 | string | 球員姓名 |
| jerseyNumber | 背號 | integer | 0-99，同球隊內唯一 |
| height | 身高 | integer | 公分（選填） |
| position | 守備位置 | enum | P/C/1B/2B/3B/SS/LF/CF/RF |
| sortOrder | 排序 | integer | 球員列表排序 |
| status | 狀態 | enum | ACTIVE/DELETED |

### Training 訓練

| 欄位 (camelCase) | 中文名稱 | 類型 | 說明 |
|------------------|----------|------|------|
| id | 訓練ID | uuid | 主鍵 |
| teamId | 球隊ID | uuid | FK → Team |
| playerId | 受測球員ID | uuid | FK → Player |
| date | 訓練日期 | date | - |
| strikeZoneHeight | 好球帶身高 | integer | 受測球員的身高基準 |
| status | 狀態 | enum | ACTIVE/DELETED |
| createdBy | 建立者 | uuid | FK → User |
| createdAt | 建立時間 | timestamp | - |

### Pitch 投球

| 欄位 (camelCase) | 中文名稱 | 類型 | 說明 |
|------------------|----------|------|------|
| id | 投球ID | uuid | 主鍵 |
| trainingId | 訓練ID | uuid | FK → Training |
| speed | 球速 | decimal | 公里/小時 |
| spinRate | 轉速 | integer | 轉/分鐘 |
| location | 落點 | json | {x, y} 座標 |
| result | 結果 | enum | strike/ball |
| timestamp | 時間戳記 | timestamp | 投球時間 |

### StrikeZone 好球帶

| 欄位 (camelCase) | 中文名稱 | 類型 | 說明 |
|------------------|----------|------|------|
| id | 好球帶ID | uuid | 主鍵 |
| trainingId | 訓練ID | uuid | FK → Training |
| topHeight | 上緣高度 | decimal | 公分 |
| bottomHeight | 下緣高度 | decimal | 公分 |
| width | 寬度 | decimal | 公分 |

---

## Action 對照表

| Action (EN) | 中文動詞 | DSL Step Pattern | 範例 |
|-------------|----------|------------------|------|
| login | 登入 | {Actor} 登入系統 | 使用者 登入系統 |
| logout | 登出 | {Actor} 登出系統 | 使用者 登出系統 |
| queryTeamList | 查詢球隊列表 | {Actor} 查詢球隊列表 | 教練 查詢球隊列表 |
| selectTeam | 選擇球隊 | {Actor} 選擇球隊 "{name}" | 教練 選擇球隊 "閃電隊" |
| createTeam | 建立球隊 | {Actor} 建立球隊 "{name}" | 教練 建立球隊 "閃電隊" |
| updateTeam | 編輯球隊 | {Actor} 編輯球隊 "{name}" | 教練 編輯球隊 "閃電隊" |
| deleteTeam | 刪除球隊 | {Actor} 刪除球隊 "{name}" | 教練 刪除球隊 "閃電隊" |
| queryPlayerList | 查詢球員列表 | {Actor} 查詢球隊 "{team}" 的球員列表 | 教練 查詢球隊 "閃電隊" 的球員列表 |
| createPlayer | 新增球員 | {Actor} 新增球員到球隊 "{team}"，姓名 "{name}"，背號 {no} | 教練 新增球員到球隊 "閃電隊"，姓名 "王小明"，背號 1 |
| updatePlayer | 編輯球員 | {Actor} 編輯球員 "{name}" | 教練 編輯球員 "王小明" |
| deletePlayer | 刪除球員 | {Actor} 刪除球員 "{name}" | 教練 刪除球員 "王小明" |
| reorderPlayer | 調整球員排序 | {Actor} 調整球隊 "{team}" 的球員排序 | 教練 調整球隊 "閃電隊" 的球員排序 |
| createTraining | 建立訓練 | {Actor} 建立訓練 | 教練 建立訓練 |
| deleteTraining | 刪除訓練 | {Actor} 刪除訓練 | 教練 刪除訓練 |
| startAISystem | 啟動 AI 系統 | {Actor} 啟動 AI 系統 | 教練 啟動 AI 系統 |
| stopAISystem | 關閉 AI 系統 | {Actor} 關閉 AI 系統 | 教練 關閉 AI 系統 |
| queryPitchList | 查詢投球清單 | {Actor} 查詢投球清單 | 教練 查詢投球清單 |
| updateStrikeZone | 調整好球帶 | {Actor} 調整好球帶 | 教練 調整好球帶 |

---

## Role 對照表

| Role (EN) | 中文名稱 | 權限範圍 |
|-----------|----------|----------|
| admin | 系統管理者 | 可操作所有資源，包含他人建立的球隊/球員 |
| coach | 教練 | 只能操作自己建立的球隊/球員/訓練 |

---

## Status 對照表

| Status (EN) | 中文名稱 | 適用 Entity | 說明 |
|-------------|----------|-------------|------|
| ACTIVE | 啟用 | Team, Player, Training | 正常啟用狀態 |
| DELETED | 已刪除 | Team, Player, Training | 軟刪除狀態，保留資料 |
| RUNNING | 運行中 | AISystem | AI 系統正在運行 |
| STOPPED | 已停止 | AISystem | AI 系統已停止 |

---

## ErrorCode 對照表

| ErrorCode | 中文訊息 | HTTP Status | 適用場景 |
|-----------|----------|-------------|----------|
| AUTH_INVALID_CREDENTIALS | 帳號或密碼錯誤 | 401 | 登入驗證失敗 |
| AUTH_TOKEN_EXPIRED | 登入已過期，請重新登入 | 401 | Token 過期 |
| TEAM_NOT_FOUND | 找不到指定的球隊 | 404 | 查詢/編輯/刪除球隊 |
| TEAM_NAME_DUPLICATE | 球隊名稱已被使用 | 409 | 建立/編輯球隊 |
| TEAM_ALREADY_DELETED | 球隊不存在或已刪除 | 404 | 操作已刪除的球隊 |
| TEAM_HAS_PLAYERS | 球隊尚有球員，無法刪除 | 400 | 刪除球隊（未採用級聯） |
| TEAM_PERMISSION_DENIED | 無權限操作此球隊 | 403 | 教練操作他人球隊 |
| PLAYER_NOT_FOUND | 找不到指定的球員 | 404 | 查詢/編輯/刪除球員 |
| PLAYER_JERSEY_DUPLICATE | 背號已被使用 | 409 | 建立/編輯球員 |
| PLAYER_JERSEY_OUT_OF_RANGE | 背號必須在 0-99 之間 | 400 | 建立/編輯球員 |
| PLAYER_SORT_REQUIRED | 必須指定排序 | 400 | 建立球員 |
| TRAINING_NOT_FOUND | 找不到指定的訓練 | 404 | 查詢/刪除訓練 |
| TRAINING_ALREADY_DELETED | 訓練不存在或已刪除 | 404 | 操作已刪除的訓練 |
| AI_SYSTEM_ALREADY_RUNNING | AI 系統已在運行中 | 400 | 重複啟動 AI 系統 |
| AI_SYSTEM_NOT_RUNNING | AI 系統尚未啟動 | 400 | 關閉未運行的 AI 系統 |
| PERMISSION_DENIED | 無權限執行此操作 | 403 | 通用權限錯誤 |
| FIELD_REQUIRED | {field}不可為空 | 400 | 必填欄位驗證 |

---

## 守備位置 (Positions)

| 代碼 | 英文 | 中文 |
|------|------|------|
| P | Pitcher | 投手 |
| C | Catcher | 捕手 |
| 1B | First Baseman | 一壘手 |
| 2B | Second Baseman | 二壘手 |
| 3B | Third Baseman | 三壘手 |
| SS | Shortstop | 游擊手 |
| LF | Left Fielder | 左外野手 |
| CF | Center Fielder | 中外野手 |
| RF | Right Fielder | 右外野手 |

---

## 邊界決策摘要

### 全域決策 (Global Decisions)

| 決策 ID | 問題 | 決策 | 影響範圍 |
|---------|------|------|----------|
| GD-001 | 球員背號唯一性範圍 | 同一球隊內唯一 | create-player, update-player |
| GD-002 | 刪除球隊時球員處理 | 級聯刪除 | delete-team |
| GD-003 | 刪除策略 | 軟刪除 | delete-team, delete-player, delete-training |
| GD-004 | 球隊名稱大小寫 | 不區分大小寫 | create-team, update-team |

### Epic 層級決策

| Epic | 決策 ID | 問題 | 決策 |
|------|---------|------|------|
| B | BD-B001 | 背號範圍限制 | 0-99 |
| B | BD-B002 | 新球員預設排序 | 排在最後 |
| C | BD-C001 | 訓練刪除策略 | 軟刪除 |

---

## 測試資料命名慣例

### Entity 測試資料

| Entity | 主要測試資料 | 次要測試資料 |
|--------|--------------|--------------|
| Team | 閃電隊 | 勇士隊、雷霆隊 |
| Player | 王小明（背號 1） | 李小華（背號 2）、張大華 |
| Training | - | - |

### 命名規則

| 資料類型 | 命名規則 | 範例 |
|----------|----------|------|
| Team | {形容詞}隊 | 閃電隊、勇士隊 |
| Player | {姓}{名} | 王小明、李小華 |
| 邊界測試 | 描述性前綴 | 超長名稱球員、空白隊名 |
| 錯誤測試 | 明確的狀態描述 | 不存在的球隊、已刪除的球員 |

---

## Event 對照表

### Epic A: 登入/登出

| Event ID | Event Name (EN) | 中文名稱 | Aggregate |
|----------|-----------------|----------|-----------|
| EVT-A001 | UserLoggedIn | 使用者已登入 | User |
| EVT-A002 | UserLoggedOut | 使用者已登出 | User |

### Epic B: 球隊/球員管理

| Event ID | Event Name (EN) | 中文名稱 | Aggregate |
|----------|-----------------|----------|-----------|
| EVT-B001 | TeamListQueried | 球隊列表已查詢 | Team |
| EVT-B002 | TeamSelected | 球隊已選擇 | Team |
| EVT-B003 | TeamCreated | 球隊已建立 | Team |
| EVT-B004 | TeamUpdated | 球隊已更新 | Team |
| EVT-B005 | TeamDeleted | 球隊已刪除 | Team |
| EVT-B006 | PlayerListQueried | 球員列表已查詢 | Player |
| EVT-B007 | PlayerCreated | 球員已建立 | Player |
| EVT-B008 | PlayerUpdated | 球員已更新 | Player |
| EVT-B009 | PlayerDeleted | 球員已刪除 | Player |
| EVT-B010 | PlayerCascadeDeleted | 球員已級聯刪除 | Player |
| EVT-B011 | PlayerReordered | 球員排序已調整 | Player |

### Epic C: 訓練建立與 AI 系統

| Event ID | Event Name (EN) | 中文名稱 | Aggregate |
|----------|-----------------|----------|-----------|
| EVT-C001 | TrainingListQueried | 訓練列表已查詢 | Training |
| EVT-C002 | TrainingCreated | 訓練已建立 | Training |
| EVT-C003 | TrainingDeleted | 訓練已刪除 | Training |
| EVT-C004 | AISystemStarted | AI系統已啟動 | AISystem |
| EVT-C005 | AISystemStopped | AI系統已關閉 | AISystem |

### Epic D: 訓練紀錄頁

| Event ID | Event Name (EN) | 中文名稱 | Aggregate |
|----------|-----------------|----------|-----------|
| EVT-D001 | TrainingRecordModeEntered | 已進入訓練紀錄模式 | Training |
| EVT-D002 | TrainingRecordModeExited | 已退出訓練紀錄模式 | Training |
| EVT-D003 | PitchListQueried | 投球清單已查詢 | Pitch |
| EVT-D004 | PitchDashboardDisplayed | 單球儀表板已顯示 | Pitch |
| EVT-D005 | StrikeZoneUpdated | 好球帶已更新 | StrikeZone |

### Epic E: 影像數據分析

| Event ID | Event Name (EN) | 中文名稱 | Aggregate |
|----------|-----------------|----------|-----------|
| EVT-E001 | AnalysisTabSwitched | 分析頁籤已切換 | UI |
| EVT-E002 | HistoricalTrainingListQueried | 歷史訓練列表已查詢 | Training |
| EVT-E003 | TrainingsBatchDeleted | 訓練已批次刪除 | Training |
| EVT-E004 | StrikeZoneRecordDisplayed | 好球帶記錄已顯示 | StrikeZone |

### Epic F: 選手分析

| Event ID | Event Name (EN) | 中文名稱 | Aggregate |
|----------|-----------------|----------|-----------|
| EVT-F001 | PlayerRecordListQueried | 選手紀錄列表已查詢 | Player |
| EVT-F002 | PlayerRecordsBatchDeleted | 選手紀錄已批次刪除 | Player |
| EVT-F003 | PlayerStatsDisplayed | 選手統計已顯示 | Player |

---

## Command 對照表

### Epic A: 登入/登出

| Command ID | Command Name (EN) | 中文名稱 | Aggregate | Publishes |
|------------|-------------------|----------|-----------|-----------|
| CMD-A001 | Login | 登入 | User | EVT-A001 |
| CMD-A002 | Logout | 登出 | User | EVT-A002 |

### Epic B: 球隊/球員管理

| Command ID | Command Name (EN) | 中文名稱 | Aggregate | Publishes |
|------------|-------------------|----------|-----------|-----------|
| QRY-B001 | QueryTeamList | 查詢球隊列表 | Team | EVT-B001 |
| CMD-B001 | SelectTeam | 選擇球隊 | Team | EVT-B002 |
| CMD-B002 | CreateTeam | 建立球隊 | Team | EVT-B003 |
| CMD-B003 | UpdateTeam | 編輯球隊 | Team | EVT-B004 |
| CMD-B004 | DeleteTeam | 刪除球隊 | Team | EVT-B005, EVT-B010 |
| QRY-B002 | QueryPlayerList | 查詢球員列表 | Player | EVT-B006 |
| CMD-B005 | CreatePlayer | 新增球員 | Player | EVT-B007 |
| CMD-B006 | UpdatePlayer | 編輯球員 | Player | EVT-B008 |
| CMD-B007 | DeletePlayer | 刪除球員 | Player | EVT-B009 |
| CMD-B008 | ReorderPlayer | 調整球員排序 | Player | EVT-B011 |

### Epic C: 訓練建立與 AI 系統

| Command ID | Command Name (EN) | 中文名稱 | Aggregate | Publishes |
|------------|-------------------|----------|-----------|-----------|
| QRY-C001 | QueryTrainingList | 查詢訓練列表 | Training | EVT-C001 |
| CMD-C001 | CreateTraining | 建立訓練 | Training | EVT-C002 |
| CMD-C002 | DeleteTraining | 刪除訓練 | Training | EVT-C003 |
| CMD-C003 | StartAISystem | 啟動 AI 系統 | AISystem | EVT-C004 |
| CMD-C004 | StopAISystem | 關閉 AI 系統 | AISystem | EVT-C005 |

### Epic D: 訓練紀錄頁

| Command ID | Command Name (EN) | 中文名稱 | Aggregate | Publishes |
|------------|-------------------|----------|-----------|-----------|
| CMD-D001 | EnterTrainingRecordMode | 進入訓練紀錄模式 | Training | EVT-D001 |
| CMD-D002 | ExitTrainingRecordMode | 退出訓練紀錄模式 | Training | EVT-D002 |
| QRY-D001 | QueryPitchList | 查詢投球清單 | Pitch | EVT-D003 |
| QRY-D002 | QueryPitchDashboard | 查詢單球儀表板 | Pitch | EVT-D004 |
| CMD-D003 | UpdateStrikeZone | 調整好球帶 | StrikeZone | EVT-D005 |

### Epic E: 影像數據分析

| Command ID | Command Name (EN) | 中文名稱 | Aggregate | Publishes |
|------------|-------------------|----------|-----------|-----------|
| CMD-E001 | SwitchAnalysisTab | 切換分析頁籤 | UI | EVT-E001 |
| QRY-E001 | QueryHistoricalTrainings | 查詢歷史訓練 | Training | EVT-E002 |
| CMD-E002 | BatchDeleteTrainings | 批次刪除訓練 | Training | EVT-E003 |
| QRY-E002 | ViewStrikeZoneRecord | 查看好球帶記錄 | StrikeZone | EVT-E004 |

### Epic F: 選手分析

| Command ID | Command Name (EN) | 中文名稱 | Aggregate | Publishes |
|------------|-------------------|----------|-----------|-----------|
| QRY-F001 | QueryPlayerRecords | 查詢選手紀錄 | Player | EVT-F001 |
| CMD-F001 | BatchDeletePlayerRecords | 批次刪除選手紀錄 | Player | EVT-F002 |
| QRY-F002 | ViewPlayerStats | 查看選手統計 | Player | EVT-F003 |
