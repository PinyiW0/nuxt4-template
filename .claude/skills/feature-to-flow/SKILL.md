---
name: feature-to-flow
description: 將 .feature 規格轉換為 .flow.md 操作流程（E2E testid 的 single source of truth）
disable-model-invocation: true
argument-hint: "[phase | <feature> | batch <start> <end> | auto]"
context: fork
agent: general-purpose
---

# Feature to Flow 工作流程

將 DSL `.feature` 規格檔轉換為 `.flow.md` 操作流程文件。

`.flow.md` 是 E2E 測試的 **single source of truth**，驅動：
- **PM / QA 確認**：自然語言格式，非工程師可讀
- **UI 生成**：`feature-to-ui` 讀取元素清單，產出帶 testid 的 Vue 頁面
- **測試生成**：`/test e2e spec` 讀取後產出 Playwright `.spec.ts`

```
.feature（業務規則）
    ↓ /feature-to-flow
.flow.md（操作流程 + testid 定義）
    ├─→ /feature-to-ui（消費 testid → Vue 頁面）
    ├─→ /test e2e spec（消費 → Playwright 測試）
    └─→ PM/QA 確認
```

## 使用方式

### 初次建置

```bash
/feature-to-flow              # 從 Phase 0 開始
/feature-to-flow 0            # Phase 0: 架構建立（_common + elements）
/feature-to-flow 04           # Phase 1: 轉換指定 feature
/feature-to-flow 04-建立球隊  # Phase 1: 轉換指定 feature（完整名稱）
```

### 批次執行

```bash
/feature-to-flow batch 03 10                # 批次轉換 feature 03~10
/feature-to-flow batch 03 10 --continue-on-error  # 失敗時繼續
/feature-to-flow auto                       # 自動偵測未轉換的 feature
/feature-to-flow auto --limit 5             # 最多處理 5 個
```

## 現有 Feature 檔案

!`ls -1 docs/gherkin-spec/features/*.feature 2>/dev/null | head -20 || echo "(無)"`

## 現有 Flow 檔案

!`ls -1 docs/e2e-flows/*.flow.md 2>/dev/null || echo "(無)"`

---

## Phase 概覽

| Phase | 名稱 | 輸出 | Context 需求 |
|-------|------|------|--------------|
| 0 | 架構建立 | `_common.flow.md`, `pages/*.elements.md` | 所有 .feature + SPEC.md |
| 1 | 逐一轉換 | `{NN}-{name}.flow.md` | 單一 .feature + _common + elements |

**設計理念**：骨架優先，細節後填。Phase 0 建立跨 feature 的共用架構（testid 命名規則、共用步驟、各頁面元素定義），Phase 1 在此骨架上逐一填入每個 feature 的操作流程。

---

## 必讀文件

### Phase 0 需要

- [setup.md](setup.md) - Phase 0 詳細規則
- `docs/e2e-flows/SPEC.md` - Flow 格式規格

### Phase 1 需要

- [convert.md](convert.md) - Phase 1 詳細規則
- `docs/e2e-flows/SPEC.md` - Flow 格式規格
- `docs/e2e-flows/_common.flow.md` - 共用步驟（Phase 0 產出）
- `docs/e2e-flows/pages/*.elements.md` - 頁面元素定義（Phase 0 產出）

---

## Phase 0: 架構建立

### 目標

分析所有 `.feature` 檔案，建立跨 feature 的共用架構。

### 必讀規範

```
僅需讀取：
- docs/e2e-flows/SPEC.md（格式規格）
- docs/gherkin-spec/features/*.feature（所有 feature 檔）
```

### 執行步驟

1. **讀取 SPEC.md 和所有 .feature 檔**
2. **分析共用模式**（跨 feature 的 Given/Then、涉及的頁面、測試帳號）
3. **產出 `_common.flow.md`**（共用步驟 + testid 命名規則）
4. **產出 `pages/*.elements.md`**（每個頁面的元素定義）
5. **詢問用戶確認**

### 產出

```
docs/e2e-flows/
├── _common.flow.md              # 共用步驟、testid 命名規則
└── pages/
    ├── login.elements.md        # 登入頁元素定義
    ├── teams.elements.md        # 球隊管理頁元素定義
    ├── players.elements.md      # 球員管理頁元素定義
    └── ...                      # 根據 .feature 涉及的頁面動態決定
```

> 詳細規則見 [setup.md](setup.md)

---

## Phase 1: 逐一轉換

### 目標

將單一 `.feature` 轉換為 `.flow.md` 操作流程文件。

### 必讀規範

```
僅需讀取：
- docs/e2e-flows/SPEC.md（格式規格）
- docs/e2e-flows/_common.flow.md（共用步驟，Phase 0 產出）
- docs/e2e-flows/pages/{對應頁面}.elements.md（該頁面元素定義）
- docs/gherkin-spec/features/{目標}.dsl.feature（目標 feature）
```

### 執行步驟

1. **讀取 SPEC.md、_common.flow.md、對應 elements.md**
2. **讀取目標 .feature 檔**
3. **盤點所需元素**（比對 elements.md，區分已定義/需新增）
4. **更新 elements.md**（如有新 testid）
5. **撰寫 .flow.md**（Given/When/Then → 操作步驟 + 驗證）
6. **詢問用戶確認**
7. **確認後才進入下一個 feature**

### 產出

```
docs/e2e-flows/{NN}-{name}.flow.md
docs/e2e-flows/pages/{page}.elements.md  # 更新（如有新 testid）
```

> 詳細規則見 [convert.md](convert.md)

---

## 核心原則

### testid 在此定義，不從 Vue 提取

> `.flow.md` 是 testid 的 **single source of truth**。
> testid 根據 SPEC.md 命名規則**推導**，不讀取 Vue 檔案。
> Vue 頁面是 testid 的**消費者**（由 `feature-to-ui` 讀取 elements.md 後放入）。

### 元素一致性（Option B）

> 同一頁面的 testid 由 `pages/*.elements.md` 集中管理。
> Phase 1 新增 testid 前，必須先檢查 elements.md 是否已定義。

### 骨架優先

> Phase 0 先建立所有頁面的元素骨架，Phase 1 在此基礎上逐一轉換。
> 不跳過 Phase 0 直接執行 Phase 1。

---

## 批次執行

### batch

對指定範圍的 features 依序執行 Phase 1：

```
for feature in range(start, end):
    convert(feature)
    if failed and not --continue-on-error:
        stop
```

### auto

掃描所有 `.feature`，找出尚未有 `.flow.md` 的，依序執行 Phase 1：

```
判斷是否已轉換：
  docs/e2e-flows/{NN}-{name}.flow.md 存在？
```

### 前置條件

batch / auto 執行前，必須確認 Phase 0 已完成：

```
docs/e2e-flows/_common.flow.md 存在？
docs/e2e-flows/pages/*.elements.md 存在？
→ 不存在 → 提示先執行 /feature-to-flow 0
```

---

## 注意事項

- **每個 Phase 完成後都要詢問確認**
- **Phase 1 每個 feature 完成後都要詢問確認**
- **Phase 0 必須分析所有 .feature**，不可只看部分
- 禁止讀取 Vue 頁面（testid 是定義，不是提取）
- 禁止跳過 Phase 0 直接執行 Phase 1
- 新增 testid 前必須先檢查 elements.md 避免重複
- 動詞只使用固定的 7 個（前往/點擊/輸入/清空並輸入/勾選/取消勾選/等待）
