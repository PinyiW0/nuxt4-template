# DSL to ISA 驗證規則

轉換完成後，**必須**對每個 `.isa.feature` 檔案執行以下驗證。

---

## 1. ISA Instruction Pattern 驗證

**目的**：確保每個 Step 符合 `isa-codegen.yml` 的 regex pattern

| Step Type | Instruction | Regex Pattern |
|-----------|-------------|---------------|
| Given | Time control | `^現在的時間是 "@time\(\"([^"]+)\"\)"$` |
| Given | Data preparation | `^準備一個(?P<entity>[\u4e00-\u9fffa-zA-Z0-9_]+), with table:$` |
| When | API call | `^\((?:No Actor\|UID="\$(?P<userId>[\w.]+)")\) (?P<summary>.+?), call table:$` |
| Then | Response validation | `^回應, with table:$` |
| Then | Response JSON | `^回應為, with JSON:$` |
| Then | Database validation | `^應該存在一個(?P<entity>[\u4e00-\u9fffa-zA-Z0-9_]+), with table:$` |
| Then | Database non-existence | `^應該不存在一個(?P<entity>[\u4e00-\u9fffa-zA-Z0-9_]+), with table:$` |
| Then | Operation failure | `^操作失敗$` |

**錯誤範例**：
```gherkin
# ❌ Entity 名稱使用英文
Given 準備一個Team, with table:

# ✓ 正確
Given 準備一個球隊, with table:

# ❌ When 缺少 actor
When 建立球隊

# ✓ 正確
When (UID="$User.id") 建立球隊, call table:
```

---

## 2. Entity 名稱驗證

**目的**：確保 Entity 名稱在 `entity_to_table_mapping.yml` 中有定義

**有效 Entity 名稱**：
- 使用者 (User)
- 球隊 (Team)
- 球員 (Player)
- 訓練 (Training)
- 投球 (Pitch)
- 選手統計 (PlayerStats)

**錯誤範例**：
```gherkin
# ❌ 「隊伍」未在 mapping 中定義
Given 準備一個隊伍, with table:

# ✓ 使用定義的「球隊」
Given 準備一個球隊, with table:
```

---

## 3. 欄位名稱驗證

**目的**：確保 DataTable 欄位在 `schema.sql` 中有對應定義

**規則**：
- DataTable 使用 **camelCase**
- Schema 使用 **snake_case**

**錯誤範例**：
```gherkin
# ❌ 使用 snake_case
Given 準備一個球隊, with table:
  | team_id | team_name | status |

# ✓ 使用 camelCase
Given 準備一個球隊, with table:
  | teamId | teamName | status |

# ❌ 欄位不存在
Given 準備一個球隊, with table:
  | teamId | invalidField | status |
```

---

## 4. 必填欄位完整性驗證

**目的**：確保 Given 步驟包含所有必要欄位

| Entity | 主鍵 | 外鍵 | 必填業務欄位 |
|--------|------|------|-------------|
| 使用者 | userId | - | name, role, status |
| 球隊 | teamId | - | teamName, status |
| 球員 | playerId | teamId | jerseyNumber, name, position, status |
| 訓練 | trainingId | teamId, playerId | trainingDate, status |
| 投球 | pitchId | trainingId | speed, isStrike |

**錯誤範例**：
```gherkin
# ❌ 缺少主鍵欄位
Given 準備一個球隊, with table:
  | teamName | status |
  | 閃電隊   | ACTIVE |

# ❌ 缺少外鍵欄位
Given 準備一個球員, with table:
  | >Player.id | name   | status |
  | <playerId  | 王小明 | ACTIVE |

# ✓ 正確
Given 準備一個球員, with table:
  | >Player.id | teamId   | jerseyNumber | name   | position | status |
  | <playerId  | $Team.id | 1            | 王小明 | P        | ACTIVE |
```

---

## 5. 變數捕獲語法驗證

**目的**：確保 Then 步驟的 Database validation 不使用變數捕獲

**禁止規則**：
- Then 步驟的 `應該存在一個` / `應該不存在一個` **不允許** `>` 或 `<` 符號
- 只能使用 `$` 引用已捕獲的變數

**錯誤範例**：
```gherkin
# ❌ Then 使用變數捕獲
Then 應該存在一個球隊, with table:
  | >Team.id | teamName | status |
  | <teamId  | 閃電隊   | ACTIVE |

# ✓ Then 只引用變數
Then 應該存在一個球隊, with table:
  | teamId   | teamName | status |
  | $Team.id | 閃電隊   | ACTIVE |

# ✓ 不使用變數也可以
Then 應該存在一個球隊, with table:
  | teamName | status |
  | 閃電隊   | ACTIVE |
```

---

## 6. API Call 參數完整性驗證

**目的**：確保 When 步驟包含必要參數

| 操作 | 必要參數 |
|------|---------|
| 建立 (Create) | 至少 1 個業務欄位 |
| 編輯 (Update) | ID + 至少 1 個更新欄位 |
| 刪除 (Delete) | ID |
| 查詢 (Query) | 可為空或篩選參數 |

**錯誤範例**：
```gherkin
# ❌ 編輯缺少 ID
When (UID="$User.id") 編輯球隊, call table:
  | teamName |
  | 雷霆隊   |

# ✓ 包含 ID
When (UID="$User.id") 編輯球隊, call table:
  | teamId   | teamName |
  | $Team.id | 雷霆隊   |

# ❌ 刪除缺少 ID
When (UID="$User.id") 刪除球隊, call table:
  | |

# ✓ 包含 ID
When (UID="$User.id") 刪除球隊, call table:
  | teamId   |
  | $Team.id |
```

---

## 7. ISA Linter 執行驗證

**目的**：使用官方 linter 驗證

**執行方式**：
```bash
./docs/isa-lint/isa-lint.sh epic-b/us-b2-create-team.isa.feature
```

**Linter 檢查項目**：
- `entity_mapping_linter`
- `db_columns_linter`
- `var_system_step_type_linter`
- `cas_syntax_linter`
- `api_call_linter`
- `response_validation_linter`

---

## 驗證報告格式

```
✓ us-b2-create-team.isa.feature
  ✓ ISA Instruction Pattern (12/12 passed)
  ✓ Entity 名稱 (2/2 valid)
  ✓ 欄位名稱 (8/8 valid)
  ✓ 必填欄位 (4/4 complete)
  ✓ 變數捕獲語法 (0 errors)
  ✓ API Call 參數 (3/3 complete)
  ✓ ISA Linter (0 errors)

✗ us-b3-create-player.isa.feature
  ✓ ISA Instruction Pattern (15/15 passed)
  ✗ Entity 名稱 (1 invalid: "選手" not found)
  ✓ 欄位名稱 (10/10 valid)
  ✗ 必填欄位 (1 missing: sortOrder)
  ✓ 變數捕獲語法 (0 errors)
  ✓ API Call 參數 (4/4 complete)
  ✗ ISA Linter (2 errors)
    - Line 42: Invalid entity name
    - Line 58: Missing required field
```

---

## 驗證失敗處理

若任何驗證項目失敗：
1. **停止轉換流程**
2. **輸出詳細錯誤報告**
3. **提供修復建議**
4. **不產生摘要文件**
