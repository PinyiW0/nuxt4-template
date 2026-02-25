<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const showPassword = ref(false)
const isSubmitting = ref(false)

const schema = z.object({
  account: z.string().trim().min(1, '請輸入帳號'),
  password: z.string().min(1, '請輸入密碼'),
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  account: '',
  password: '',
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (isSubmitting.value)
    return
  isSubmitting.value = true
  try {
    await authStore.login(event.data.account, event.data.password)
    toast.add({ title: '登入成功', color: 'success' })
    await router.push('/')
  }
  catch (error: any) {
    const message = error?.data?.message || '帳號或密碼錯誤'
    toast.add({ title: '登入失敗', description: message, color: 'error' })
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div data-testid="login-page" class="w-full max-w-sm">
    <div class="mb-8 text-center">
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
        鷹眼偵測系統
      </h1>
      <p class="mt-2 text-neutral-500 dark:text-neutral-400">
        智能訓練分析平台
      </p>
    </div>

    <UCard>
      <UForm
        :schema="schema"
        :state="state"
        data-testid="login-form"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          label="帳號"
          name="account"
          class="relative mb-8"
          :ui="{ error: 'absolute top-full left-0 mt-1' }"
        >
          <UInput
            v-model="state.account"
            data-testid="login-account"
            placeholder="請輸入帳號"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="密碼"
          name="password"
          class="relative mb-8"
          :ui="{ error: 'absolute top-full left-0 mt-1' }"
        >
          <UInput
            v-model="state.password"
            data-testid="login-password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="請輸入密碼"
            class="w-full"
          >
            <template #trailing>
              <UButton
                :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                color="neutral"
                variant="link"
                size="sm"
                :padded="false"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <UButton
          type="submit"
          data-testid="login-submit"
          color="primary"
          block
          :loading="isSubmitting"
        >
          登入
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>
