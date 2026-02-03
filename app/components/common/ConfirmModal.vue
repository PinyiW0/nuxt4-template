<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: 'primary' | 'error' | 'warning' | 'success'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '確認操作',
  description: '確定要執行此操作嗎？',
  confirmLabel: '確認',
  cancelLabel: '取消',
  confirmColor: 'error',
  loading: false,
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const isOpen = defineModel<boolean>('open', { default: false })

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
  isOpen.value = false
}
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div class="p-6">
        <div class="flex items-start gap-4">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-error-500/10">
            <UIcon name="i-heroicons-exclamation-triangle" class="size-6 text-error-500" />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
              {{ props.title }}
            </h3>
            <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              {{ props.description }}
            </p>
            <slot />
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <UButton
            :label="props.cancelLabel"
            color="neutral"
            variant="outline"
            :disabled="props.loading"
            @click="handleCancel"
          />
          <UButton
            :label="props.confirmLabel"
            :color="props.confirmColor"
            :loading="props.loading"
            :disabled="props.loading"
            @click="handleConfirm"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
