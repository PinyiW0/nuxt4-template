export interface Training {
  id: string
  date: string
  playerId: number
  playerName: string
  teamId: number
  teamName: string
  pitchCount: number
  aiStatus: string
  strikeZoneHeight?: number
  strikeZoneTop?: number
  strikeZoneBottom?: number
  createdBy: string
  createdAt: Date
  status: string
}

export function createTrainingRepository() {
  const trainings = new Map<string, Training>()

  return {
    save(training: Training): Training {
      trainings.set(training.id, { ...training })
      return trainings.get(training.id)!
    },

    findById(id: string): Training | undefined {
      return trainings.get(id)
    },

    findAll(): Training[] {
      return Array.from(trainings.values())
    },

    findAllActive(): Training[] {
      return Array.from(trainings.values()).filter(t => t.status === 'active')
    },

    findByCreatedBy(createdBy: string): Training[] {
      return Array.from(trainings.values()).filter(t => t.createdBy === createdBy && t.status === 'active')
    },

    update(id: string, data: Partial<Training>): Training | undefined {
      const training = trainings.get(id)
      if (!training)
        return undefined
      const updated = { ...training, ...data }
      trainings.set(id, updated)
      return updated
    },

    clear(): void {
      trainings.clear()
    },
  }
}

export type TrainingRepository = ReturnType<typeof createTrainingRepository>
