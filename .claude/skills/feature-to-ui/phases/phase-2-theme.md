# Phase 2: 基礎設定

## 必讀規範

```
僅需讀取：
- .ai-prompts/ui/style-presets.yaml（風格預設）
- ui-config.yaml > selectedPreset（已選風格）
- ui-config.yaml > theme.colors（色彩設定）
```

## 執行步驟

1. **詢問用戶選擇風格預設**（若尚未選擇）
2. **建立 app.config.ts**
3. **建立 main.css**（若需要 hex 色碼）
4. **詢問用戶確認**

## 風格選擇詢問格式

```
請選擇專案的視覺風格：

| # | 風格 | 說明 | 模式 |
|---|------|------|------|
| 1 | dark-default | Dracula 霓虹風 | 深色 |
| 2 | light-default | 清新自然風 | 淺色 |
| 3 | dark-aqua | 深海青綠風 | 深色 |
| ... | ... | ... | ... |
```

## app.config.ts 範例

```typescript
// app/app.config.ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'cyan',      // Tailwind 預設色
      secondary: 'purple',
      success: 'green',
      warning: 'amber',
      error: 'red',
    },
  },
})
```

## main.css 範例（Hex 色碼時需要）

```css
/* app/assets/css/main.css */
@import "tailwindcss";
@import "@nuxt/ui";

@theme static {
  --color-primary-50: #ecfeff;
  --color-primary-100: #cffafe;
  --color-primary-200: #a5f3fc;
  --color-primary-300: #67e8f9;
  --color-primary-400: #22d3ee;
  --color-primary-500: #06b6d4;
  --color-primary-600: #0891b2;
  --color-primary-700: #0e7490;
  --color-primary-800: #155e75;
  --color-primary-900: #164e63;
  --color-primary-950: #083344;
}
```

> ⚠️ **必須使用 `@theme static`**（注意 `static` 關鍵字）
>
> 色階產生：https://uicolors.app
