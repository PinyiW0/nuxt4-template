<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()

const schema = z.object({
  account: z.string().min(1, '請輸入帳號'),
  password: z.string().min(1, '請輸入密碼'),
})

type LoginSchema = z.infer<typeof schema>

const state = reactive<LoginSchema>({
  account: '',
  password: '',
})

const loading = ref(false)
const showPassword = ref(false)

async function onSubmit(event: FormSubmitEvent<LoginSchema>) {
  loading.value = true
  try {
    await authStore.login(event.data.account, event.data.password)
    toast.add({ title: '登入成功', color: 'success' })
    await router.push('/')
  }
  catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message
      || (err as { message?: string })?.message
      || '登入失敗，請稍後再試'
    toast.add({ title: message, color: 'error' })
  }
  finally {
    loading.value = false
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
      <UForm :schema="schema" :state="state" @submit="onSubmit">
        <div class="space-y-2">
          <UFormField label="帳號" name="account" required class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }">
            <UInput
              v-model="state.account"
              data-testid="login-account"
              placeholder="請輸入帳號"
              icon="i-heroicons-user"
              class="w-full"
            />
          </UFormField>

          <UFormField label="密碼" name="password" required class="relative mb-8" :ui="{ error: 'absolute top-full left-0 mt-1' }">
            <UInput
              v-model="state.password"
              data-testid="login-password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="請輸入密碼"
              icon="i-heroicons-lock-closed"
              class="w-full"
            >
              <template #trailing>
                <UButton
                  :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  :padded="false"
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
          </UFormField>

          <UButton
            data-testid="login-submit"
            type="submit"
            color="primary"
            block
            :loading="loading"
            class="mt-2"
          >
            登入
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
