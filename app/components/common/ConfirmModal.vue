<script setup lang="ts">
type ButtonColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

withDefaults(defineProps<{
  title?: string
  description?: string
  confirmLabel?: string
  confirmColor?: ButtonColor
  cancelLabel?: string
  loading?: boolean
}>(), {
  title: '確認操作',
  description: '確定要執行此操作嗎？',
  confirmLabel: '確認',
  confirmColor: 'primary',
  cancelLabel: '取消',
  loading: false,
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const isOpen = defineModel<boolean>('open', { default: false })

function handleCancel() {
  emit('cancel')
  isOpen.value = false
}
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div data-testid="modal" class="p-6">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
          {{ title }}
        </h3>
        <p class="mt-2 text-neutral-500 dark:text-neutral-400">
          {{ description }}
        </p>
        <div class="mt-6 flex justify-end gap-3">
          <UButton
            data-testid="modal-cancel"
            color="neutral"
            variant="outline"
            :disabled="loading"
            @click="handleCancel"
          >
            {{ cancelLabel }}
          </UButton>
          <UButton
            data-testid="modal-confirm"
            :color="confirmColor"
            :loading="loading"
            @click="emit('confirm')"
          >
            {{ confirmLabel }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
