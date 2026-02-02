# Skill 參考文檔

## Frontmatter 欄位

| 欄位 | 類型 | 說明 | spec.yaml 對應 |
|------|------|------|----------------|
| `name` | string | 顯示名稱與指令名（小寫、連字號、≤64字元） | `name` |
| `description` | string | 用途說明，AI 用來判斷何時使用 | `description` |
| `argument-hint` | string | 自動完成提示，如 `[filename]` | `invocation.argument_hint` |
| `disable-model-invocation` | bool | `true` = 禁止 AI 自動觸發 | `invocation.model = false` |
| `user-invocable` | bool | `false` = 隱藏於 / 選單 | `invocation.user` |
| `context` | string | `fork` = 在獨立 subagent 執行 | `execution.context` |
| `agent` | string | fork 時的 agent 類型 | `execution.agent` |
| `allowed-tools` | string | 逗號分隔的工具列表 | `execution.allowed_tools` |

## 觸發設定組合

| 設定 | 用戶可呼叫 | AI 可觸發 | 適用場景 |
|------|-----------|----------|----------|
| (預設) | ✓ | ✓ | 一般 skill |
| `disable-model-invocation: true` | ✓ | ✗ | 部署、提交等有副作用的操作 |
| `user-invocable: false` | ✗ | ✓ | 背景知識、AI 自動參考 |

## Context 設定

| 值 | 說明 | 適用場景 |
|----|------|----------|
| `inline` (預設) | 在當前對話 context 執行 | 簡單任務、需要對話歷史 |
| `fork` | 在獨立 subagent 執行 | 複雜任務、避免 context 過長 |

### Agent 類型（fork 時使用）

| Agent | 說明 | 工具 |
|-------|------|------|
| `Explore` | 探索程式碼 | Read, Grep, Glob（唯讀） |
| `Plan` | 設計實作方案 | Read, Grep, Glob（唯讀） |
| `general-purpose` | 通用任務 | 所有工具 |

## 動態變數

在 SKILL.md 內容中可使用：

| 變數 | 說明 | 範例 |
|------|------|------|
| `$ARGUMENTS` | 所有傳入參數 | `/skill foo bar` → `foo bar` |
| `$ARGUMENTS[N]` | 第 N 個參數（0 起始） | `$ARGUMENTS[0]` → `foo` |
| `$N` | `$ARGUMENTS[N]` 簡寫 | `$0` → `foo` |
| `${CLAUDE_SESSION_ID}` | 當前 session ID | 用於 log 檔名 |
| `` !`command` `` | Shell 命令結果（預處理） | `` !`ls -1` `` |

## 動態注入範例

```yaml
---
name: list-files
description: 列出專案檔案
---
```

```markdown
## 專案結構

!`find . -type f -name "*.ts" | head -20`
```

執行時，`` !`find...` `` 會先執行，結果替換到內容中。

## SKILL.md 生成規則

根據 spec.yaml 生成：

```markdown
---
name: <spec.name>
description: <spec.description>
argument-hint: <spec.invocation.argument_hint>        # 若非空
disable-model-invocation: true                         # 若 model = false
user-invocable: false                                  # 若 user = false
context: <spec.execution.context>                      # 若為 fork
agent: <spec.execution.agent>                          # 若有指定
allowed-tools: "<spec.execution.allowed_tools | join>" # 若非空
---

# <spec.name 轉標題>

<spec.content.summary>

## <section.title>

<section.body>

## 必讀文件

@<file>

## 注意事項

- <note>
```
