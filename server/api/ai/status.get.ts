import type { H3Event } from 'h3'

import { aiState } from './start.post'

export default defineEventHandler((_event: H3Event) => {
  return {
    status: 'success',
    data: {
      status: aiState.status,
      training_id: aiState.training_id,
    },
  }
})
