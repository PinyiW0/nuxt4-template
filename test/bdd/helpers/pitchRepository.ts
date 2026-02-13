export interface Pitch {
  id: string
  trainingId: string
  speed: number
  strikeOrBall: string
  status: string
  // Feature 17-19 擴充欄位
  sequence?: number
  time?: string
  spinRate?: number
  isStrike?: boolean
  locationX?: number
  locationY?: number
  trajectoryData?: string
}

export function createPitchRepository() {
  const pitches = new Map<string, Pitch>()

  return {
    save(pitch: Pitch): Pitch {
      pitches.set(pitch.id, { ...pitch })
      return pitches.get(pitch.id)!
    },

    findById(id: string): Pitch | undefined {
      return pitches.get(id)
    },

    findByTrainingId(trainingId: string): Pitch[] {
      return Array.from(pitches.values()).filter(p => p.trainingId === trainingId)
    },

    update(id: string, data: Partial<Pitch>): Pitch | undefined {
      const pitch = pitches.get(id)
      if (!pitch)
        return undefined
      const updated = { ...pitch, ...data }
      pitches.set(id, updated)
      return updated
    },

    clear(): void {
      pitches.clear()
    },
  }
}

export type PitchRepository = ReturnType<typeof createPitchRepository>
