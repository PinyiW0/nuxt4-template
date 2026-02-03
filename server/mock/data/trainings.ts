import type { AIStatus, Training } from './types'

// 取得今天的日期字串
function getToday(): string {
  return new Date().toISOString().split('T')[0]!
}

// 取得相對於今天的日期
function getRelativeDate(daysFromToday: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromToday)
  return date.toISOString().split('T')[0]!
}

export const trainings: Training[] = [
  {
    id: 1,
    date: getRelativeDate(-6), // 6天前
    player_id: 1,
    team_id: 1,
    pitch_count: 50,
    ai_status: 'stopped',
    strike_zone_top: 120,
    strike_zone_bottom: 50,
    created_by: 'coach1',
    status: 'active',
    created_at: `${getRelativeDate(-6)}T09:00:00`,
  },
  {
    id: 2,
    date: getToday(), // 今天
    player_id: 1,
    team_id: 1,
    pitch_count: 25,
    ai_status: 'running',
    strike_zone_top: 120,
    strike_zone_bottom: 50,
    created_by: 'coach1',
    status: 'active',
    created_at: `${getToday()}T10:00:00`,
  },
  {
    id: 3,
    date: getRelativeDate(1), // 明天
    player_id: 1,
    team_id: 1,
    pitch_count: 0,
    ai_status: 'stopped',
    strike_zone_top: 120,
    strike_zone_bottom: 50,
    created_by: 'coach1',
    status: 'active',
    created_at: `${getRelativeDate(-1)}T10:00:00`,
  },
  {
    id: 4,
    date: getRelativeDate(-4), // 4天前
    player_id: 3,
    team_id: 2,
    pitch_count: 30,
    ai_status: 'stopped',
    strike_zone_top: 115,
    strike_zone_bottom: 48,
    created_by: 'coach2',
    status: 'active',
    created_at: `${getRelativeDate(-4)}T09:00:00`,
  },
  {
    id: 5,
    date: getRelativeDate(-11), // 11天前 (已刪除)
    player_id: 1,
    team_id: 1,
    pitch_count: 45,
    ai_status: 'stopped',
    strike_zone_top: 120,
    strike_zone_bottom: 50,
    created_by: 'coach1',
    status: 'deleted',
    created_at: `${getRelativeDate(-11)}T09:00:00`,
  },
  {
    id: 6,
    date: getRelativeDate(-3), // 3天前
    player_id: 2,
    team_id: 1,
    pitch_count: 40,
    ai_status: 'stopped',
    strike_zone_top: 125,
    strike_zone_bottom: 52,
    created_by: 'coach1',
    status: 'active',
    created_at: `${getRelativeDate(-3)}T14:00:00`,
  },
]

let nextTrainingId = 7

export function getTrainings(): Training[] {
  return trainings.filter(t => t.status === 'active')
}

export function getTrainingById(id: number): Training | undefined {
  return trainings.find(t => t.id === id && t.status === 'active')
}

export function getTrainingsByCreator(createdBy: string): Training[] {
  return trainings.filter(t => t.created_by === createdBy && t.status === 'active')
}

export function getTrainingsForToday(createdBy?: string, isAdmin: boolean = false): Training[] {
  const today = getToday()
  return trainings.filter((t) => {
    if (t.status !== 'active')
      return false
    if (t.date < today)
      return false // 只顯示今天及未來
    if (!isAdmin && createdBy && t.created_by !== createdBy)
      return false
    return true
  })
}

export function getHistoryTrainings(createdBy?: string, isAdmin: boolean = false): Training[] {
  const today = getToday()
  return trainings.filter((t) => {
    if (t.status !== 'active')
      return false
    if (t.date > today)
      return false // 只顯示今天及過去
    if (!isAdmin && createdBy && t.created_by !== createdBy)
      return false
    return true
  })
}

export function createTraining(data: {
  date: string
  player_id: number
  team_id: number
  created_by: string
  strike_zone_top?: number
  strike_zone_bottom?: number
}): Training {
  const training: Training = {
    id: nextTrainingId++,
    date: data.date,
    player_id: data.player_id,
    team_id: data.team_id,
    pitch_count: 0,
    ai_status: 'stopped',
    strike_zone_top: data.strike_zone_top ?? 120,
    strike_zone_bottom: data.strike_zone_bottom ?? 50,
    created_by: data.created_by,
    status: 'active',
    created_at: new Date().toISOString(),
  }
  trainings.push(training)
  return training
}

export function deleteTraining(id: number): boolean {
  const training = trainings.find(t => t.id === id && t.status === 'active')
  if (training) {
    training.status = 'deleted'
    return true
  }
  return false
}

export function batchDeleteTrainings(ids: number[]): number {
  let deletedCount = 0
  ids.forEach((id) => {
    if (deleteTraining(id)) {
      deletedCount++
    }
  })
  return deletedCount
}

export function updateTrainingAIStatus(id: number, status: AIStatus): Training | undefined {
  const training = trainings.find(t => t.id === id && t.status === 'active')
  if (training) {
    training.ai_status = status
  }
  return training
}

export function updateTrainingStrikeZone(
  id: number,
  top: number,
  bottom: number,
): Training | undefined {
  const training = trainings.find(t => t.id === id && t.status === 'active')
  if (training) {
    training.strike_zone_top = top
    training.strike_zone_bottom = bottom
  }
  return training
}

export function incrementPitchCount(id: number): Training | undefined {
  const training = trainings.find(t => t.id === id && t.status === 'active')
  if (training) {
    training.pitch_count++
  }
  return training
}
