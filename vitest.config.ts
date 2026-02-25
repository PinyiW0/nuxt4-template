import { defineVitestProject } from '@nuxt/test-utils/config'
import { quickpickle } from 'quickpickle'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [quickpickle()],
  test: {
    projects: [
      // Nuxt 環境測試 (composables、components)
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
      // E2E 測試已遷移至 Playwright Test Runner（playwright.config.ts）
      // 執行指令：npm run test:e2e
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
