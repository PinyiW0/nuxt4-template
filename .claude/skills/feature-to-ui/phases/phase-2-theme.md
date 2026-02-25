# Phase 2: 基礎設定

## 必讀規範

```
僅需讀取：
- .ai-prompts/ui/style-presets.yaml（風格預設）
- ui-config.yaml > theme.colors.light（淺色模式色彩）
- ui-config.yaml > theme.colors.dark（深色模式色彩）
- ui-config.yaml > colorMode（深淺模式設定）
```

## 執行步驟

1. **讀取 `ui-config.yaml` 的 `theme.colors.light` 和 `theme.colors.dark`**
2. **建立 app.config.ts**（色彩映射）
3. **建立 main.css**（三層 CSS 色階）：
   - 第 1 層：`:root` / `.dark` 定義 `--raw-*` 原始色值
   - 第 2 層：`@theme inline` 註冊 `--color-*`（Tailwind utility class）
   - 第 3 層：`:root` / `.dark` 定義 `--ui-color-*` 色票 + `--ui-*` 語義變數（Nuxt UI 元件）
4. **詢問用戶確認**

## 色彩翻譯規則

### 判斷邏輯

讀取 `ui-config.yaml > theme.colors.light` 和 `theme.colors.dark`，每個顏色依據值的格式決定處理方式：

| 值的格式 | 範例 | 處理方式 |
|---------|------|---------|
| `"#hex"` | `"#00ba7b"` | 自訂色 → 產生 CSS 色階 + app.config 映射 |
| `"名稱"` | `"emerald"` | Tailwind 內建 → 只需 app.config 映射 |

### 雙模式色彩處理

Light 和 Dark 可以為同一語義色使用**完全不同的色相**。

判斷某個語義色是否需要產生雙模式 CSS：

| light 值 | dark 值 | 處理方式 |
|-----------|---------|---------|
| `"#hex"` | `"#hex"`（相同） | 單一色階，寫入 `@theme static` |
| `"#hex"` | `"#hex"`（不同） | 雙色階，用 `:root` / `.dark` + `@theme inline` |
| `"#hex"` | `"名稱"` | light 自訂 + dark 內建，用 `:root` / `.dark` + `@theme inline` |
| `"名稱"` | `"名稱"`（相同） | 只需 app.config 映射 |
| `"名稱"` | `"名稱"`（不同） | 用 `:root` / `.dark` + `@theme inline` 搭配 Tailwind 內建色 |

### 自訂 hex 的產出規則

1. 用 https://uicolors.app 從 hex 產生 50-950 共 11 個色階
2. Light 色階寫入 `:root { --raw-{色名}-50~950 }`
3. Dark 色階寫入 `.dark { --raw-{色名}-50~950 }`
4. 在 `@theme inline` 用 `var()` 引用中介變數
5. 寫入 app.config.ts：`{語義色名}: '{語義色名}'`

**關鍵：CSS 變數名稱必須和 app.config 映射名稱一致。**

### 為什麼必須用 `@theme inline` 而不是 `@theme static`？

- `@theme static` 會在 build time 把值直接寫進 CSS，`var()` 引用會被解析，`.dark` 覆蓋無效
- `@theme inline` 保留 `var()` 引用，runtime 可隨 `.dark` class 動態切換
- NuxtUI 使用 `.dark` class 切換深淺模式（不是 `@media prefers-color-scheme`）

> ⚠️ **只有 light/dark 色碼完全相同時，才能用 `@theme static`。有任何差異就必須用 `@theme inline`。**

### NuxtUI 支援的語義色名（只有這 7 個）

`primary` | `secondary` | `success` | `info` | `warning` | `error` | `neutral`

> ⚠️ **禁止使用 `tertiary`、`accent` 等 NuxtUI 不支援的色名**

## 資料流

```
ui-config.yaml                  main.css                              app.config.ts
──────────────                  ────────                              ─────────────
theme.colors.light              :root { --raw-primary-50~950 }
  primary: "#00ba7b"        →   .dark { --raw-primary-50~950 }    →   primary: 'primary'
theme.colors.dark               @theme inline {
  primary: "#e50006"              --color-primary-*: var(--raw-*)     ← Tailwind utility
                                }
                                :root { --ui-color-primary-*: var(--raw-*) }  ← Nuxt UI 元件
                                :root { --ui-primary: var(--ui-color-primary-500) }
                                .dark { --ui-primary: var(--ui-color-primary-400) }

theme.colors.light              （不需要 CSS）
  success: "emerald"        →                                     →   success: 'emerald'
theme.colors.dark
  success: "#009764"        →   :root { } .dark { --raw-success-* }   （需要改為自訂）
```

### CSS 變數的三層架構（重要！）

Nuxt UI 元件**不會直接讀取** `--color-*`（Tailwind 層），而是讀取 `--ui-color-*` 和 `--ui-*`。
使用自訂色時必須手動橋接這三層：

```
第 1 層：--raw-primary-500          ← 原始色值（:root / .dark 切換）
第 2 層：--color-primary-500        ← Tailwind utility（bg-primary-500 等）
第 3 層：--ui-color-primary-500     ← Nuxt UI 元件色票（按鈕 hover、ring 等）
         --ui-primary               ← Nuxt UI 語義色（元件 color="primary" 讀取）
```

> ⚠️ **只用 `@theme inline` 只解決第 2 層。第 3 層（Nuxt UI 元件）必須額外定義 `--ui-color-*` 和 `--ui-*` 變數，否則元件顏色不會生效。**

### 特殊情況：light 用 Tailwind 內建 + dark 用自訂 hex

當 light 和 dark 不同時，即使其中一方是 Tailwind 內建色，也必須**兩方都產生完整色階**，
因為 `@theme inline` 的 `var()` 引用必須在兩個模式都有定義。

做法：查出 Tailwind 內建色的實際色碼，產生對應的 `--raw-*` 變數。

## app.config.ts 範例

```typescript
// app/app.config.ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'primary',       // 映射到 --color-primary-*
      secondary: 'secondary',   // 映射到 --color-secondary-*
      success: 'success',       // 映射到 --color-success-*
      warning: 'warning',       // 映射到 --color-warning-*
      error: 'error',           // 映射到 --color-error-*
      info: 'info',             // 映射到 --color-info-*
      neutral: 'neutral',       // 映射到 --color-neutral-*
    },
  },
})
```

> 當 light/dark 有任何差異時，所有顏色都統一映射到自身名稱（`'primary'` 而不是 `'emerald'`），
> 因為實際色值由 CSS 的 `:root` / `.dark` 控制。

## main.css 範例

```css
/* app/assets/css/main.css */
@import "tailwindcss";
@import "@nuxt/ui";

/* ═══════════════════════════════════════════════════════════════════
   Light Mode 色值（:root = 預設）
   ═══════════════════════════════════════════════════════════════════ */
:root {
  /* primary — 青綠 (base: #00ba7b) */
  --raw-primary-50: #EFFDF5;
  --raw-primary-100: #D9FBE8;
  --raw-primary-200: #B3F5D1;
  --raw-primary-300: #75EDAE;
  --raw-primary-400: #00DC82;
  --raw-primary-500: #00BA7B;
  --raw-primary-600: #00A155;
  --raw-primary-700: #007F45;
  --raw-primary-800: #016538;
  --raw-primary-900: #0A5331;
  --raw-primary-950: #052E16;

  /* secondary — 萊姆綠 (base: #7acc00) */
  --raw-secondary-50: #F7FFE0;
  --raw-secondary-100: #EEFFB8;
  /* ... 完整 50-950 */
  --raw-secondary-950: #1A3300;

  /* neutral — 深藍灰 (base: #314157) */
  --raw-neutral-50: #F4F7FA;
  --raw-neutral-100: #E8ECF2;
  /* ... 完整 50-950 */
  --raw-neutral-950: #0D1117;
}

/* ═══════════════════════════════════════════════════════════════════
   Dark Mode 色值（.dark 覆蓋）
   ═══════════════════════════════════════════════════════════════════ */
.dark {
  /* primary — 日落紅 (base: #e50006) */
  --raw-primary-50: #FEF2F2;
  --raw-primary-100: #FEE2E2;
  --raw-primary-200: #FECACA;
  --raw-primary-300: #FCA5A5;
  --raw-primary-400: #F87171;
  --raw-primary-500: #E50006;
  --raw-primary-600: #DC2626;
  --raw-primary-700: #B91C1C;
  --raw-primary-800: #991B1B;
  --raw-primary-900: #7F1D1D;
  --raw-primary-950: #450A0A;

  /* secondary — 純黑 (base: #000000) */
  --raw-secondary-50: #F5F5F5;
  --raw-secondary-100: #E5E5E5;
  /* ... 完整 50-950 */
  --raw-secondary-950: #000000;

  /* neutral — 極深灰 (base: #09090b) */
  --raw-neutral-50: #FAFAFA;
  --raw-neutral-100: #F4F4F5;
  /* ... 完整 50-950 */
  --raw-neutral-950: #09090B;
}

/* ═══════════════════════════════════════════════════════════════════
   第 2 層：註冊到 Tailwind 主題（用 inline，不是 static！）
   用途：讓 Tailwind utility class（bg-primary-500 等）生效
   ═══════════════════════════════════════════════════════════════════ */
@theme inline {
  --color-primary-50: var(--raw-primary-50);
  --color-primary-100: var(--raw-primary-100);
  /* ... 完整 50-950 */
  --color-primary-950: var(--raw-primary-950);

  --color-secondary-50: var(--raw-secondary-50);
  /* ... 完整 50-950 */
  --color-secondary-950: var(--raw-secondary-950);

  --color-neutral-50: var(--raw-neutral-50);
  /* ... 完整 50-950 */
  --color-neutral-950: var(--raw-neutral-950);

  /* success/warning/error/info — 若 light/dark 不同也需要加入 */
}

/* ═══════════════════════════════════════════════════════════════════
   第 3 層：Nuxt UI 元件色票映射（--ui-color-{name}-{shade}）
   Nuxt UI 元件不讀 --color-*，而是讀 --ui-color-*
   對每個自訂色，都必須產生完整的 --ui-color-* 映射
   ═══════════════════════════════════════════════════════════════════ */
:root {
  --ui-color-primary-50: var(--raw-primary-50);
  --ui-color-primary-100: var(--raw-primary-100);
  /* ... 完整 50-950，每個自訂色都要 */
  --ui-color-primary-950: var(--raw-primary-950);

  --ui-color-secondary-50: var(--raw-secondary-50);
  /* ... */
  --ui-color-neutral-50: var(--raw-neutral-50);
  /* ... success / warning / error / info 同理 */
}

/* ═══════════════════════════════════════════════════════════════════
   第 3 層：Nuxt UI 語義變數（--ui-primary, --ui-text, --ui-bg 等）
   這些是 Nuxt UI 元件最終讀取的變數
   ═══════════════════════════════════════════════════════════════════ */

/* --- Light Mode --- */
:root {
  /* 語義色彩 */
  --ui-primary: var(--ui-color-primary-500);
  --ui-secondary: var(--ui-color-secondary-500);
  --ui-success: var(--ui-color-success-500);
  --ui-info: var(--ui-color-info-500);
  --ui-warning: var(--ui-color-warning-500);
  --ui-error: var(--ui-color-error-500);

  /* 文字 */
  --ui-text-dimmed: var(--ui-color-neutral-400);
  --ui-text-muted: var(--ui-color-neutral-500);
  --ui-text-toned: var(--ui-color-neutral-600);
  --ui-text: var(--ui-color-neutral-700);
  --ui-text-highlighted: var(--ui-color-neutral-900);
  --ui-text-inverted: white;

  /* 背景 */
  --ui-bg: white;
  --ui-bg-muted: var(--ui-color-neutral-50);
  --ui-bg-elevated: var(--ui-color-neutral-100);
  --ui-bg-accented: var(--ui-color-neutral-200);
  --ui-bg-inverted: var(--ui-color-neutral-900);

  /* 邊框 */
  --ui-border: var(--ui-color-neutral-200);
  --ui-border-muted: var(--ui-color-neutral-200);
  --ui-border-accented: var(--ui-color-neutral-300);
  --ui-border-inverted: var(--ui-color-neutral-900);
}

/* --- Dark Mode --- */
.dark {
  /* 語義色彩（改用 -400 色階） */
  --ui-primary: var(--ui-color-primary-400);
  --ui-secondary: var(--ui-color-secondary-400);
  --ui-success: var(--ui-color-success-400);
  --ui-info: var(--ui-color-info-400);
  --ui-warning: var(--ui-color-warning-400);
  --ui-error: var(--ui-color-error-400);

  /* 文字 */
  --ui-text-dimmed: var(--ui-color-neutral-500);
  --ui-text-muted: var(--ui-color-neutral-400);
  --ui-text-toned: var(--ui-color-neutral-300);
  --ui-text: var(--ui-color-neutral-200);
  --ui-text-highlighted: white;
  --ui-text-inverted: var(--ui-color-neutral-900);

  /* 背景 */
  --ui-bg: var(--ui-color-neutral-900);
  --ui-bg-muted: var(--ui-color-neutral-800);
  --ui-bg-elevated: var(--ui-color-neutral-800);
  --ui-bg-accented: var(--ui-color-neutral-700);
  --ui-bg-inverted: white;

  /* 邊框 */
  --ui-border: var(--ui-color-neutral-800);
  --ui-border-muted: var(--ui-color-neutral-700);
  --ui-border-accented: var(--ui-color-neutral-700);
  --ui-border-inverted: white;
}
```

> ⚠️ **必須使用 `@theme inline`**（不是 `static`！）
>
> ⚠️ **第 3 層（`--ui-color-*` + `--ui-*`）是必要的！** 缺少這層，Nuxt UI 元件（UButton、UBadge 等）的顏色不會生效。
>
> 色階產生：https://uicolors.app

## 常見錯誤

```typescript
// ❌ app.config 映射名稱和 CSS 變數名稱不一致
primary: 'rose',       // NuxtUI 去找 --color-rose-*，找不到自訂色！

// ✅ 自訂 hex 時，映射到自身名稱
primary: 'primary',    // NuxtUI 去找 --color-primary-*，對上自訂色 ✅
```

```typescript
// ❌ 使用 NuxtUI 不支援的語義色名
tertiary: 'slate',     // NuxtUI 元件沒有 color="tertiary"
accent: 'slate',       // NuxtUI 元件沒有 color="accent"
```

```css
/* ❌ 只有 @theme inline，缺少 --ui-color-* 和 --ui-* */
/* Tailwind utility（bg-primary-500）會生效，但 Nuxt UI 元件顏色不會 */
@theme inline {
  --color-primary-500: var(--raw-primary-500);
}

/* ✅ 三層都要：@theme inline + --ui-color-* + --ui-* */
@theme inline {
  --color-primary-500: var(--raw-primary-500);   /* Tailwind utility */
}
:root {
  --ui-color-primary-500: var(--raw-primary-500); /* Nuxt UI 色票 */
  --ui-primary: var(--ui-color-primary-500);      /* Nuxt UI 語義色 */
}
```

```css
/* ❌ 雙模式時用 @theme static — .dark 覆蓋無效 */
@theme static {
  --color-primary-500: var(--raw-primary-500);  /* build time 被解析，runtime 不會切換 */
}

/* ✅ 雙模式時用 @theme inline — 保留 var() 引用 */
@theme inline {
  --color-primary-500: var(--raw-primary-500);  /* runtime 隨 .dark class 切換 ✅ */
}
```

```css
/* ❌ 在 @theme 內放選擇器（不支援巢狀） */
@theme inline {
  .dark {
    --color-primary-500: #E50006;  /* 語法錯誤！ */
  }
}

/* ✅ 選擇器放在 @theme 外面 */
.dark {
  --raw-primary-500: #E50006;
}
@theme inline {
  --color-primary-500: var(--raw-primary-500);
}
```
