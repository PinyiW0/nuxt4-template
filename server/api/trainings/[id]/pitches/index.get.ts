import type { H3Event } from 'h3'

import { mockPitches } from '../../../../mock/data/pitches'
import { mockTrainings } from '../../../../mock/data/trainings'

export default defineEventHandler((event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))

  const training = mockTrainings.find(t => t.id === id && t.status === 'active')
  if (!training) {
    throw createError({ statusCode: 404, message: '訓練不存在' })
  }

  const pitches = mockPitches
    .filter(p => p.training_id === id && p.status === 'active')
    .sort((a, b) => a.sequence - b.sequence)
    .map(({ training_id: _tid, trajectory_data: _td, status: _s, ...rest }) => rest)

  return { status: 'success', data: pitches }
})
