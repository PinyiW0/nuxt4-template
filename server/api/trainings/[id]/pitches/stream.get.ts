import type { H3Event } from 'h3'

// SSE 端點：模擬即時投球更新
export default defineEventHandler((event: H3Event) => {
  const _id = Number(getRouterParam(event, 'id'))

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })

  // Mock SSE：每 3 秒送一顆模擬投球
  let sequence = 100
  const interval = setInterval(() => {
    sequence++
    const pitch = {
      id: Date.now(),
      sequence,
      time: new Date().toISOString(),
      velocity: 120 + Math.round(Math.random() * 15 * 10) / 10,
      spin_rate: 2000 + Math.round(Math.random() * 500),
      is_strike: Math.random() > 0.4,
      location_x: Math.round((Math.random() * 0.8 - 0.4) * 100) / 100,
      location_y: Math.round((Math.random() * 1.2 + 0.2) * 100) / 100,
    }

    event.node.res.write(`data: ${JSON.stringify(pitch)}\n\n`)
  }, 3000)

  // 連線關閉時清除 interval
  event.node.req.on('close', () => {
    clearInterval(interval)
  })

  // 不要結束 response（SSE 持續連線）
  event._handled = true
})
