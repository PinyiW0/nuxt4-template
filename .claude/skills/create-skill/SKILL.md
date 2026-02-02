---
name: create-skill
description: 建立新的 Claude Code skill，分階段收集需求並生成 SKILL.md
disable-model-invocation: true
argument-hint: "[phase] [skill-name]"
context: fork
agent: general-purpose
---

# 建立新 Skill

分階段建立 Claude Code skill。

## 使用方式

```bash
/create-skill 1 my-skill    # Phase 1: 產出 spec.yaml
/create-skill 2 my-skill    # Phase 2: 生成 SKILL.md
```

## 現有 Skills

!`ls -1 .claude/skills/ 2>/dev/null || echo "(無)"`

---

## Phase 1: 需求收集

**Input**: 用戶需求描述
**Output**: `.claude/skills/_drafts/<name>/spec.yaml`

### 執行步驟

1. 詢問用戶基本資訊（若未提供）：
   - 用途描述
   - 觸發方式（手動/AI/兩者）
   - 是否需要參數
   - 是否需要限制工具
   - 是否需要獨立 context

2. 讀取 [spec-template.yaml](spec-template.yaml) 格式

3. 產出 `spec.yaml` 到 `_drafts/<name>/`

4. 告知用戶檢視後執行 Phase 2

---

## Phase 2: 生成 Skill

**Input**: `.claude/skills/_drafts/<name>/spec.yaml`
**Output**: `.claude/skills/<name>/SKILL.md`

### 執行步驟

1. 讀取並驗證 `spec.yaml`

2. 參考 [reference.md](reference.md) 的欄位說明

3. 建立目錄並生成 SKILL.md

4. 建立支援檔案（若 spec 指定）

5. 刪除 `_drafts/<name>/`

6. 告知用戶測試方式

---

## 支援檔案

- [spec-template.yaml](spec-template.yaml) - spec 格式範本
- [reference.md](reference.md) - Frontmatter 欄位與動態變數說明
