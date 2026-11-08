import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../services/http'
import { readJson, writeJson } from '../services/storage'

export interface ObjectRemote<T> {
  load: (token: string) => Promise<T>
  save: (token: string, value: T) => Promise<T>
}

export function useStoredObject<T>(name: string, initial: T, remote?: ObjectRemote<T>) {
  const { user, accessToken } = useAuth()
  const userId = user?.id ?? 'anon'
  const api = remote && accessToken ? { remote, token: accessToken } : null
  const [value, setValue] = useState<T>(initial)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const cached = await readJson<T>(userId, name, initial)
      if (!alive) return
      setValue(cached)
      if (api) {
        try {
          const fresh = await api.remote.load(api.token)
          if (!alive) return
          setValue(fresh)
          await writeJson(userId, name, fresh)
        } catch (e) {
          if (alive) setError(errorMessage(e, 'Sem conexão. Mostrando os últimos dados salvos.'))
        }
      }
      if (alive) setLoaded(true)
    })()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, name, accessToken])

  const update = useCallback(
    async (next: T): Promise<boolean> => {
      try {
        const saved = api ? await api.remote.save(api.token, next) : next
        setValue(saved)
        setError(null)
        await writeJson(userId, name, saved)
        return true
      } catch (e) {
        setError(errorMessage(e))
        return false
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, name, accessToken],
  )

  return { value, update, loaded, error, clearError: () => setError(null) }
}
