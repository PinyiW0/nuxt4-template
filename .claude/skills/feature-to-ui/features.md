# 額外功能元件規範（additionalFeatures）

> 本檔定義 PM yaml `additionalFeatures` 各功能的實作規範。
> Phase 5 建立 wrapper 元件，Phase 6 在頁面中使用。
> 只有 `route-map.yaml > enabled_features` 中列出的功能才需要實作。
>
> **套件版本以本檔為準**，`ui-config.yaml` 只決定功能是否啟用。

---

## charts — 統計圖表

### 套件

```bash
npm install vue-chartjs chart.js
```

### Phase 5 建立元件

```vue
<!-- app/components/common/ChartWrapper.vue -->
<script setup lang="ts">
import { Bar, Doughnut, Line } from 'vue-chartjs'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, ArcElement)

defineProps<{
  type: 'bar' | 'line' | 'doughnut'
  data: { labels: string[], datasets: { label: string, data: number[], backgroundColor?: string | string[] }[] }
  options?: Record<string, unknown>
}>()
</script>

<template>
  <div class="relative">
    <Bar v-if="type === 'bar'" :data="data" :options="options" />
    <Line v-else-if="type === 'line'" :data="data" :options="options" />
    <Doughnut v-else-if="type === 'doughnut'" :data="data" :options="options" />
  </div>
</template>
```

### Phase 6 使用方式

```vue
<ChartWrapper
  type="bar"
  :data="{ labels: ['一月', '二月'], datasets: [{ label: '次數', data: [10, 20] }] }"
/>
```

### route-map 標記

`features_used: [charts]` — 通常用於統計/分析頁面。

---

## dragAndDrop — 拖曳排序

### 套件

```bash
npm install vuedraggable@next
```

### Phase 1 影響

需建立 sort API 端點：

```typescript
// server/api/{resource}/sort.put.ts
import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event) as { ids: number[] }
  // 更新 mock 資料的排序
  return { status: 'success' as const, message: '排序已更新' }
})
```

### Phase 5 建立元件

```vue
<!-- app/components/common/DraggableList.vue -->
<script setup lang="ts">
import Draggable from 'vuedraggable'

const items = defineModel<{ id: number, [key: string]: unknown }[]>('items', { required: true })

defineProps<{
  itemKey?: string
  handle?: string
}>()

const emit = defineEmits<{
  sorted: [ids: number[]]
}>()

function onEnd() {
  emit('sorted', items.value.map(item => item.id))
}
</script>

<template>
  <Draggable
    v-model="items"
    :item-key="itemKey ?? 'id'"
    :handle="handle"
    @end="onEnd"
  >
    <template #item="{ element }">
      <slot :element="element" />
    </template>
  </Draggable>
</template>
```

### Phase 6 使用方式

```vue
<DraggableList v-model:items="sortedList" @sorted="handleSort">
  <template #default="{ element }">
    <div class="flex items-center gap-2 border-b p-3">
      <UIcon name="i-heroicons-bars-3" class="cursor-grab" />
      <span>{{ element.name }}</span>
    </div>
  </template>
</DraggableList>
```

---

## richTextEditor — 富文本編輯器

### 套件

```bash
npm install @tiptap/vue-3 @tiptap/starter-kit @tiptap/extension-placeholder
```

### Phase 5 建立元件

```vue
<!-- app/components/common/RichTextEditor.vue -->
<script setup lang="ts">
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'

const props = defineProps<{
  placeholder?: string
}>()

const content = defineModel<string>({ default: '' })

const editor = useEditor({
  content: content.value,
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: props.placeholder ?? '請輸入內容...' }),
  ],
  onUpdate: ({ editor: e }) => {
    content.value = e.getHTML()
  },
})

watch(content, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val)
  }
})
</script>

<template>
  <div class="rounded-md border border-neutral-200 dark:border-neutral-800">
    <!-- 工具列 -->
    <div v-if="editor" class="flex gap-1 border-b border-neutral-200 p-2 dark:border-neutral-800">
      <UButton size="xs" variant="ghost" color="neutral" :class="{ 'bg-neutral-100 dark:bg-neutral-800': editor.isActive('bold') }" @click="editor.chain().focus().toggleBold().run()">
        B
      </UButton>
      <UButton size="xs" variant="ghost" color="neutral" :class="{ 'bg-neutral-100 dark:bg-neutral-800': editor.isActive('italic') }" @click="editor.chain().focus().toggleItalic().run()">
        I
      </UButton>
      <UButton size="xs" variant="ghost" color="neutral" :class="{ 'bg-neutral-100 dark:bg-neutral-800': editor.isActive('bulletList') }" @click="editor.chain().focus().toggleBulletList().run()">
        •
      </UButton>
    </div>
    <EditorContent :editor="editor" class="prose prose-sm max-w-none p-3 dark:prose-invert" />
  </div>
</template>
```

### Phase 6 使用方式

```vue
<RichTextEditor v-model="formData.content" placeholder="請輸入文章內容..." />
```

### Phase 1 影響

確保對應 API 欄位使用 `string` 型別（存放 HTML 內容）。

---

## advancedDatePicker — 進階日期時間選擇器

### 套件

```bash
npm install @vuepic/vue-datepicker
```

### Phase 5 建立元件

```vue
<!-- app/components/common/DateRangePicker.vue -->
<script setup lang="ts">
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const dateRange = defineModel<[Date, Date] | null>({ default: null })

defineProps<{
  placeholder?: string
}>()
</script>

<template>
  <VueDatePicker
    v-model="dateRange"
    range
    :placeholder="placeholder ?? '選擇日期範圍'"
    :enable-time-picker="false"
    auto-apply
    class="w-full"
  />
</template>
```

### Phase 6 使用方式

```vue
<DateRangePicker v-model="filters.dateRange" placeholder="篩選日期範圍" />
```

---

## fileUpload — 檔案上傳

### Phase 1 影響

需建立 upload API 端點：

```typescript
// server/api/upload.post.ts
import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const formData = await readMultipartFormData(event)
  // Mock：回傳假的檔案 URL
  return {
    status: 'success' as const,
    data: { url: `/uploads/mock-${Date.now()}.png`, name: 'uploaded-file.png' },
  }
})
```

### Phase 5 建立元件

```vue
<!-- app/components/common/FileUpload.vue -->
<script setup lang="ts">
const props = withDefaults(defineProps<{
  accept?: string
  maxSizeMb?: number
}>(), {
  accept: 'image/*',
  maxSizeMb: 5,
})

const emit = defineEmits<{
  uploaded: [data: { url: string, name: string }]
  error: [message: string]
}>()

const isDragging = ref(false)
const isUploading = ref(false)

async function handleFiles(files: FileList | null) {
  if (!files?.length) return
  const file = files[0]!

  if (file.size > props.maxSizeMb * 1024 * 1024) {
    emit('error', `檔案大小不可超過 ${props.maxSizeMb}MB`)
    return
  }

  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const result = await $fetch('/api/upload', { method: 'POST', body: formData })
    emit('uploaded', result.data)
  }
  catch {
    emit('error', '上傳失敗')
  }
  finally {
    isUploading.value = false
  }
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  handleFiles(e.dataTransfer?.files ?? null)
}
</script>

<template>
  <div
    class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors"
    :class="isDragging
      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
      : 'border-neutral-300 hover:border-neutral-400 dark:border-neutral-700'"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="onDrop"
    @click="($refs.input as HTMLInputElement).click()"
  >
    <UIcon name="i-heroicons-cloud-arrow-up" class="size-8 text-neutral-400" />
    <p class="mt-2 text-sm text-neutral-500">點擊或拖放檔案上傳</p>
    <p class="text-xs text-neutral-400">最大 {{ maxSizeMb }}MB</p>
    <input ref="input" type="file" class="hidden" :accept="accept" @change="handleFiles(($event.target as HTMLInputElement).files)">
    <UButton v-if="isUploading" loading disabled class="mt-2">上傳中...</UButton>
  </div>
</template>
```

### Phase 6 使用方式

```vue
<FileUpload accept="image/*" :max-size-mb="5" @uploaded="formData.avatar = $event.url" @error="showError" />
```

---

## infiniteScroll — 無限滾動

### 不需額外套件

使用 `IntersectionObserver` 原生 API。

### Phase 5 建立元件

```vue
<!-- app/components/common/InfiniteScroll.vue -->
<script setup lang="ts">
const props = defineProps<{
  loading: boolean
  hasMore: boolean
}>()

const emit = defineEmits<{
  loadMore: []
}>()

const sentinel = ref<HTMLElement>()

onMounted(() => {
  if (!sentinel.value) return
  const observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting && !props.loading && props.hasMore) {
      emit('loadMore')
    }
  })
  observer.observe(sentinel.value)
  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <div>
    <slot />
    <div ref="sentinel" class="h-1" />
    <div v-if="loading" class="flex justify-center py-4">
      <UIcon name="i-heroicons-arrow-path" class="size-5 animate-spin text-neutral-400" />
    </div>
    <p v-else-if="!hasMore" class="py-4 text-center text-sm text-neutral-400">
      沒有更多資料了
    </p>
  </div>
</template>
```

### Phase 6 使用方式

```vue
<InfiniteScroll :loading="isFetching" :has-more="hasNextPage" @load-more="fetchNextPage">
  <div v-for="item in items" :key="item.id">{{ item.name }}</div>
</InfiniteScroll>
```

### 注意

啟用 `infiniteScroll` 的列表頁**不使用 `ListContainer`（含分頁）**，改用此元件。Phase 0 標記 `features_used: [infiniteScroll]` 時，該路由的 `components` 不應包含 `ListContainer`。
