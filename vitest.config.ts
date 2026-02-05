import { defineVitestProject } from '@nuxt/test-utils/config'
import { quickpickle } from 'quickpickle'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [quickpickle()],
  test: {
    projects: [
      // 純單元測試 (Node 環境，速度最快)
      {
        test: {
          name: 'unit',
          include: ['test/unit/**/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      // Nuxt 環境測試 (composables、components)
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
      // E2E 測試 (瀏覽器互動)
      {
        test: {
          name: 'e2e',
          include: ['test/e2e/**/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      // BDD 測試 (Gherkin feature 檔案)
      {
        plugins: [quickpickle()],
        test: {
          name: 'bdd',
          include: ['docs/gherkin-spec/features/**/*.feature'],
          setupFiles: ['test/bdd/steps/index.ts'],
          environment: 'node',
        },
      },
    ],
  },
})
