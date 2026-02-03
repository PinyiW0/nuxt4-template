<script setup lang="ts">
interface Props {
  placeholder?: string
  debounce?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜尋...',
  debounce: 300,
})

const modelValue = defineModel<string>({ default: '' })

// Debounced search value
const searchValue = ref(modelValue.value)
const debouncedValue = refDebounced(searchValue, props.debounce)

// Sync debounced value to model
watch(debouncedValue, (value) => {
  modelValue.value = value
})

// Sync model to local value (for external updates)
watch(modelValue, (value) => {
  if (value !== searchValue.value) {
    searchValue.value = value
  }
})

function clear() {
  searchValue.value = ''
  modelValue.value = ''
}
</script>

<template>
  <UInput
    v-model="searchValue"
    :placeholder="props.placeholder"
    icon="i-heroicons-magnifying-glass"
    class="w-64"
    :ui="{ trailing: 'pointer-events-auto' }"
  >
    <template v-if="searchValue" #trailing>
      <UButton
        icon="i-heroicons-x-mark"
        variant="link"
        color="neutral"
        size="xs"
        @click="clear"
      />
    </template>
  </UInput>
</template>
