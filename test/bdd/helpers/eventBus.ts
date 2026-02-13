export function createEventBus() {
  const events: string[] = []

  return {
    emit(eventName: string): void {
      events.push(eventName)
    },

    getEvents(): string[] {
      return [...events]
    },

    clear(): void {
      events.length = 0
    },
  }
}

export type EventBus = ReturnType<typeof createEventBus>
