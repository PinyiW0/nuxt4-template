# 詞彙對應表

> 自動產生於 Event Storming Stage 7
> 最後更新：2026-01-23T10:00:00Z
> 來源：docs/user-stories/user-v1.md

---

## Entity 對照表

| Entity (EN) | 中文名稱 | 資料表 | 主鍵欄位 |
|-------------|----------|--------|----------|
| User | 使用者 | users | user_id |
| Team | 球隊 | teams | team_id |
| Player | 球員 | players | player_id |
| Training | 訓練 | trainings | training_id |
| Pitch | 投球 | pitches | pitch_id |
| StrikeZone | 好球帶 | - | - |
| PlayerStats | 選手統計 | player_stats | stats_id |
| AISystem | AI系統 | - | - |

---

## 欄位對照表

### User 使用者

| 欄位 (camelCase) | 中文名稱 | 類型 | 說明 |
|------------------|----------|------|------|
| userId | 使用者ID | uuid | 主鍵 |
| username | 帳號 | string | - |
| name | 姓名 | string | - |
| role | 角色 | enum | ADMIN, COACH |
| status | 狀態 | enum | ACTIVE, INACTIVE |

### Team 球隊

| 欄位 (camelCase) | 中文名稱 | 類型 | 說明 |
|------------------|----------|------|------|
| teamId | 球隊ID | uuid | 主鍵 |
| teamName | 球隊名稱 | string | 不區分大小寫 |
| status | 狀態 | enum | ACTIVE, DELETED |

### Player 球員

| 欄位 (camelCase) | 中文名稱 | 類型 | 說明 |
|------------------|----------|------|------|
| playerId | 球員ID | uuid | 主鍵 |
| teamId | 所屬球隊ID | uuid | FK → Team |
| jerseyNumber | 背號 | integer | 0-99，同一球隊內唯一 |
| name | 姓名 | string | - |
| height | 身高 | integer | 單位：cm |
| position | 守備位置 | enum | P, C, 1B, 2B, 3B, SS, LF, CF, RF |
| sortOrder | 排序 | integer | - |
| status | 狀態 | enum | ACTIVE, DELETED |

### Training 訓練

| 欄位 (camelCase) | 中文名稱 | 類型 | 說明 |
|------------------|----------|------|------|
| trainingId | 訓練ID | uuid | 主鍵 |
| teamId | 球隊ID | uuid | FK → Team |
| playerId | 受測球員ID | uuid | FK → Player |
| trainingDate | 訓練日期 | date | - |
| strikeZoneTop | 好球帶上緣 | decimal | - |
| strikeZoneBottom | 好球帶下緣 | decimal | - |
| status | 狀態 | enum | ACTIVE, DELETED |

### Pitch 投球

| 欄位 (camelCase) | 中文名稱 | 類型 | 說明 |
|------------------|----------|------|------|
| pitchId | 投球ID | uuid | 主鍵 |
| trainingId | 訓練ID | uuid | FK → Training |
| speed | 球速 | decimal | 單位：km/h |
| spinRate | 轉速 | integer | 單位：rpm |
| isStrike | 是否好球 | boolean | - |
| positionX | 落點X座標 | decimal | - |
| positionY | 落點Y座標 | decimal | - |
| trajectory | 3D軌跡資料 | json | - |
| createdAt | 建立時間 | timestamp | - |

### StrikeZone 好球帶

| 欄位 (camelCase) | 中文名稱 | 類型 | 說明 |
|------------------|----------|------|------|
| top | 上緣高度 | decimal | 依球員身高動態計算 |
| bottom | 下緣高度 | decimal | 依球員身高動態計算 |

### PlayerStats 選手統計

| 欄位 (camelCase) | 中文名稱 | 類型 | 說明 |
|------------------|----------|------|------|
| statsId | 統計ID | uuid | 主鍵 |
| playerId | 球員ID | uuid | FK → Player |
| month | 月份 | string | 格式：YYYY-MM |
| avgSpeed | 平均球速 | decimal | - |
| avgSpinRate | 平均轉速 | integer | - |
| strikeRate | 好球率 | decimal | - |
| totalPitches | 總投球數 | integer | - |

---

## Action 對照表

| Action (EN) | 中文動詞 | DSL Step Pattern | 範例 |
|-------------|----------|------------------|------|
| login | 登入 | {Actor} 登入系統 | 使用者 登入系統 |
| logout | 登出 | {Actor} 登出系統 | 使用者 登出系統 |
| query | 查詢 | {Actor} 查詢{Entity}列表 | 教練 查詢球隊列表 |
| get | 取得 | {Actor} 取得{Entity} | 教練 取得球隊 "閃電隊" |
| create | 建立 | {Actor} 建立{Entity} "{name}" | 教練 建立球隊 "閃電隊" |
| update | 編輯 | {Actor} 編輯{Entity} "{name}" | 教練 編輯球隊 "閃電隊" |
| delete | 刪除 | {Actor} 刪除{Entity} "{name}" | 教練 刪除球隊 "閃電隊" |
| batchDelete | 批次刪除 | {Actor} 批次刪除{Entity} | 分析使用者 批次刪除訓練 |
| select | 選擇 | {Actor} 選擇{Entity} "{name}" | 教練 選擇球隊 "閃電隊" |
| reorder | 調整排序 | {Actor} 調整{Entity}排序 | 教練 調整球員排序 |
| start | 啟動 | {Actor} 啟動{Entity} | 教練 啟動 AI 系統 |
| stop | 關閉 | {Actor} 關閉{Entity} | 教練 關閉 AI 系統 |
| enter | 進入 | {Actor} 進入{Entity} | 教練 進入訓練紀錄頁 |
| exit | 退出 | {Actor} 退出{Entity} | 教練 退出訓練紀錄頁 |
| switch | 切換 | {Actor} 切換到{target} | 教練 切換到 3D 軌跡 |
| adjust | 調整 | {Actor} 調整{Entity}參數 | 教練 調整好球帶參數 |
| play | 播放 | {Actor} 播放{Entity} | 場邊操作人員 播放直播 |
| pause | 暫停 | {Actor} 暫停{Entity} | 場邊操作人員 暫停直播 |

---

## Role 對照表

| Role (EN) | 中文名稱 | 權限範圍 |
|-----------|----------|----------|
| ADMIN | 系統管理者 | 全部 |
| COACH | 教練 | team:*, player:*, training:* |
| ANALYST | 分析使用者 | analysis:* |
| OPERATOR | 場邊操作人員 | video:*, ai:control |

---

## Status 對照表

| Status (EN) | 中文名稱 | 適用 Entity |
|-------------|----------|-------------|
| ACTIVE | 啟用 | User, Team, Player, Training |
| INACTIVE | 停用 | User |
| DELETED | 已刪除 | Team, Player, Training |
| RUNNING | 運作中 | AISystem |
| STOPPED | 已停止 | AISystem |

---

## ErrorCode 對照表

| ErrorCode | 中文訊息 | HTTP Status | 適用場景 |
|-----------|----------|-------------|----------|
| UNAUTHORIZED | 未授權的操作 | 401 | 未登入時操作 |
| INVALID_CREDENTIALS | 帳號或密碼錯誤 | 401 | 登入失敗 |
| FORBIDDEN | 權限不足 | 403 | 權限不足 |
| TEAM_NOT_FOUND | 找不到指定的球隊 | 404 | 查詢/編輯/刪除球隊 |
| TEAM_NAME_EMPTY | 球隊名稱不可為空 | 400 | 建立/編輯球隊 |
| TEAM_NAME_DUPLICATE | 球隊名稱已被使用 | 409 | 建立/編輯球隊 |
| TEAM_HAS_PLAYERS | 球隊尚有球員，無法刪除 | 409 | 刪除球隊（若啟用檢查） |
| PLAYER_NOT_FOUND | 找不到指定的球員 | 404 | 查詢/編輯/刪除球員 |
| JERSEY_NUMBER_DUPLICATE | 背號已被使用 | 409 | 建立/編輯球員 |
| JERSEY_NUMBER_INVALID | 背號必須在 0-99 之間 | 400 | 建立/編輯球員 |
| PLAYER_NAME_EMPTY | 球員姓名不可為空 | 400 | 建立球員 |
| TRAINING_NOT_FOUND | 找不到指定的訓練 | 404 | 查詢/刪除訓練 |
| TRAINING_DATE_REQUIRED | 訓練日期為必填 | 400 | 建立訓練 |
| PLAYER_REQUIRED | 必須指定受測球員 | 400 | 建立訓練 |
| AI_ALREADY_RUNNING | AI 系統已在運作中 | 409 | 啟動 AI |
| AI_NOT_RUNNING | AI 系統未運作 | 409 | 關閉 AI |
| BATCH_DELETE_LIMIT_EXCEEDED | 批次刪除數量超過上限 | 400 | 批次刪除 |

---

## 專業術語對照

### 守備位置 (Positions)

| 代碼 | 英文 | 中文 |
|------|------|------|
| P | Pitcher | 投手 |
| C | Catcher | 捕手 |
| 1B | First Base | 一壘手 |
| 2B | Second Base | 二壘手 |
| 3B | Third Base | 三壘手 |
| SS | Shortstop | 游擊手 |
| LF | Left Field | 左外野手 |
| CF | Center Field | 中外野手 |
| RF | Right Field | 右外野手 |

### 投球數據

| 術語 (EN) | 中文 | 說明 |
|-----------|------|------|
| Speed | 球速 | 單位：km/h |
| Spin Rate | 轉速 | 單位：rpm (每分鐘轉數) |
| Strike Zone | 好球帶 | 投手板到本壘板的規範區域 |
| Trajectory | 軌跡 | 投球的 3D 飛行路徑 |
| Position | 落點 | 球通過好球帶時的座標 |

---

## 邊界決策摘要

| 決策 ID | 問題 | 決策 | 套用至 |
|---------|------|------|--------|
| GD-001 | 球隊刪除策略 | 硬刪除 | Epic B, C, D, E |
| GD-002 | 刪除球隊時球員處理 | 級聯刪除 | Epic B |
| GD-003 | 級聯刪除前確認 | 需要確認 | Epic B |
| GD-004 | 訓練刪除策略 | 硬刪除（含投球資料） | Epic C, D, E |
| GD-005 | 球隊名稱大小寫 | 不區分大小寫 | Epic B |
| Q1 | 背號唯一性範圍 | 同一球隊內唯一 | create-player, update-player |

---

## 測試資料慣例

| Entity | 主要測試資料 | 次要測試資料 |
|--------|-------------|-------------|
| Team | 閃電隊 | 勇士隊 |
| Player | 王小明 (背號 1) | 李小華 (背號 2) |

---

## 關聯關係摘要

```
User
 └── (creates) → Team
      ├── (contains) → Player *
      └── (creates) → Training *
           └── (contains) → Pitch *
                └── (analyzed) → PlayerStats
```
