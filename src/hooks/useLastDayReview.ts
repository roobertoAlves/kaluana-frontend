import { useStoredObject } from './useStoredObject'

/** RF17: dia da última revisão feita neste aparelho (some com o atalho da tela inicial). */
export function useLastDayReview() {
  const { value, update, loaded } = useStoredObject<{ day: string | null }>('last-day-review', { day: null })
  return { lastDay: value.day, loaded, markReviewed: (day: string) => update({ day }) }
}
