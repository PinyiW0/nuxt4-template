<script setup lang="ts">
useHead({
  title: 'Nuxt 4 + TypeScript Template',
  meta: [
    { name: 'description', content: '現代化的 Nuxt 4 與 TypeScript 全端應用程式開發範本' },
    { name: 'keywords', content: 'nuxt, typescript, vue, template, boilerplate' },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
    <div class="container mx-auto px-4 py-16">
      <!-- 標題區塊 -->
      <div class="mb-12 text-center">
        <h1 class="mb-4 text-5xl font-bold text-gray-800">
          Nuxt 4 + TypeScript
        </h1>
        <p class="mb-8 text-xl text-gray-600">
          現代化的全端應用程式開發範本
        </p>
        <div class="flex justify-center space-x-4">
          <span class="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            Nuxt 4.2.1
          </span>
          <span class="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            TypeScript
          </span>
          <span class="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
            Tailwind CSS
          </span>
        </div>
      </div>

      <!-- 功能特色 -->
      <div class="mb-16 grid gap-8 md:grid-cols-3">
        <div class="text-center">
          <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-500">
            <svg class="size-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="mb-2 text-xl font-semibold">
            高效能
          </h3>
          <p class="text-gray-600">
            基於 Vite 和 Nitro 的快速建構工具
          </p>
        </div>

        <div class="text-center">
          <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-500">
            <svg class="size-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="mb-2 text-xl font-semibold">
            型別安全
          </h3>
          <p class="text-gray-600">
            完整的 TypeScript 支援和型別檢查
          </p>
        </div>

        <div class="text-center">
          <div class="mx-auto mb-4 flex  size-16 items-center justify-center rounded-full bg-purple-500">
            <svg class="size-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
          </div>
          <h3 class="mb-2 text-xl font-semibold">
            現代化
          </h3>
          <p class="text-gray-600">
            最新的 Vue 3 生態系統和開發工具
          </p>
        </div>
      </div>

      <!-- 行動按鈕 -->
      <div class="text-center">
        <div class="space-y-4 sm:flex sm:justify-center sm:space-x-4 sm:space-y-0">
          <NuxtLink
            to="/templates"
            class="inline-block rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            儀表板範本
          </NuxtLink>
          <NuxtLink
            to="/examples"
            class="inline-block rounded-lg bg-green-600 px-8 py-3 font-medium text-white transition-colors hover:bg-green-700"
          >
            查看範例
          </NuxtLink>
          <a
            href="https://github.com/OsenseTech/nuxt4-template"
            target="_blank"
            class="inline-block rounded-lg bg-gray-600 px-8 py-3 font-medium text-white transition-colors hover:bg-gray-700"
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
