export default defineEventHandler(async () => {
  // Mock logout - 實際應該將 token 加入黑名單
  return {
    status: 'success',
    message: '登出成功',
  }
})
