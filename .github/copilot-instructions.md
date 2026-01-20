# Copilot 專案指令

## Event Storming 自動化流程

當使用者要求執行 Event Storming 時，請依照以下流程：

### 觸發指令範例
```
@workspace 請對 docs/user-stories/us-XXX.md 執行 Event Storming
```

### 執行流程

1. **讀取 User Story**
   - 位置：`docs/user-stories/{story-id}.md`
   - 確認 User Story 的完整內容

2. **依序執行 6 個階段**
   - Stage 1: Domain Events 識別
   - Stage 2: Commands 萃取
   - Stage 3: Aggregates & Entities 定義
   - Stage 4: Policies & Business Rules 梳理
   - Stage 5: Read Models & Views 設計
   - Stage 6: Gherkin Scenarios 生成

3. **每個階段的執行方式**
   - 讀取對應的 prompt template：`docs/event-storming/prompts/stage{N}-*.md`
   - 根據 prompt 的指引和輸出格式要求進行分析
   - 將輸出儲存至：`docs/event-storming/examples/{story-id}/0{N}-*.json` 或 `.feature`
   - 前一階段的輸出作為下一階段的輸入

4. **輸出位置**
   ```
   docs/event-storming/examples/{story-id}/
   ├── 01-domain-events.json
   ├── 02-commands.json
   ├── 03-aggregates.json
   ├── 04-policies.json
   ├── 05-read-models.json
   └── 06-scenarios.feature
   ```

### Prompt Templates 位置

所有 prompt templates 都在 `docs/event-storming/prompts/` 目錄：

- `stage1-domain-events.md` - 從 User Story 識別 Domain Events
- `stage2-commands.md` - 從 Events 萃取 Commands
- `stage3-aggregates.md` - 定義 Aggregates 和 Entities
- `stage4-policies.md` - 梳理 Business Rules 和 Policies
- `stage5-read-models.md` - 設計 Read Models 和 UI Views
- `stage6-gherkin.md` - 生成完整的 Gherkin 測試場景

### 重要原則

1. **嚴格遵循 prompt template 的指引**
   - 每個 stage 的 prompt 都有明確的「任務要求」和「輸出格式」
   - 必須按照指定的 JSON schema 產出

2. **從 Event 展開的 7 個步驟**（Stage 1-3）
   - Step 1：確定 Event（切入點）
   - Step 2：Event 來源是什麼？（Actor 或系統）
   - Step 3：展開 Command + Actor
   - Step 4：展開 Rules（前/後置條件）
   - Step 5：確認 Input/Output 參數
   - Step 6：建立 Aggregate（狀態）
   - Step 7：展開 Read Model（查詢介面）

3. **區分兩種系統邊界模型**

   **修改型操作（Command Operation）**
   ```
   Actor → [Command + Input] → Rules 驗證 → Aggregate 狀態改變 → Event 產生
   ```
   Gherkin 對應：
   - Preconditions → Given
   - Command + Input → When
   - Postconditions + Event → Then

   **查詢型操作（Query Operation）**
   ```
   Actor → [Query] → 權限驗證 → Read Model 回傳
   ```
   Gherkin 對應：
   - Preconditions（權限驗證）→ Given
   - Query 請求 → When
   - Read Model 回傳資料 → Then

4. **Rules 前後置條件對照**

   | 類型 | 英文 | 定義 | 範例 |
   |------|------|------|------|
   | 前置條件 | Precondition | 執行操作前必須滿足的條件 | 用戶已登入、資料存在、權限驗證 |
   | 後置條件 | Postcondition | 執行成功後系統應達到的狀態 | 狀態變更、Event 發出、資料一致性 |

5. **每個階段完成後**
   - 回報當前進度
   - 顯示產出檔案的路徑
   - 確認是否繼續下一階段

### 範例使用方式

使用者可以這樣呼叫：

```
@workspace 請對 docs/user-stories/us-teamAndPlayer.md 執行完整的 Event Storming 流程
```

或是執行特定階段：

```
@workspace 請執行 Event Storming Stage 1，分析 us-teamAndPlayer 的 Domain Events
```

### 驗證與檢查

在產出每個階段的結果後，請確認：
- JSON 格式正確
- 包含所有必要欄位
- 符合 prompt template 的輸出格式要求
- 前後階段的資料能夠銜接

---

## 其他專案指令

（其他 Copilot 指令可以在這裡添加）
