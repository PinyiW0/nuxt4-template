# Phase 3: 路由骨架

## 必讀規範

```
僅需讀取：
- docs/route-map.yaml（Phase 0 產生的路由對照表）

若存在，額外讀取（testid 來源）：
- docs/e2e-flows/pages/*.elements.md（各頁面的 testid 定義）
```

> ⚠️ 若 `pages/*.elements.md` 存在，頁面骨架的 `data-testid` **必須**使用該檔案定義的 testid，不可自行命名。
> 若不存在，按 [rules.md](../rules.md) > testid 規範 的命名規則自行定義。

## 執行步驟

1. **讀取路由規劃表**（`docs/route-map.yaml`）
2. **檢查 `docs/e2e-flows/pages/` 是否存在 elements.md 檔案**
   - 存在 → 讀取對應頁面的 elements.md，提取 testid
   - 不存在 → 按命名規則定義 testid
3. **根據路由規劃建立所有頁面空殼**（帶入 testid）
4. **每個頁面只包含基本結構**
5. **詢問用戶確認**

## 頁面空殼範例

```vue
<!-- app/pages/login.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'auth' })
</script>

<template>
  <div data-testid="login-page">
    <!-- Phase 6 實作：登入表單 -->
    <p class="text-neutral-500">登入頁面（待實作）</p>
  </div>
</template>
```

```vue
<!-- app/pages/teams/index.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <div data-testid="teams-page" class="flex h-full flex-col">
    <!-- Phase 6 實作：球隊列表 -->
    <p class="text-neutral-500">球隊列表頁面（待實作）</p>
  </div>
</template>
```

```vue
<!-- app/pages/teams/[id].vue -->
<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const teamId = computed(() => route.params.id)
</script>

<template>
  <div data-testid="team-detail-page" class="flex h-full flex-col">
    <!-- Phase 6 實作：球隊詳情 -->
    <p class="text-neutral-500">球隊詳情頁面 #{{ teamId }}（待實作）</p>
  </div>
</template>
```

## 輸出結構

```
app/pages/
├── login.vue
├── index.vue
├── teams/
│   ├── index.vue
│   └── [id].vue
└── players/
    └── index.vue
```
