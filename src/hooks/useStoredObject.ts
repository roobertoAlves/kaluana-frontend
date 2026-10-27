import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { readJson, writeJson } from '../services/storage'

export function useStoredObject<T>(name: string, initial: T) {
  const { user } = useAuth()
  const userId = user?.id ?? 'anon'
  const [value, setValue] = useState<T>(initial)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let alive = true
    readJson<T>(userId, name, initial).then((v) => {
      if (alive) {
        setValue(v)
        setLoaded(true)
      }
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, name])

  const update = useCallback(
    (next: T) => {
      setValue(next)
      return writeJson(userId, name, next)
    },
    [userId, name],
  )

  return { value, update, loaded }
}
