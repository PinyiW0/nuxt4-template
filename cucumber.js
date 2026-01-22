/**
 * Cucumber Configuration
 *
 * 使用方式：
 * npx cucumber-js --config cucumber.js
 */

module.exports = {
  default: {
    // Feature 檔案路徑
    paths: ['docs/event-storming/examples/*/*.feature'],

    // Step Definitions 路徑
    require: ['docs/event-storming/examples/*/step-definitions/**/*.ts'],

    // TypeScript 支援
    requireModule: ['ts-node/register'],

    // 格式化輸出
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
    ],

    // 並行執行
    parallel: 1,

    // 標籤過濾（可選）
    // tags: '@team or @player',

    // 失敗時重試
    retry: 0,

    // 嚴格模式
    strict: true,

    // 世界參數
    worldParameters: {
      appUrl: 'http://localhost:3000',
    },
  },

  // 只執行快速測試
  quick: {
    paths: ['docs/event-storming/examples/*/*.feature'],
    require: ['docs/event-storming/examples/*/step-definitions/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress-bar'],
    tags: '@query',
  },

  // 執行錯誤場景測試
  errors: {
    paths: ['docs/event-storming/examples/*/*.feature'],
    require: ['docs/event-storming/examples/*/step-definitions/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress-bar'],
    tags: '@error',
  },

  // CI 環境配置
  ci: {
    paths: ['docs/event-storming/examples/*/*.feature'],
    require: ['docs/event-storming/examples/*/step-definitions/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['json:reports/cucumber-report.json'],
    parallel: 4,
    strict: true,
  },
}
