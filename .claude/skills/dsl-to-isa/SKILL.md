---
name: dsl-to-isa
description: 將 DSL-Level Gherkin 轉換為 ISA-Level Gherkin，產生可直接用於測試程式碼生成的規格
disable-model-invocation: true
argument-hint: "[target]"
context: fork
agent: general-purpose
---

# DSL to ISA 轉換

將 DSL-Level Gherkin 轉換為 ISA-Level Gherkin。

## 翻譯鏈定位

```
Event Storming → DSL-Level Gherkin → ISA-Level Gherkin → Test Code → Code
                                      ^^^^^^^^^^^^^^^^
                                      本流程產出層級
```

## 使用方式

```bash
/dsl-to-isa all                    # 轉換所有 epic
/dsl-to-isa epic-b                 # 轉換指定 epic
/dsl-to-isa <feature-file>         # 轉換單一檔案
```

## 現有 DSL 檔案

!`ls -1 docs/gherkin-spec/epic-*/*.feature 2>/dev/null | head -10 || echo "(無)"`

---

## 執行流程

**Input**: DSL `.feature` 檔案
**Output**: `docs/gherkin-spec/isa/{epic}/*.isa.feature`

### 步驟

1. 解析 target 參數
2. 檢查/產生 ISA Lint 對照檔（若不存在）
3. 讀取參考資料
4. 逐檔案轉換
5. **驗證轉換結果**（必須全部通過）
6. 輸出轉換摘要

---

## 必讀文件

轉換規則與驗證標準：

- [conversion-rules.md](conversion-rules.md) - 完整轉換規則
- [validation-rules.md](validation-rules.md) - 驗證檢查項目
- [examples.md](examples.md) - 完整轉換範例

參考資料：

@.ai-prompts/event-storming/isa-format.md
@docs/gherkin-spec/_meta/glossary.json
@docs/isa-lint/isa-codegen.yml

---

## 輸出結構

```
docs/gherkin-spec/
├── epic-b/                          # DSL 原始檔
│   └── us-b2-create-team.feature
└── isa/                             # ISA 輸出
    └── epic-b/
        └── us-b2-create-team.isa.feature
```

---

## 轉換規則摘要

詳見 [conversion-rules.md](conversion-rules.md)

### Given 轉換

| DSL | ISA |
|-----|-----|
| `{Actor} 已登入系統` | `準備一個使用者, with table:` |
| `系統中存在{Entity} "{name}"` | `準備一個{Entity}, with table:` |

### When 轉換

| DSL | ISA |
|-----|-----|
| `{Actor} {動作} {Entity}` | `(UID="$User.id") {摘要}, call table:` |

### Then 轉換

| DSL | ISA |
|-----|-----|
| `{Entity} 應該存在` | `回應, with table:` + `應該存在一個{Entity}` |
| `應回傳錯誤 "{msg}"` | `操作失敗` + `回應, with table:` |

---

## 驗證檢查（必須全部通過）

詳見 [validation-rules.md](validation-rules.md)

1. ✓ ISA Instruction Pattern
2. ✓ Entity 名稱（中文）
3. ✓ 欄位名稱（camelCase）
4. ✓ 必填欄位完整性
5. ✓ 變數捕獲語法（Then 禁止 `>` `<`）
6. ✓ API Call 參數完整性
7. ✓ ISA Linter 執行

---

## 注意事項

- Entity 名稱必須使用**中文**（球隊、球員）
- DataTable 欄位使用 **camelCase**
- Then 步驟**禁止變數捕獲**
- 驗證失敗時停止並輸出錯誤報告
