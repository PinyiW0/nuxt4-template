export default defineAppConfig({
  ui: {
    colors: {
      primary: 'rose', // 被 @theme static 覆蓋為珊瑚紅 #FF6F61
      secondary: 'orange', // 被 @theme static 覆蓋為蜜桃色 #FFAB91
      tertiary: 'slate', // Tailwind 內建（≈ #E0E7EE）
      accent: 'slate', // Tailwind 內建（≈ #E0E7EE）
      success: 'emerald', // Tailwind 內建（≈ #059669）
      warning: 'amber', // Tailwind 內建（≈ #d97708）
      error: 'red', // Tailwind 內建（≈ #dc2626）
      info: 'blue', // Tailwind 內建（≈ #2563eb）
      neutral: 'slate', // 被 @theme static 覆蓋為深灰藍 #222831
    },
  },
})
