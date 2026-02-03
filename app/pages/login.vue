<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'

definePageMeta({
  layout: 'auth',
})

const { login, isLoading, isAuthenticated } = useAuth()
const router = useRouter()

// 已登入則導向首頁
watch(isAuthenticated, (value) => {
  if (value) {
    router.push('/')
  }
}, { immediate: true })

// 表單 Schema
const schema = z.object({
  account: z.string().min(1, '請輸入帳號'),
  password: z.string().min(1, '請輸入密碼'),
})

type Schema = z.output<typeof schema>

// 表單狀態
const state = reactive<Schema>({
  account: '',
  password: '',
})

// 密碼可見性
const showPassword = ref(false)

// 提交表單
async function onSubmit(event: FormSubmitEvent<Schema>) {
  await login(event.data.account, event.data.password)
}
</script>

<template>
  <UCard class="w-full">
    <template #header>
      <div class="text-center">
        <h2 class="text-xl font-semibold text-neutral-900 dark:text-white">
          登入系統
        </h2>
        <p class="mt-1 text-sm text-neutral-400">
          請輸入您的帳號密碼
        </p>
      </div>
    </template>

    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField
        label="帳號"
        name="account"
        required
        class="relative mb-8"
        :ui="{ error: 'absolute top-full left-0 mt-1' }"
      >
        <UInput
          v-model="state.account"
          class="w-full"
          placeholder="請輸入帳號"
          icon="i-heroicons-user"
          autocomplete="username"
          :disabled="isLoading"
        />
      </UFormField>

      <UFormField
        label="密碼"
        name="password"
        required
        class="relative mb-8"
        :ui="{ error: 'absolute top-full left-0 mt-1' }"
      >
        <UInput
          v-model="state.password"
          class="w-full"
          :type="showPassword ? 'text' : 'password'"
          placeholder="請輸入密碼"
          icon="i-heroicons-lock-closed"
          autocomplete="current-password"
          :disabled="isLoading"
          :ui="{ trailing: 'pointer-events-auto' }"
        >
          <template #trailing>
            <UButton
              :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
              variant="link"
              color="neutral"
              size="xs"
              :disabled="isLoading"
              @click="showPassword = !showPassword"
            />
          </template>
        </UInput>
      </UFormField>

      <UButton
        type="submit"
        block
        :loading="isLoading"
        :disabled="isLoading"
      >
        登入
      </UButton>
    </UForm>

    <template #footer>
      <div class="text-center text-sm text-neutral-500">
        <p>測試帳號：admin / admin123 或 coach1 / pass123</p>
      </div>
    </template>
  </UCard>
</template>
