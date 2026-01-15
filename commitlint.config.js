export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 自定義規則
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修復錯誤
        'docs', // 文件更新
        'style', // 程式碼風格 (不影響邏輯)
        'refactor', // 重構 (既不是新功能也不是錯誤修復)
        'perf', // 效能優化
        'test', // 增加測試
        'chore', // 建構工具或輔助工具的變動
        'ci', // CI/CD 相關
        'build', // 建構系統或外部相依性變動
        'revert', // 回復先前的 commit
      ],
    ],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case']],
    'subject-max-length': [2, 'always', 100],
    'subject-min-length': [2, 'always', 3],
    'header-max-length': [2, 'always', 100],
  },
}
