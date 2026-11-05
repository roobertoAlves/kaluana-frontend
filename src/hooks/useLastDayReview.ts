import { useStoredObject } from './useStoredObject'


export function useLastDayReview() {
  const { value, update, loaded } = useStoredObject<{ day: string | null }>('last-day-review', { day: null })
  return { lastDay: value.day, loaded, markReviewed: (day: string) => update({ day }) }
}
