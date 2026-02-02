// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@vueuse/nuxt',
  ],
  css: ['~/assets/css/main.css'],

  // Pinia 配置 - 自動導入 stores
  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  // Nuxt UI 配置
  ui: {
    theme: {
      colors: ['primary', 'secondary', 'tertiary', 'accent', 'info', 'success', 'warning', 'error', 'neutral'],
    },
  },

  // 明暗模式：支援切換，預設跟隨系統
  colorMode: {
    preference: 'system',
  },
  eslint: {
    config: {
      standalone: false,
    },
  },
  typescript: {
    typeCheck: true,
  },
  nitro: {
    prerender: {
      ignore: ['/examples/**'],
    },
  },
})
