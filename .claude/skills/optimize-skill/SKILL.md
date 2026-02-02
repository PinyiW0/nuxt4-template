---
name: optimize-skill
description: 優化現有 Claude Code skill，診斷問題並改善結構、觸發準確度與效率
disable-model-invocation: true
argument-hint: "[phase] [skill-name]"
context: fork
agent: general-purpose
---

# 優化 Skill

分階段診斷並優化現有 skill。

## 使用方式

```bash
/optimize-skill 1 my-skill    # Phase 1: 產出診斷報告
/optimize-skill 2 my-skill    # Phase 2: 執行優化
```

## 現有 Skills

!`ls -1 .claude/skills/ 2>/dev/null | grep -v "^_" || echo "(無)"`

---

## Phase 1: 診斷分析

**Input**: `.claude/skills/<name>/SKILL.md`
**Output**: `.claude/skills/_reports/<name>/diagnosis.yaml`

### 執行步驟

1. 讀取 SKILL.md 與支援檔案

2. 參考 [checklist.md](checklist.md) 執行四項檢查：
   - Frontmatter 設定
   - 內容結構
   - 觸發準確度
   - 執行效率

3. 參考 [diagnosis-template.yaml](diagnosis-template.yaml) 產出報告

4. 顯示摘要並告知用戶檢視後執行 Phase 2

---

## Phase 2: 執行優化

**Input**: `.claude/skills/_reports/<name>/diagnosis.yaml`
**Output**: 更新後的 `SKILL.md` + `optimization.yaml`

### 執行步驟

1. 讀取診斷報告

2. 備份原始 SKILL.md 到 `_reports/<name>/backup/`

3. 依優先順序逐項詢問：
   - 顯示問題與建議
   - 用戶選擇：執行 / 跳過 / 自訂

4. 執行同意的優化項目

5. 產出 `optimization.yaml` 記錄變更

6. 告知用戶測試方式與備份位置

---

## 支援檔案

- [checklist.md](checklist.md) - 診斷檢查項目詳細說明
- [diagnosis-template.yaml](diagnosis-template.yaml) - 診斷報告格式範本
