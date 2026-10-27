import { useCallback, useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { useAuth } from '../context/AuthContext'
import { readJson, writeJson } from '../services/storage'

/** Lista persistida por usuário, recarregada sempre que a tela ganha foco. */
export function useCollection<T extends { id: string }>(name: string) {
  const { user } = useAuth()
  const userId = user?.id ?? 'anon'
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const ref = useRef<T[]>([])

  const reload = useCallback(async () => {
    const list = await readJson<T[]>(userId, name, [])
    ref.current = list
    setItems(list)
    setLoading(false)
  }, [userId, name])

  useFocusEffect(
    useCallback(() => {
      void reload()
    }, [reload]),
  )

  const persist = useCallback(
    async (next: T[]) => {
      ref.current = next
      setItems(next)
      await writeJson(userId, name, next)
    },
    [userId, name],
  )

  return {
    items,
    loading,
    reload,
    add: (item: T) => persist([item, ...ref.current]),
    upsert: (item: T) => {
      const cur = ref.current
      return persist(cur.some((x) => x.id === item.id) ? cur.map((x) => (x.id === item.id ? item : x)) : [item, ...cur])
    },
    remove: (id: string) => persist(ref.current.filter((x) => x.id !== id)),
    replaceAll: persist,
  }
}
